import type { Article as ArticleDoc } from "@/payload-types";
import type { ContentImage } from "@/services/shared/content-image.types";

export interface ArticleAuthor {
  name: string;
  title?: string;
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
