import type { Post } from "@/payload-types";
import type { ContentImage } from "@/services/shared/content-image.types";

export interface PostAuthorContent {
  name: string;
  title?: string;
}

export interface PostContent {
  slug: string;
  href: string;
  title: string;
  excerpt: string;
  category?: string;
  image: ContentImage;
  content: Post["content"];
  meta: string;
  readTime?: string;
  author?: PostAuthorContent;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: ContentImage;
}
