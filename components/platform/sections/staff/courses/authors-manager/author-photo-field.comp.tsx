"use client";

import { useRef } from "react";
import { useImageUpload } from "@/components/platform/shared/use-image-upload.hook";
import { IMAGE_ACCEPT } from "@/constants/platform/upload.const";
import { AuthorAvatar } from "./author-avatar.comp";

interface AuthorPhotoFieldProps {
  /** The author's name as it is being typed: the initials shown without a photo. */
  authorName: string;
  /** The photo the author already has, if any. */
  defaultValue?: string;
}

/**
 * The author's photo, which is secondary: a row with how the author looks
 * right now — the photo, or the initials that stand in for it — and the
 * button that uploads one. The URL travels in a hidden `photo` field and is
 * saved with the rest of the form.
 *
 * The upload is `useImageUpload`'s, cropped to a square.
 */
export function AuthorPhotoField({ authorName, defaultValue }: AuthorPhotoFieldProps) {
  const { url, status, isUploading, upload, clear } = useImageUpload({ initialUrl: defaultValue, aspectRatio: "1:1" });
  const inputRef = useRef<HTMLInputElement>(null);
  const hasPhoto = url !== "";

  return (
    <div className="authors-manager__photo">
      {/* The only thing the form sees. */}
      <input type="hidden" name="photo" value={url} />

      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        className="authors-manager__photo-file"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => {
          const file = event.target.files?.[0];
          // Cleared so that choosing the same file twice fires the change again.
          event.target.value = "";
          if (file) void upload(file);
        }}
      />

      <AuthorAvatar name={authorName || "?"} photo={url || undefined} size="large" />

      {status.kind === "error" ? (
        <p className="authors-manager__photo-text authors-manager__photo-text_tone_error" role="alert">
          {status.message}
        </p>
      ) : (
        <p className="authors-manager__photo-text">
          {hasPhoto ? "Se recorta en cuadrado." : "Sin foto: se usan las iniciales."}
        </p>
      )}

      <div className="authors-manager__photo-actions">
        {hasPhoto && (
          <button type="button" className="authors-manager__photo-remove" onClick={clear} disabled={isUploading}>
            Quitar
          </button>
        )}
        <button
          type="button"
          className="platform-button platform-button_size_sm"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? "Subiendo…" : hasPhoto ? "Cambiar foto" : "Agregar foto"}
        </button>
      </div>
    </div>
  );
}
