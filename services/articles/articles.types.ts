import type { Article as ArticleDoc } from "@/payload-types";
import type { ContentImage } from "@/services/shared/content-image.types";

export interface ArticleAuthor {
  name: string;
  title?: string;
}

/**
 * An article without its body: what the listing's cards, the related ones and
 * the sitemap need.
 */
export type ArticleSummary = Omit<Article, "content">;

/** The minimum to link an article (sitemap). */
export interface ArticleLink {
  slug: string;
  updatedAt: string;
}

export interface Article {
  slug: string;
  href: string;
  title: string;
  excerpt: string;
  category?: string;
  image: ContentImage;
  content: ArticleDoc["content"];
  meta: string;
  readTime?: string;
  author?: ArticleAuthor;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: ContentImage;
}
