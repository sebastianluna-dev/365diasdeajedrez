import Link from "next/link";
import { articles } from "@/data/articles.data";
import { PostCard } from "./post-card.comp";
import "./more-section.section.css";

const moreSlugs = ["aperturas", "finales", "estrategia", "tactica"];

export function MoreSection() {
  const posts = moreSlugs.map((slug) => articles.find((article) => article.slug === slug)!);

  return (
    <section className="more-section">
      <div className="more-section__header">
        <h2 className="more-section__title">Más de esta edición</h2>
        <span className="more-section__page">Página 2</span>
      </div>
      <div className="more-section__grid">
        {posts.map((post) => (
          <PostCard key={post.slug} article={post} id={post.slug === "tactica" ? undefined : post.slug} />
        ))}
      </div>

      <div className="more-section__cta-row" id="analisis">
        <Link href="/" className="blog-button blog-button_variant_secondary blog-button_size_lg">
          Ver todos los artículos <span className="link-arrow">⟶</span>
        </Link>
      </div>
    </section>
  );
}
