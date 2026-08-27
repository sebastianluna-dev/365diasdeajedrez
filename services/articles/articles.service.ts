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

export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  const articles = await getArticles();
  return articles.find((article) => article.slug === slug);
}
