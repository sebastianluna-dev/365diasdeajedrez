import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/interfaces/article.interface";
import { ArticleBody } from "./article-body.comp";
import { ShareBox } from "./share-box.comp";
import { DEFAULT_BLOG_THUMBNAIL } from "@/data/media-defaults.data";
import "./article-content.comp.css";

interface ArticleContentProps {
  article: Article;
}

export function ArticleContent({ article }: ArticleContentProps) {
  const author = article.author;

  return (
    <article className="article-content">
      <nav className="article-content__breadcrumb">
        <Link href="/" className="article-content__breadcrumb-link">
          Inicio
        </Link>
        <span className="article-content__breadcrumb-sep">›</span>
        <Link href="/blog" className="article-content__breadcrumb-link">
          Blog
        </Link>
        <span className="article-content__breadcrumb-sep">›</span>
        <span className="article-content__breadcrumb-current">{article.category}</span>
      </nav>

      <h1 className="article-content__title">{article.title}</h1>

      {author && (
        <div className="article-content__byline">
          <span className="article-content__avatar">
            {author.avatar ? (
              <Image className="article-content__avatar-image" src={author.avatar} alt={author.name} fill sizes="36px" />
            ) : (
              author.name.charAt(0)
            )}
          </span>
          <span>
            <span className="article-content__author-name">{author.name}</span>
            <span className="article-content__author-meta">{article.meta}</span>
          </span>
        </div>
      )}

      <div className="article-content__divider" />

      <div className="article-content__layout">
        <div>
          <div className="article-content__cover">
            <Image
              className="article-content__cover-image"
              src={article.image ?? DEFAULT_BLOG_THUMBNAIL}
              alt={article.title}
              fill
              sizes="(max-width: 1024px) 100vw, 780px"
            />
          </div>
          {article.body && <ArticleBody blocks={article.body} />}
        </div>

        <ShareBox />
      </div>
    </article>
  );
}
