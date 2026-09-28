"use client";

import { useState } from "react";
import { IMAGE_MAX_BYTES, IMAGE_MAX_MB, isAllowedImageType } from "@/constants/platform/upload.const";
import { withCoverCrop } from "@/lib/cloudinary-url";
import { createUploadSignature } from "@/services/media/media.actions";
import type { ImageSaveResult } from "@/services/media/media.types";

export type ImageUploadStatus =
  | { kind: "idle" }
  | { kind: "uploading" }
  | { kind: "saving" }
  | { kind: "saved" }
  | { kind: "error"; message: string };

interface UseImageUploadOptions {
  /** The image already saved, if any. */
  initialUrl?: string;
  /** Ratio the uploaded image is cropped to: "21:9", "1:1". */
  aspectRatio: string;
  /**
   * Stores the image the moment it changes: a server action, given the new
   * URL, or `""` when the image is taken away. Without it the URL only lives
   * here, and it is whoever mounts the hook who sends it in a form.
   */
  save?: (url: string) => Promise<ImageSaveResult>;
}

/**
 * The upload of an image to Cloudinary, without its looks: `ImageUpload`
 * draws a cover with it and the author's form a round photo.
 *
 * The file goes from the browser to Cloudinary DIRECTLY, with a signature
 * requested from the server: neither the credentials come down to the
 * browser nor the bytes go up through our server, which besides has a 1 MB
 * cap per request in server actions — less than many photos.
 *
 * On upload it is normalised to the target ratio with a crop in the URL
 * itself (see lib/cloudinary-url), which is what fixes a photo of another
 * shape. An image already exported in that ratio stays as it is.
 *
 * With `save`, uploading IS saving: the image is stored as soon as it is up,
 * and taking it away is stored too. What is shown is what is stored: if the
 * save fails, the image goes back to the one there was.
 */
export function useImageUpload({ initialUrl, aspectRatio, save }: UseImageUploadOptions) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [status, setStatus] = useState<ImageUploadStatus>({ kind: "idle" });

  /** Shows the image and, when there is somewhere to store it, stores it. */
  const commit = async (next: string, failure: string) => {
    if (!save) {
      setUrl(next);
      setStatus({ kind: "idle" });
      return;
    }

    const previous = url;
    // Shown at once, while it is being stored: the upload already took its time.
    setUrl(next);
    setStatus({ kind: "saving" });
    try {
      const result = await save(next);
      if (result.ok) {
        setStatus({ kind: "saved" });
        return;
      }
    } catch {
      // Falls through to the failure below: a network error is a failed save too.
    }
    setUrl(previous);
    setStatus({ kind: "error", message: failure });
  };

  const upload = async (file: File) => {
    // Checked here to say so instantly; the real authority is Cloudinary,
    // which rejects whatever does not match the signature.
    if (!isAllowedImageType(file.type)) {
      setStatus({ kind: "error", message: "Tiene que ser una imagen JPG, PNG, WebP o AVIF." });
      return;
    }
    if (file.size > IMAGE_MAX_BYTES) {
      setStatus({ kind: "error", message: `La imagen pesa más de ${IMAGE_MAX_MB} MB. Expórtala más ligera.` });
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
      // is shown here is exactly what will be seen everywhere else.
      await commit(
        withCoverCrop(uploaded.secure_url, "auto", aspectRatio),
        "La imagen se subió, pero no se pudo guardar. Vuelve a subirla.",
      );
    } catch {
      setStatus({ kind: "error", message: "La subida falló. Inténtalo otra vez." });
    }
  };

  /** Takes the image away; what was uploaded stays in Cloudinary, unused. */
  const clear = () => commit("", "No se pudo quitar la imagen. Inténtalo otra vez.");

  return {
    url,
    status,
    /** Busy with the file or with storing it: nothing else should be started meanwhile. */
    isUploading: status.kind === "uploading" || status.kind === "saving",
    upload,
    clear,
  };
}
