import Link from "next/link";
import type { Article } from "@/interfaces/article.interface";
import "./post-card.comp.css";

interface PostCardProps {
  article: Article;
  id?: string;
}

export function PostCard({ article, id }: PostCardProps) {
  return (
    <article id={id} className="post-card">
      <Link href={article.href} className="post-card__image-link">
        <img className="post-card__image" src={article.image} alt={article.title} />
      </Link>
      <span className="eyebrow">{article.category}</span>
      <h3 className="post-card__title">
        <Link href={article.href} className="post-card__title-link">
          {article.title}
        </Link>
      </h3>
      <p className="post-card__text">{article.excerpt}</p>
      <span className="card-meta">{article.meta}</span>
    </article>
  );
}
