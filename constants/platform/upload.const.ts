// Límites de las imágenes que sube el staff (portadas de curso, y lo que venga).
//
// En un archivo aparte porque los comprueban los dos lados: el navegador antes
// de mandar el archivo —para decirlo al instante en vez de tras la subida— y
// la acción que firma, que es la que de verdad decide.

/** 5 MB. Una portada bien exportada no pasa de uno o dos. */
export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;

/** Lo que Cloudinary sirve bien y los navegadores enseñan sin sorpresas. */
export const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;

/** Para el `accept` del selector de archivos. */
export const IMAGE_ACCEPT = IMAGE_MIME_TYPES.join(",");

export function isAllowedImageType(type: string): boolean {
  return (IMAGE_MIME_TYPES as readonly string[]).includes(type);
}
