import type { MetadataRoute } from "next";
import { getArticles } from "@/services/articles/articles.service";

// URL base del sitio; en local puede sobreescribirse con NEXT_PUBLIC_SITE_URL.
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://365diasdeajedrez.com";

// Rutas públicas estáticas del sitio (las de plataforma quedan fuera del sitemap).
const STATIC_ROUTES = ["/", "/blog", "/nosotros", "/reloj-de-ajedrez"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getArticles();

  return [
    ...STATIC_ROUTES.map((route) => ({
      url: `${BASE_URL}${route === "/" ? "" : route}`,
      changeFrequency: "weekly" as const,
      priority: route === "/" ? 1 : 0.8,
    })),
    ...articles.map((article) => ({
      url: `${BASE_URL}/blog/${article.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
