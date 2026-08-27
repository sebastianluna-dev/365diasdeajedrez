import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/services/articles/articles.types";
import "./article-card.comp.css";

interface ArticleCardProps {
  article: Article;
  id?: string;
}

export function ArticleCard({ article, id }: ArticleCardProps) {
  return (
    <article id={id} className="article-card">
      <Link href={article.href} className="article-card__image-link">
        <Image
          className="article-card__image"
          src={article.image.src}
          alt={article.image.alt}
          fill
          sizes="(max-width: 1024px) 50vw, 33vw"
        />
      </Link>
      <span className="eyebrow">{article.category}</span>
      <h3 className="article-card__title">
        <Link href={article.href} className="article-card__title-link">
          {article.title}
        </Link>
      </h3>
      <p className="article-card__text">{article.excerpt}</p>
      <span className="card-meta">{article.meta}</span>
    </article>
  );
}
