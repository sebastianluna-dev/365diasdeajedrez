import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/interfaces/article.interface";
import { MediaFrame } from "./media-frame.comp";
import "./hero-article.comp.css";

interface HeroArticleProps {
  article: Article;
}

export function HeroArticle({ article }: HeroArticleProps) {
  return (
    <article className="hero-article">
      <MediaFrame
        src={article.image!}
        alt={article.title}
        badge="Portada"
        sizes="(max-width: 1024px) 100vw, 700px"
      />
      <div className="hero-article__meta">
        <span>{article.category}</span>
        <span className="hero-article__meta-dot" />
        <span className="card-meta">{article.readTime}</span>
      </div>
      <h2 className="hero-article__title">
        <Link href={article.href} className="hero-article__title-link">
          {article.title}
        </Link>
      </h2>
      <p className="hero-article__text">{article.excerpt}</p>
      <div className="hero-article__footer">
        <div className="hero-article__author">
          <div className="hero-article__avatar">
            <Image
              className="hero-article__avatar-image"
              src={article.author!.avatar!}
              alt={article.author!.name}
              fill
              sizes="46px"
            />
          </div>
          <div>
            <div className="hero-article__author-name">{article.author!.name}</div>
            <div className="hero-article__author-role">{article.author!.role}</div>
          </div>
        </div>
        <Link href={article.href} className="blog-button blog-button_variant_secondary blog-button_size_md">
          Leer la partida completa <span className="link-arrow">⟶</span>
        </Link>
      </div>
    </article>
  );
}
