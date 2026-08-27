import Link from "next/link";
import { getArticles } from "@/services/articles/articles.service";
import { BlogResourceCard } from "./blog-resource-card.comp";
import "./resources.section.css";

export async function ResourcesSection() {
  const articles = await getArticles();
  const featuredArticles = articles.slice(0, 3);

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
          {featuredArticles.map((article) => (
            <BlogResourceCard
              key={article.slug}
              title={article.title}
              text={article.excerpt}
              image={article.image.src}
              href={article.href}
            />
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
