import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";
import { getArticleLinks } from "@/services/articles/articles.service";

// Rutas públicas estáticas del sitio (las de plataforma quedan fuera del sitemap).
const STATIC_ROUTES = ["/", "/blog", "/nosotros", "/reloj-de-ajedrez"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Sólo slug y fecha: el sitemap no necesita el contenido de los artículos.
  const articles = await getArticleLinks();

  return [
    ...STATIC_ROUTES.map((route) => ({
      url: `${SITE_URL}${route === "/" ? "" : route}`,
      changeFrequency: "weekly" as const,
      priority: route === "/" ? 1 : 0.8,
    })),
    ...articles.map((article) => ({
      url: `${SITE_URL}/blog/${article.slug}`,
      lastModified: new Date(article.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
