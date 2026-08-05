import { articles } from "@/data/articles.data";
import { ArticleCard } from "./article-card.comp";
import { HeroArticle } from "./hero-article.comp";
import { SidebarCard } from "./sidebar-card.comp";
import { ReadingList } from "./reading-list.comp";
import { SubscribeBox } from "./subscribe-box.comp";
import "./portada.section.css";

export function Portada() {
  const methodArticle = articles.find((article) => article.slug === "metodo")!;
  const tacticsArticle = articles.find((article) => article.slug === "tactica")!;
  const heroArticle = articles.find((article) => article.slug === "torre-c3")!;

  return (
    <section className="portada">
      <div className="portada__left">
        <ArticleCard article={methodArticle} />
        <ArticleCard article={tacticsArticle} id="tactica" />
      </div>

      <div className="portada__center">
        <HeroArticle article={heroArticle} />
      </div>

      <div className="portada__right">
        <SidebarCard />
        <ReadingList />
        <SubscribeBox />
      </div>
    </section>
  );
}
