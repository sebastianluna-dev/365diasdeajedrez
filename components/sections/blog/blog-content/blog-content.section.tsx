import Link from "next/link";
import { articles } from "@/data/articles.data";
import { ArticleCard } from "./article-card.comp";
import { HeroArticle } from "./hero-article.comp";
import { SidebarCard } from "./sidebar-card.comp";
import { ReadingList } from "./reading-list.comp";
import { SubscribeBox } from "./subscribe-box.comp";
import "./blog-content.section.css";

export function BlogContent() {
  return (
    <>
      <section className="portada">
        <div className="portada__left">
          <ArticleCard article={articles[0]} />
          <ArticleCard article={articles[1]} id="tactica" />
        </div>

        <div className="portada__center">
          <HeroArticle article={articles[2]} />
        </div>

        <div className="portada__right">
          <SidebarCard />
          <ReadingList articles={articles.slice(3, 6)} />
          <SubscribeBox />
        </div>
      </section>

      <section className="more-section">
        <div className="more-section__header">
          <h2 className="more-section__title">Más de esta edición</h2>
          <span className="more-section__page">Página 2</span>
        </div>

        <div className="more-section__grid">
          <div className="more-section__left">
            <HeroArticle article={articles[6]} id="estrategia" badge="Lo más leído" />
          </div>

          <div className="more-section__center">
            <ArticleCard article={articles[13]} id="aperturas" />
            <ArticleCard article={articles[14]} id="finales" />
          </div>

          <div className="more-section__right">
            <ReadingList articles={articles.slice(7, 12)} />
            <div className="more-section__cta-row" id="analisis">
              <Link href="/blog/articulos" className="blog-button blog-button_variant_secondary blog-button_size_lg">
                Ver todos los artículos <span className="link-arrow">⟶</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
