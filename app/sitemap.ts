import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";
import { getArticleLinks } from "@/services/articles/articles.service";

// Static public routes of the site (platform routes stay out of the sitemap).
const STATIC_ROUTES = ["/", "/blog", "/nosotros", "/reloj-de-ajedrez"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Only slug and date: the sitemap does not need the articles' content.
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
