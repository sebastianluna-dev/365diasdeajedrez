import Link from "next/link";
import { getPosts } from "@/services/posts/posts.service";
import { BlogResourceCard } from "./blog-resource-card.comp";
import "./resources.section.css";

export async function ResourcesSection() {
  const posts = await getPosts();
  const featuredPosts = posts.slice(0, 3);

  return (
    <section id="blog" className="section section_theme_dark resources">
      <div className="section__inner">
        <div className="section__head resources__head">
          <div className="resources__head-text">
            <span className="section__eyebrow">Recursos</span>
            <h2 className="section__title">Material de estudio para todos los niveles.</h2>
            <p className="section__text">Artículos, ideas y ejercicios para seguir aprendiendo entre clases.</p>
          </div>
          <Link href="/blog" className="button button_variant_primary resources__head-cta">
            Ver más
          </Link>
        </div>

        <div className="resources__cards">
          {featuredPosts.map((post) => (
            <BlogResourceCard key={post.slug} title={post.title} text={post.excerpt} image={post.image.src} href={post.href} />
          ))}
        </div>

        <div className="resources__cta-row">
          <Link href="/blog" className="button button_variant_primary">
            Ver más
          </Link>
        </div>
      </div>
    </section>
  );
}
