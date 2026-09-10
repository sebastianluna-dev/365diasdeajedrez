import { unstable_cache } from "next/cache";
import { cache } from "react";
import { CACHE_TAGS } from "@/lib/payload/cache-tags";
import { getPayload } from "@/lib/payload/get-payload";
import { mapArticle, mapArticleSummary } from "./articles.mapper";
import type { Article, ArticleLink, ArticleSummary } from "./articles.types";

/** Safety net for changes that do not go through Payload's hooks. */
const CACHE_REVALIDATE_SECONDS = 3600;

// The blog's list goes WITHOUT the articles' body: `select` in exclusion mode
// leaves out `content` (the whole Lexical tree) and keeps the rest with its
// relations populated. Before, every visit to /blog loaded and sent to the
// browser the full text of every article in order to render nine cards.
//
// Between requests it is kept by `unstable_cache` with the tag the hooks of
// `collections/Articles.ts` expire; within the same request, `cache()`.
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

// For the sitemap: only slug and date, without populating relations.
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

// Targeted query: opening an article must not bring the whole collection.
// cache() deduplicates by slug, so the page and its generateMetadata share a
// single query.
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
