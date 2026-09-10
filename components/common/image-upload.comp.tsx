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
  /** Nombre del campo que viaja en el formulario, con la URL como valor. */
  name: string;
  /**
   * Id del `<form>` al que pertenece el campo, cuando el componente vive fuera
   * de él. Es lo que permite que la portada se gestione en su propia tarjeta y
   * se guarde con el resto de los metadatos.
   */
  form?: string;
  /** La imagen que ya tiene guardada, si la tiene. */
  defaultValue?: string;
  /** Qué es y en qué proporción: «Portada del curso». */
  label: string;
  /** Proporción del recuadro y del recorte: «21:9». */
  aspectRatio?: string;
  hint?: string;
}

type Status = { kind: "idle" } | { kind: "uploading" } | { kind: "error"; message: string };

const MAX_MB = Math.round(IMAGE_MAX_BYTES / (1024 * 1024));

/**
 * Sube una imagen a Cloudinary y deja su URL en el formulario que la guarda.
 *
 * TODO se hace aquí: se arrastra o se elige el archivo, se ve el resultado y se
 * quita. La URL no se enseña ni se pide —quien administra un
 * curso no tiene por qué saber qué es Cloudinary—; viaja en un campo oculto y
 * se guarda cuando se guarda el formulario, como el resto de los campos.
 *
 * El archivo va del navegador a Cloudinary DIRECTAMENTE, con una firma que pide
 * al servidor: ni las credenciales bajan al navegador ni los bytes suben por
 * nuestro servidor, que además tiene un tope de 1 MB por petición en las server
 * actions —menos que muchas fotos—.
 *
 * Al subir se normaliza a la proporción de destino con un recorte en la propia
 * URL (ver lib/cloudinary-url), que es lo que arregla una foto cuadrada. Una
 * imagen ya exportada en esa proporción se queda como está.
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
      setStatus({ kind: "error", message: "No se pudo preparar la subida. Vuelve a intentarlo." });
      return;
    }

    const body = new FormData();
    body.append("file", file);
    body.append("api_key", signature.apiKey);
    body.append("timestamp", String(signature.timestamp));
    body.append("folder", signature.folder);
    // Va firmado: cambiarlo aquí invalidaría la firma, que es la gracia.
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

      // Recortada de entrada a la proporción en la que se va a ver: así lo que
      // se enseña aquí es exactamente lo que verá el alumno.
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
      {/* Lo único que ve el formulario. */}
      <input type="hidden" name={name} value={url} form={form} />

      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        className="image-upload__file"
        onChange={(event) => {
          const file = event.target.files?.[0];
          // El valor se limpia para que elegir DOS VECES el mismo archivo
          // vuelva a disparar el cambio.
          event.target.value = "";
          pick(file);
        }}
      />

      {/* Con imagen es sólo una vista previa: ni zona de soltar ni botón.
          Siéndolo, arrastrar la propia imagen de vuelta —que es lo que hace un
          navegador con cualquier `<img>`— disparaba otra subida de la misma
          foto. El arrastre vuelve al quitarla; cambiarla sigue estando en su
          botón. */}
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
            // Que no se pueda arrastrar fuera ni de vuelta: no es un archivo
            // que el staff esté manejando, es lo que ya está guardado.
            draggable={false}
            className="image-upload__image"
          />
        </div>
      ) : (
        /* Vacía: arrastrar o pulsar llevan al mismo sitio. Es un `<button>`
           para que el teclado también pueda abrirlo. */
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
        {/* Elegir archivo sigue estando a un clic: lo que pedía quitarla antes
            es el arrastre, porque ahí el gesto se confunde con mover la foto. */}
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
