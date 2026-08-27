import Link from "next/link";
import Image from "next/image";
import { RichText } from "@payloadcms/richtext-lexical/react";
import type { Article } from "@/services/articles/articles.types";
import { articleRichTextConverters } from "./rich-text-converters";
import "./article-content.section.css";

interface ArticleContentProps {
  article: Article;
}

export function ArticleContent({ article }: ArticleContentProps) {
  const author = article.author;

  return (
    <article className="article-content">
      <div className="article-content__inner">
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
            <span className="article-content__avatar">{author.name.charAt(0)}</span>
            <span>
              <span className="article-content__author-name">{author.name}</span>
              <span className="article-content__author-meta">{article.meta}</span>
            </span>
          </div>
        )}

        <div className="article-content__divider" />

        <div className="article-content__cover">
          <Image
            className="article-content__cover-image"
            src={article.image.src}
            alt={article.image.alt}
            fill
            sizes="(max-width: 820px) 100vw, 684px"
          />
        </div>
        <RichText className="article-body" data={article.content} converters={articleRichTextConverters} />
      </div>
    </article>
  );
}
