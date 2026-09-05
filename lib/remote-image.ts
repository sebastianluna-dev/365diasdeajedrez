// Qué imágenes remotas puede pintar `next/image`.
//
// `next.config.ts` sólo permite res.cloudinary.com, y una URL de otro sitio no
// se degrada: `next/image` responde 400 y la página entera falla. La portada de
// un curso la teclea el staff a mano, así que comprobarlo antes de pintar es lo
// que separa «esta fila no tiene miniatura» de «la lista de cursos no carga».

const ALLOWED_HOSTS = ["res.cloudinary.com"];

export function isDisplayableImage(url: string | undefined | null): url is string {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && ALLOWED_HOSTS.includes(parsed.hostname);
  } catch {
    // Una ruta relativa («/portadas/x.jpg») la sirve la propia app y vale.
    return url.startsWith("/");
  }
}
