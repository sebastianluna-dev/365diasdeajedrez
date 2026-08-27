import Link from "next/link";
import type { PostContent } from "@/services/posts/posts.types";
import { MediaFrame } from "./media-frame.comp";
import "./hero-article.comp.css";

interface HeroArticleProps {
  post: PostContent;
  id?: string;
  badge?: string;
}

export function HeroArticle({ post, id, badge = "Portada" }: HeroArticleProps) {
  return (
    <article id={id} className="hero-article">
      <MediaFrame src={post.image.src} alt={post.image.alt} badge={badge} sizes="(max-width: 1024px) 100vw, 700px" />
      <div className="hero-article__meta">
        <span>{post.category}</span>
        <span className="hero-article__meta-dot" />
        <span className="card-meta">{post.readTime}</span>
      </div>
      <h2 className="hero-article__title">
        <Link href={post.href} className="hero-article__title-link">
          {post.title}
        </Link>
      </h2>
      <p className="hero-article__text">{post.excerpt}</p>
      <div className="hero-article__footer">
        {post.author && (
          <div className="hero-article__author">
            <div className="hero-article__avatar">{post.author.name.charAt(0)}</div>
            <div>
              <div className="hero-article__author-name">{post.author.name}</div>
              <div className="hero-article__author-role">{post.author.title}</div>
            </div>
          </div>
        )}
        <Link href={post.href} className="blog-button blog-button_variant_secondary blog-button_size_md">
          Leer la partida completa <span className="link-arrow">⟶</span>
        </Link>
      </div>
    </article>
  );
}
