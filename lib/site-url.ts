// URL pública del sitio, para todo lo que necesita una URL absoluta (sitemap,
// robots, canónicas y Open Graph). En local se sobreescribe con
// NEXT_PUBLIC_SITE_URL; el valor por defecto es el dominio de producción.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://365diasdeajedrez.com";
