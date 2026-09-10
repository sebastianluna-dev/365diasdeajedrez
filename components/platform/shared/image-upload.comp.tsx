"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImageIcon } from "@/components/icons/image-icon.comp";
import { IMAGE_ACCEPT, IMAGE_MAX_BYTES, isAllowedImageType } from "@/constants/platform/upload.const";
import { withCoverCrop } from "@/lib/cloudinary-url";
import { isDisplayableImage } from "@/lib/remote-image";
import { createUploadSignature } from "@/services/media/media.actions";
import "./image-upload.comp.css";

interface ImageUploadProps {
  /** Name of the field that travels in the form, with the URL as its value. */
  name: string;
  /**
   * Id of the `<form>` the field belongs to, when the component lives outside
   * it. It is what lets the cover be managed in its own card and saved with
   * the rest of the metadata.
   */
  form?: string;
  /** The image it already has saved, if any. */
  defaultValue?: string;
  /** What it is and in which ratio: "Portada del curso". */
  label: string;
  /** Ratio of the box and of the crop: "21:9". */
  aspectRatio?: string;
  hint?: string;
}

type Status = { kind: "idle" } | { kind: "uploading" } | { kind: "error"; message: string };

const MAX_MB = Math.round(IMAGE_MAX_BYTES / (1024 * 1024));

/**
 * Uploads an image to Cloudinary and leaves its URL in the form that saves it.
 *
 * EVERYTHING happens here: the file is dragged or chosen, the result is seen
 * and removed. The URL is neither shown nor asked for — whoever manages a
 * course has no reason to know what Cloudinary is —; it travels in a hidden
 * field and is saved when the form is saved, like the rest of the fields.
 *
 * The file goes from the browser to Cloudinary DIRECTLY, with a signature
 * requested from the server: neither the credentials come down to the
 * browser nor the bytes go up through our server, which besides has a 1 MB
 * cap per request in server actions — less than many photos.
 *
 * On upload it is normalised to the target ratio with a crop in the URL
 * itself (see lib/cloudinary-url), which is what fixes a square photo. An
 * image already exported in that ratio stays as it is.
 */
export function ImageUpload({
  name,
  form,
  defaultValue,
  label,
  aspectRatio = "21:9",
  hint,
}: ImageUploadProps) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isUploading = status.kind === "uploading";
  const hasImage = isDisplayableImage(url);
  const boxRatio = aspectRatio.replace(":", " / ");

  const upload = async (file: File) => {
    // Checked here to say so instantly; the real authority is Cloudinary,
    // which rejects whatever does not match the signature.
    if (!isAllowedImageType(file.type)) {
      setStatus({ kind: "error", message: "Tiene que ser una imagen JPG, PNG, WebP o AVIF." });
      return;
    }
    if (file.size > IMAGE_MAX_BYTES) {
      setStatus({ kind: "error", message: `La imagen pesa más de ${MAX_MB} MB. Expórtala más ligera.` });
      return;
    }

    setStatus({ kind: "uploading" });
    const signature = await createUploadSignature();
    if (!signature) {
      setStatus({ kind: "error", message: "No se pudo preparar la subida. Vuelve a intentarlo." });
      return;
    }

    const body = new FormData();
    body.append("file", file);
    body.append("api_key", signature.apiKey);
    body.append("timestamp", String(signature.timestamp));
    body.append("folder", signature.folder);
    // It is signed: changing it here would invalidate the signature, which is the point.
    body.append("allowed_formats", signature.allowedFormats);
    body.append("signature", signature.signature);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`, {
        method: "POST",
        body,
      });
      if (!response.ok) throw new Error(String(response.status));

      const uploaded: { secure_url?: string } = await response.json();
      if (!uploaded.secure_url) throw new Error("sin URL");

      // Cropped from the start to the ratio it will be seen in: that way what
      // is shown here is exactly what the student will see.
      setUrl(withCoverCrop(uploaded.secure_url, "auto", aspectRatio));
      setStatus({ kind: "idle" });
    } catch {
      setStatus({ kind: "error", message: "La subida falló. Inténtalo otra vez." });
    }
  };

  const pick = (file: File | undefined) => {
    if (file) void upload(file);
  };

  return (
    <div className="image-upload">
      {/* The only thing the form sees. */}
      <input type="hidden" name={name} value={url} form={form} />

      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        className="image-upload__file"
        onChange={(event) => {
          const file = event.target.files?.[0];
          // The value is cleared so that choosing the same file TWICE fires the
          // change again.
          event.target.value = "";
          pick(file);
        }}
      />

      {/* With an image it is only a preview: neither a drop zone nor a button.
          When it was one, dragging the image itself back — which is what a
          browser does with any `<img>` — fired another upload of the same
          photo. Dragging returns when it is removed; changing it is still on
          its button. */}
      {hasImage ? (
        <div
          className="image-upload__drop image-upload__drop_state_filled"
          style={{ aspectRatio: boxRatio }}
        >
          <Image
            src={url}
            alt=""
            fill
            sizes="440px"
            // Not draggable out or back in: it is not a file the staff is
            // handling, it is what is already saved.
            draggable={false}
            className="image-upload__image"
          />
        </div>
      ) : (
        /* Empty: dragging or pressing lead to the same place. It is a `<button>`
           so the keyboard can open it too. */
        <button
          type="button"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            pick(event.dataTransfer.files?.[0]);
          }}
          className={`image-upload__drop${dragging ? " image-upload__drop_state_over" : ""}`}
          style={{ aspectRatio: boxRatio }}
          aria-label={`Subir ${label.toLowerCase()}`}
        >
          <span className="image-upload__placeholder">
            <ImageIcon className="image-upload__placeholder-icon" />
            <span className="image-upload__placeholder-title">
              {label} · {aspectRatio}
            </span>
            <span className="image-upload__placeholder-hint">
              {isUploading ? "Subiendo…" : "Arrastra la imagen o pulsa para elegirla"}
            </span>
          </span>
        </button>
      )}

      <div className="image-upload__actions">
        {/* Choosing a file is still one click away: what called for removing it
            before was dragging, because there the gesture gets confused with moving the photo. */}
        <button
          type="button"
          className="image-upload__action image-upload__action_variant_primary"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? "Subiendo…" : hasImage ? "Cambiar imagen" : "Subir imagen"}
        </button>

        {url && (
          <button
            type="button"
            className="image-upload__remove"
            onClick={() => {
              setUrl("");
              setStatus({ kind: "idle" });
            }}
          >
            Quitar
          </button>
        )}
      </div>

      {status.kind === "error" ? (
        <p className="image-upload__error" role="alert">
          {status.message}
        </p>
      ) : (
        <p className="image-upload__hint">{hint}</p>
      )}
    </div>
  );
}
