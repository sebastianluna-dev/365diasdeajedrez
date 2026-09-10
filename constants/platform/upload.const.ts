// Límites de las imágenes que sube el staff (portadas de curso, y lo que venga).
//
// En un archivo aparte porque los comprueban los dos lados: el navegador antes
// de mandar el archivo —para decirlo al instante en vez de tras la subida— y
// la firma del servidor, que fija los formatos admitidos (`allowed_formats` va
// firmado, así que el navegador no puede cambiarlo sin invalidarla).
//
// El TAMAÑO no viaja en la firma: la API de subida de Cloudinary no tiene un
// parámetro de peso máximo por petición, así que `IMAGE_MAX_BYTES` sólo lo
// aplica el navegador y el techo de verdad es el del plan/preset de la cuenta.

/** 5 MB. Una portada bien exportada no pasa de uno o dos. */
export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;

/** Lo que Cloudinary sirve bien y los navegadores enseñan sin sorpresas. */
export const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;

/** Los mismos cuatro, como los nombra Cloudinary en `allowed_formats`. */
export const IMAGE_ALLOWED_FORMATS = "jpg,png,webp,avif";

/** Para el `accept` del selector de archivos. */
export const IMAGE_ACCEPT = IMAGE_MIME_TYPES.join(",");

export function isAllowedImageType(type: string): boolean {
  return (IMAGE_MIME_TYPES as readonly string[]).includes(type);
}
