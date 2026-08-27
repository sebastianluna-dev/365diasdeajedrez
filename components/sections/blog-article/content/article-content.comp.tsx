import Link from "next/link";
import Image from "next/image";
import { RichText } from "@payloadcms/richtext-lexical/react";
import type { PostContent } from "@/services/posts/posts.types";
import { articleRichTextConverters } from "./rich-text-converters";
import { ShareBox } from "./share-box.comp";
import "./article-content.comp.css";

interface ArticleContentProps {
  post: PostContent;
}

export function ArticleContent({ post }: ArticleContentProps) {
  const author = post.author;

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
        <span className="article-content__breadcrumb-current">{post.category}</span>
      </nav>

      <h1 className="article-content__title">{post.title}</h1>

      {author && (
        <div className="article-content__byline">
          <span className="article-content__avatar">{author.name.charAt(0)}</span>
          <span>
            <span className="article-content__author-name">{author.name}</span>
            <span className="article-content__author-meta">{post.meta}</span>
          </span>
        </div>
      )}

      <div className="article-content__divider" />

      <div className="article-content__layout">
        <div>
          <div className="article-content__cover">
            <Image
              className="article-content__cover-image"
              src={post.image.src}
              alt={post.image.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 780px"
            />
          </div>
          <RichText data={post.content} converters={articleRichTextConverters} />
        </div>

        <ShareBox />
      </div>
    </article>
  );
}
