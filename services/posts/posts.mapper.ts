import type { Post } from "@/payload-types";
import { formatSpanishDate } from "@/lib/format-spanish-date";
import { mapContentImage } from "@/services/shared/map-content-image";
import type { PostAuthorContent, PostContent } from "./posts.types";

function mapAuthor(author: Post["author"]): PostAuthorContent | undefined {
  if (!author || typeof author === "number") return undefined;
  return {
    name: author.name,
    title: author.authorTitle ?? undefined,
  };
}

function mapCategory(categories: Post["categories"]): string | undefined {
  const [first] = categories ?? [];
  if (!first || typeof first === "number") return undefined;
  return first.name;
}

export function mapPost(post: Post): PostContent {
  const publishedDate = new Date(post.publishedAt ?? post.createdAt);
  const readTime = post.readTimeMinutes ? `${post.readTimeMinutes} min de lectura` : undefined;
  const meta = post.readTimeMinutes
    ? `${formatSpanishDate(publishedDate)} · ${post.readTimeMinutes} min`
    : formatSpanishDate(publishedDate);

  return {
    slug: post.slug ?? String(post.id),
    href: `/blog/${post.slug}`,
    title: post.title,
    excerpt: post.excerpt,
    category: mapCategory(post.categories),
    image: mapContentImage(post.featuredImage),
    content: post.content,
    meta,
    readTime,
    author: mapAuthor(post.author),
    metaTitle: post.seo?.metaTitle ?? undefined,
    metaDescription: post.seo?.metaDescription ?? undefined,
    ogImage: post.seo?.ogImage ? mapContentImage(post.seo.ogImage) : undefined,
  };
}
