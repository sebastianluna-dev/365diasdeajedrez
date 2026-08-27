import Link from "next/link";
import type { PostContent } from "@/services/posts/posts.types";
import { MediaFrame } from "./media-frame.comp";
import "./article-card.comp.css";

interface ArticleCardProps {
  post: PostContent;
  id?: string;
}

export function ArticleCard({ post, id }: ArticleCardProps) {
  return (
    <article id={id} className="article-card">
      <MediaFrame src={post.image.src} alt={post.image.alt} marginBottom sizes="(max-width: 1024px) 50vw, 290px" />
      <span className="eyebrow">{post.category}</span>
      <h3 className="article-card__title">{post.title}</h3>
      <p className="article-card__text">{post.excerpt}</p>
      <Link href={post.href} className="article-card__link">
        Leer <span className="link-arrow">⟶</span>
      </Link>
    </article>
  );
}
