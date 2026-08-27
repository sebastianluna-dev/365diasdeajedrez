import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/services/articles/articles.types";
import "./related-article-card.comp.css";

interface RelatedArticleCardProps {
  article: Article;
}

export function RelatedArticleCard({ article }: RelatedArticleCardProps) {
  return (
    <article className="related-article-card">
      <Link href={article.href} className="related-article-card__image-link">
        <Image
          className="related-article-card__image"
          src={article.image.src}
          alt={article.image.alt}
          fill
          sizes="(max-width: 1024px) 50vw, 33vw"
        />
      </Link>
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
