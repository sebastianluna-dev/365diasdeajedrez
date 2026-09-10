// Etiquetas del Data Cache de Next para lo que se lee del CMS.
//
// Los servicios las ponen al cachear con `unstable_cache` y los hooks
// `afterChange` de los Globals las caducan al guardar en Payload, así que un
// cambio en el CMS se ve en la siguiente visita sin esperar a ningún plazo.
// Sin "server-only": las importan los hooks de Payload, que corren dentro de
// su API y no dentro de un render de React.

export const CACHE_TAGS = {
  /** Los siete Globals de la portada (hero, programa, maestro, paquetes, FAQ, CTA, reseñas). */
  home: "home-globals",
  /** El menú, que se pinta en todas las páginas públicas. */
  header: "home-header",
  /** Ajustes del sitio (WhatsApp), en el footer y el CTA. */
  siteSettings: "site-settings",
  /** La lista de artículos publicados (blog, relacionados y sitemap). */
  articles: "articles",
} as const;
