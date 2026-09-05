"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { IMAGE_ACCEPT, IMAGE_MAX_BYTES, isAllowedImageType } from "@/constants/platform/upload.const";
import { isDisplayableImage } from "@/lib/remote-image";
import { createUploadSignature } from "@/services/media/media.actions";
import "./image-upload.comp.css";

interface ImageUploadProps {
  /** Nombre del campo que viaja en el formulario, con la URL como valor. */
  name: string;
  label: string;
  /** La imagen que ya tiene guardada, si la tiene. */
  defaultValue?: string;
  hint?: string;
  /** Proporción del recuadro de vista previa. Por defecto, la de una portada. */
  aspectRatio?: string;
}

type Status = { kind: "idle" } | { kind: "uploading" } | { kind: "error"; message: string };

const MAX_MB = Math.round(IMAGE_MAX_BYTES / (1024 * 1024));

/**
 * Sube una imagen a Cloudinary y deja su URL en el formulario que lo envuelve.
 *
 * No envía nada por su cuenta: lo único que aporta al formulario es un
 * `<input type="hidden">` con la URL, así que sustituye al campo de texto donde
 * antes se pegaba a mano y la acción que guarda no cambia. Se guarda cuando se
 * guarda el formulario, como el resto de los campos.
 *
 * El archivo va del navegador a Cloudinary DIRECTAMENTE, con una firma que pide
 * al servidor. Ni las credenciales bajan al navegador ni los bytes suben por
 * nuestro servidor, que además tiene un tope de 1 MB por petición en las server
 * actions —menos que muchas fotos—.
 *
 * Si no hay credenciales configuradas, el servidor no firma y esto se queda en
 * un campo de texto normal: preferible a una pantalla que no deja guardar.
 */
export function ImageUpload({ name, label, defaultValue, hint, aspectRatio = "21 / 9" }: ImageUploadProps) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [canUpload, setCanUpload] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const fieldId = useId();

  const upload = async (file: File) => {
    // Se comprueba aquí para decirlo al instante; quien de verdad manda es
    // Cloudinary, que rechaza lo que no encaje con la firma.
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
      setCanUpload(false);
      setStatus({
        kind: "error",
        message: "No se pudo firmar la subida. Pega la URL de la imagen a mano.",
      });
      return;
    }

    const body = new FormData();
    body.append("file", file);
    body.append("api_key", signature.apiKey);
    body.append("timestamp", String(signature.timestamp));
    body.append("folder", signature.folder);
    body.append("signature", signature.signature);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`, {
        method: "POST",
        body,
      });
      if (!response.ok) throw new Error(String(response.status));

      const uploaded: { secure_url?: string } = await response.json();
      if (!uploaded.secure_url) throw new Error("sin URL");

      setUrl(uploaded.secure_url);
      setStatus({ kind: "idle" });
    } catch {
      setStatus({ kind: "error", message: "La subida falló. Inténtalo otra vez." });
    }
  };

  return (
    <div className="image-upload">
      <span className="image-upload__label">{label}</span>

      {/* Lo único que ve el formulario. */}
      <input type="hidden" name={name} value={url} />

      <div className="image-upload__body">
        <div className="image-upload__preview" style={{ aspectRatio }}>
          {isDisplayableImage(url) ? (
            <Image src={url} alt="" fill sizes="320px" className="image-upload__image" />
          ) : (
            <span className="image-upload__placeholder">
              {url ? "La imagen no es de Cloudinary" : "Sin imagen"}
            </span>
          )}
        </div>

        <div className="image-upload__actions">
          {canUpload && (
            <>
              <input
                ref={inputRef}
                id={fieldId}
                type="file"
                accept={IMAGE_ACCEPT}
                className="image-upload__file"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  // El valor se limpia para que elegir DOS VECES el mismo
                  // archivo vuelva a disparar el cambio.
                  event.target.value = "";
                  if (file) void upload(file);
                }}
              />
              <button
                type="button"
                className="platform-button platform-button_variant_secondary"
                disabled={status.kind === "uploading"}
                onClick={() => inputRef.current?.click()}
              >
                {status.kind === "uploading" ? "Subiendo…" : url ? "Cambiar imagen" : "Subir imagen"}
              </button>
            </>
          )}

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
      </div>

      {/* Sin credenciales, o si algo falla, queda el camino de siempre: pegar
          la URL. También sirve para reutilizar una imagen ya subida. */}
      {(!canUpload || url.length > 0) && (
        <input
          type="text"
          className="image-upload__url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://res.cloudinary.com/…"
          aria-label={`URL de ${label.toLowerCase()}`}
          spellCheck={false}
        />
      )}

      {status.kind === "error" && (
        <span className="image-upload__error" role="alert">
          {status.message}
        </span>
      )}
      {hint && status.kind !== "error" && <span className="image-upload__hint">{hint}</span>}
    </div>
  );
}
