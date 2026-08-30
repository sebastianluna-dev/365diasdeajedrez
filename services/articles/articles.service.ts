import { cache } from "react";
import { getPayload } from "@/lib/payload/get-payload";
import { mapArticle } from "./articles.mapper";
import type { Article } from "./articles.types";

const getPublishedArticles = cache(async () => {
  const payload = await getPayload();
  const result = await payload.find({
    collection: "articles",
    where: { _status: { equals: "published" } },
    sort: "-publishedAt",
    limit: 0,
    depth: 2,
  });
  return result.docs;
});

export async function getArticles(): Promise<Article[]> {
  const articles = await getPublishedArticles();
  return articles.map(mapArticle);
}

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
