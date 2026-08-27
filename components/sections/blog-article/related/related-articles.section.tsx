import Link from "next/link";
import type { PostContent } from "@/services/posts/posts.types";
import { RelatedArticleCard } from "./related-article-card.comp";
import "./related-articles.section.css";

interface RelatedArticlesProps {
  posts: PostContent[];
}

export function RelatedArticles({ posts }: RelatedArticlesProps) {
  return (
    <section id="mas-articulos" className="related-articles">
      <div className="related-articles__inner">
        <h2 className="related-articles__title">Más artículos</h2>
        <div className="related-articles__grid">
          {posts.map((post) => (
            <RelatedArticleCard key={post.slug} post={post} />
          ))}
        </div>
        <div className="related-articles__cta-row">
          <Link href="/blog" className="blog-button blog-button_variant_secondary blog-button_size_lg">
            Ver todos los artículos <span className="link-arrow">⟶</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
