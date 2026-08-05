import Link from "next/link";
import { MediaFrame } from "./media-frame.comp";
import "./hero-article.comp.css";

export function HeroArticle() {
  return (
    <article className="hero-article">
      <MediaFrame src="/design-import/assets/thumb-metodo.png" alt="Análisis de una partida" badge="Portada" />
      <div className="hero-article__meta">
        <span>Análisis de partidas</span>
        <span className="hero-article__meta-dot" />
        <span className="card-meta">12 min de lectura</span>
      </div>
      <h2 className="hero-article__title">
        <Link href="#" className="hero-article__title-link">
          La torre en c3: anatomía de una casilla que decide la partida
        </Link>
      </h2>
      <p className="hero-article__text">
        Sebastián Luna comenta su mejor partida jugada con negras en una Caro-Kann, Ataque Panov. Cómo neutralizar la
        presión central, por qué el cambio al final de torres era la decisión correcta y de qué manera la marcha del
        rey a e3 culmina el plan.
      </p>
      <div className="hero-article__footer">
        <div className="hero-article__author">
          <div className="hero-article__avatar">
            <img className="hero-article__avatar-image" src="/design-import/assets/profesores/diego.jpg" alt="Sebastián Luna" />
          </div>
          <div>
            <div className="hero-article__author-name">Sebastián Luna</div>
            <div className="hero-article__author-role">Instructor · 3 de agosto, 2026</div>
          </div>
        </div>
        <Link href="#" className="blog-button blog-button_variant_secondary blog-button_size_md">
          Leer la partida completa <span className="link-arrow">⟶</span>
        </Link>
      </div>
    </article>
  );
}
