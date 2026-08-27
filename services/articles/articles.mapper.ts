import type { Article as ArticleDoc } from "@/payload-types";
import { formatSpanishDate } from "@/lib/format-spanish-date";
import { mapContentImage } from "@/services/shared/map-content-image";
import type { Article, ArticleAuthor } from "./articles.types";

function mapAuthor(author: ArticleDoc["author"]): ArticleAuthor | undefined {
  if (!author || typeof author === "number") return undefined;
  return {
    name: author.name,
    title: author.authorTitle ?? undefined,
  };
}

function mapCategory(categories: ArticleDoc["categories"]): string | undefined {
  const [first] = categories ?? [];
  if (!first || typeof first === "number") return undefined;
  return first.name;
}

export function mapArticle(article: ArticleDoc): Article {
  const publishedDate = new Date(article.publishedAt ?? article.createdAt);
  const readTime = article.readTimeMinutes ? `${article.readTimeMinutes} min de lectura` : undefined;
  const meta = article.readTimeMinutes
    ? `${formatSpanishDate(publishedDate)} · ${article.readTimeMinutes} min`
    : formatSpanishDate(publishedDate);

  return {
    slug: article.slug ?? String(article.id),
    href: `/blog/${article.slug}`,
    title: article.title,
    excerpt: article.excerpt,
    category: mapCategory(article.categories),
    image: mapContentImage(article.featuredImage),
    content: article.content,
    meta,
    readTime,
    author: mapAuthor(article.author),
    metaTitle: article.seo?.metaTitle ?? undefined,
    metaDescription: article.seo?.metaDescription ?? undefined,
    ogImage: article.seo?.ogImage ? mapContentImage(article.seo.ogImage) : undefined,
  };
}
