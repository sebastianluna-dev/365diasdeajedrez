import Link from "next/link";
import Image from "next/image";
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
        <Image
          className="post-card__image"
          src={article.image!}
          alt={article.title}
          fill
          sizes="(max-width: 1024px) 50vw, 33vw"
        />
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
