import Link from "next/link";
import type { Article } from "@/interfaces/article.interface";
import { ArticleBody } from "./article-body.comp";
import { ShareBox } from "./share-box.comp";
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
              <img className="article-content__avatar-image" src={author.avatar} alt={author.name} />
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
          {article.image && (
            <div className="article-content__cover">
              <img className="article-content__cover-image" src={article.image} alt={article.title} />
            </div>
          )}
          {article.body && <ArticleBody blocks={article.body} />}
        </div>

        <ShareBox />
      </div>
    </article>
  );
}
