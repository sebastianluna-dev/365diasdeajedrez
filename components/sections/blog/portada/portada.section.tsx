import { ArticleCard } from "./article-card.comp";
import { HeroArticle } from "./hero-article.comp";
import { SidebarCard } from "./sidebar-card.comp";
import { ReadingList } from "./reading-list.comp";
import { SubscribeBox } from "./subscribe-box.comp";
import "./portada.section.css";

export function Portada() {
  return (
    <section className="portada">
      <div className="portada__left">
        <ArticleCard
          eyebrow="Método"
          title="Cómo organizar tu entrenamiento de ajedrez"
          text="Primero conocimiento sólido, después cálculo y competencia. Una guía para entrenar con orden y ver resultados en tres meses."
          href="#"
        />
        <ArticleCard
          id="tactica"
          image={{ src: "/design-import/assets/thumb-tactica.png", alt: "Patrones tácticos" }}
          eyebrow="Táctica"
          title="Siete patrones que debes reconocer de inmediato"
          text="Clavadas, horquillas y ataques descubiertos: los motivos que deciden la mayoría de las partidas por debajo de 2000."
          href="#"
        />
      </div>

      <div className="portada__center">
        <HeroArticle />
      </div>

      <div className="portada__right">
        <SidebarCard />
        <ReadingList />
        <SubscribeBox />
      </div>
    </section>
  );
}
