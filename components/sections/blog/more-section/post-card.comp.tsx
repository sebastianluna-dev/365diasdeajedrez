import type { Article } from "@/interfaces/article.interface";
import "./post-card.comp.css";

interface PostCardProps {
  article: Article;
  id?: string;
}

export function PostCard({ article, id }: PostCardProps) {
  return (
    <article id={id} className="post-card">
      <img className="post-card__image" src={article.image} alt={article.title} />
      <span className="eyebrow">{article.category}</span>
      <h3 className="post-card__title">{article.title}</h3>
      <p className="post-card__text">{article.excerpt}</p>
      <span className="card-meta">{article.meta}</span>
    </article>
  );
}
