"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImageIcon } from "@/components/icons/image-icon.comp";
import { IMAGE_ACCEPT } from "@/constants/platform/upload.const";
import { isDisplayableImage } from "@/lib/remote-image";
import "./image-upload.comp.css";
import type { ImageSaveResult } from "@/services/media/media.types";
import { useImageUpload } from "./use-image-upload.hook";

interface ImageUploadProps {
  /**
   * The server action that stores the image, already bound to what it
   * belongs to. It is called with the new URL the moment the upload ends, and
   * with `""` when the image is taken away.
   */
  action: (url: string) => Promise<ImageSaveResult>;
  /** The image it already has saved, if any. */
  defaultValue?: string;
  /** What it is and in which ratio: "Portada del curso". */
  label: string;
  /** Ratio of the box and of the crop: "21:9". */
  aspectRatio?: string;
}

/**
 * Uploads an image to Cloudinary and stores it.
 *
 * EVERYTHING happens here: the file is dragged or chosen, the result is seen
 * and removed, and each of those is saved by itself. Uploading IS saving:
 * until 2026-09-28 the URL travelled in a hidden field of the metadata form,
 * in another column, and an image uploaded without pressing that form's
 * button was lost without a word. The URL is neither shown nor asked for —
 * whoever manages a course has no reason to know what Cloudinary is.
 *
 * The file goes from the browser to Cloudinary DIRECTLY, with a signature
 * requested from the server: neither the credentials come down to the
 * browser nor the bytes go up through our server, which besides has a 3 MB
 * cap per request in server actions — less than many photos.
 *
 * On upload it is normalised to the target ratio with a crop in the URL
 * itself (see lib/cloudinary-url), which is what fixes a square photo. An
 * image already exported in that ratio stays as it is.
 *
 * Under the box goes only what has just happened — the image is stored, or it
 * could not be — and nothing while nothing has. What the formats and the size
 * are is said by the "i" of the card that holds it (`PlatformInfoTip`): it
 * helps the first time and is noise every time after.
 */
export function ImageUpload({ action, defaultValue, label, aspectRatio = "21:9" }: ImageUploadProps) {
  const { url, status, isUploading, upload, clear } = useImageUpload({
    initialUrl: defaultValue,
    aspectRatio,
    save: action,
  });
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasImage = isDisplayableImage(url);
  const boxRatio = aspectRatio.replace(":", " / ");

  const busyLabel = status.kind === "uploading" ? "Subiendo…" : status.kind === "saving" ? "Guardando…" : undefined;

  const pick = (file: File | undefined) => {
    if (file) void upload(file);
  };

  return (
    <div className="image-upload">
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
        <div className="image-upload__drop image-upload__drop_state_filled" style={{ aspectRatio: boxRatio }}>
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
              {busyLabel ?? "Arrastra la imagen o pulsa para elegirla"}
            </span>
          </span>
        </button>
      )}

      <div className="image-upload__actions">
        {/* Choosing a file is still one click away: what called for removing it
            before was dragging, because there the gesture gets confused with moving the photo. */}
        <button
          type="button"
          className="platform-button platform-button_size_compact"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {busyLabel ?? (hasImage ? "Cambiar imagen" : "Subir imagen")}
        </button>

        {url && (
          <button type="button" className="image-upload__remove" disabled={isUploading} onClick={() => void clear()}>
            Quitar
          </button>
        )}
      </div>

      {status.kind === "error" && (
        <p className="image-upload__note image-upload__note_state_error" role="alert">
          {status.message}
        </p>
      )}

      {/* What was just done, said once it is true: the image is stored. */}
      {status.kind === "saved" && (
        <p className="image-upload__note image-upload__note_state_saved" role="status">
          {hasImage ? "Imagen guardada." : "Imagen quitada."}
        </p>
      )}
    </div>
  );
}
