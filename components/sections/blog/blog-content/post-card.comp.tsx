import Link from "next/link";
import Image from "next/image";
import type { PostContent } from "@/services/posts/posts.types";
import "./post-card.comp.css";

interface PostCardProps {
  post: PostContent;
  id?: string;
}

export function PostCard({ post, id }: PostCardProps) {
  return (
    <article id={id} className="post-card">
      <Link href={post.href} className="post-card__image-link">
        <Image
          className="post-card__image"
          src={post.image.src}
          alt={post.image.alt}
          fill
          sizes="(max-width: 1024px) 50vw, 33vw"
        />
      </Link>
      <span className="eyebrow">{post.category}</span>
      <h3 className="post-card__title">
        <Link href={post.href} className="post-card__title-link">
          {post.title}
        </Link>
      </h3>
      <p className="post-card__text">{post.excerpt}</p>
      <span className="card-meta">{post.meta}</span>
    </article>
  );
}
