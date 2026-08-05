import Link from "next/link";
import type { Article } from "@/interfaces/article.interface";
import "./related-article-card.comp.css";

interface RelatedArticleCardProps {
  article: Article;
}

export function RelatedArticleCard({ article }: RelatedArticleCardProps) {
  return (
    <article>
      {article.image && (
        <Link href={article.href} className="related-article-card__image-link">
          <img className="related-article-card__image" src={article.image} alt={article.title} />
        </Link>
      )}
      <span className="eyebrow">{article.category}</span>
      <h3 className="related-article-card__title">
        <Link href={article.href} className="related-article-card__title-link">
          {article.title}
        </Link>
      </h3>
      <p className="related-article-card__text">{article.excerpt}</p>
      <span className="card-meta">{article.meta}</span>
    </article>
  );
}
