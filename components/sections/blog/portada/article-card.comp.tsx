import Link from "next/link";
import type { Article } from "@/interfaces/article.interface";
import { MediaFrame } from "./media-frame.comp";
import "./article-card.comp.css";

interface ArticleCardProps {
  article: Article;
  id?: string;
}

export function ArticleCard({ article, id }: ArticleCardProps) {
  return (
    <article id={id} className="article-card">
      {article.image && (
        <MediaFrame src={article.image} alt={article.title} marginBottom sizes="(max-width: 1024px) 50vw, 290px" />
      )}
      <span className="eyebrow">{article.category}</span>
      <h3 className="article-card__title">{article.title}</h3>
      <p className="article-card__text">{article.excerpt}</p>
      <Link href={article.href} className="article-card__link">
        Leer <span className="link-arrow">⟶</span>
      </Link>
    </article>
  );
}
