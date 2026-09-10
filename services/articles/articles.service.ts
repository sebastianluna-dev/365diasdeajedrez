import { unstable_cache } from "next/cache";
import { cache } from "react";
import { CACHE_TAGS } from "@/lib/payload/cache-tags";
import { getPayload } from "@/lib/payload/get-payload";
import { mapArticle, mapArticleSummary } from "./articles.mapper";
import type { Article, ArticleLink, ArticleSummary } from "./articles.types";

/** Red de seguridad para cambios que no pasen por los hooks de Payload. */
const CACHE_REVALIDATE_SECONDS = 3600;

// La lista del blog va SIN el cuerpo de los artículos: `select` en modo
// exclusión deja fuera `content` (el árbol Lexical entero) y conserva el resto
// con sus relaciones pobladas. Antes cada visita a /blog cargaba y mandaba al
// navegador el texto íntegro de todos los artículos para pintar nueve tarjetas.
//
// Entre peticiones la guarda `unstable_cache` con la etiqueta que caducan los
// hooks de `collections/Articles.ts`; dentro de la misma petición, `cache()`.
const readPublishedSummaries = unstable_cache(
  async (): Promise<ArticleSummary[]> => {
    const payload = await getPayload();
    const result = await payload.find({
      collection: "articles",
      where: { _status: { equals: "published" } },
      sort: "-publishedAt",
      limit: 0,
      depth: 2,
      select: { content: false },
    });
    return result.docs.map(mapArticleSummary);
  },
  ["article-summaries"],
  { tags: [CACHE_TAGS.articles], revalidate: CACHE_REVALIDATE_SECONDS },
);

export const getArticleSummaries = cache((): Promise<ArticleSummary[]> => readPublishedSummaries());

// Para el sitemap: sólo slug y fecha, sin poblar relaciones.
const readArticleLinks = unstable_cache(
  async (): Promise<ArticleLink[]> => {
    const payload = await getPayload();
    const result = await payload.find({
      collection: "articles",
      where: { _status: { equals: "published" } },
      sort: "-publishedAt",
      limit: 0,
      depth: 0,
      select: { slug: true, updatedAt: true },
    });
    return result.docs.map((doc) => ({ slug: doc.slug ?? String(doc.id), updatedAt: doc.updatedAt }));
  },
  ["article-links"],
  { tags: [CACHE_TAGS.articles], revalidate: CACHE_REVALIDATE_SECONDS },
);

export const getArticleLinks = cache((): Promise<ArticleLink[]> => readArticleLinks());

// Consulta dirigida: abrir un artículo no debe traerse la colección entera.
// cache() deduplica por slug, así que la página y su generateMetadata
// comparten una sola consulta.
const getPublishedArticleBySlug = cache(async (slug: string) => {
  const payload = await getPayload();
  const result = await payload.find({
    collection: "articles",
    where: { and: [{ slug: { equals: slug } }, { _status: { equals: "published" } }] },
    limit: 1,
    depth: 2,
  });
  return result.docs[0];
});

export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  const article = await getPublishedArticleBySlug(slug);
  return article ? mapArticle(article) : undefined;
}
