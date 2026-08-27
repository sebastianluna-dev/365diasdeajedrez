import Link from "next/link";
import Image from "next/image";
import type { PostContent } from "@/services/posts/posts.types";
import "./related-article-card.comp.css";

interface RelatedArticleCardProps {
  post: PostContent;
}

export function RelatedArticleCard({ post }: RelatedArticleCardProps) {
  return (
    <article className="related-article-card">
      <Link href={post.href} className="related-article-card__image-link">
        <Image
          className="related-article-card__image"
          src={post.image.src}
          alt={post.image.alt}
          fill
          sizes="(max-width: 1024px) 50vw, 33vw"
        />
      </Link>
      <span className="eyebrow">{post.category}</span>
      <h3 className="related-article-card__title">
        <Link href={post.href} className="related-article-card__title-link">
          {post.title}
        </Link>
      </h3>
      <p className="related-article-card__text">{post.excerpt}</p>
      <span className="card-meta">{post.meta}</span>
    </article>
  );
}
