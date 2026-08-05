import Link from "next/link";
import type { Metadata } from "next";
import "./blog.css";

export const metadata: Metadata = {
  title: "Blog | 365 Días de Ajedrez",
  description:
    "Artículos de estrategia, tácticas, aperturas y análisis de partidas para entrenar con intención.",
};

const posts = [
  {
    title: "Deja de memorizar variantes y empieza a entender ideas",
    category: "Aperturas",
    excerpt:
      "Estructuras de peones, planes típicos y los errores más frecuentes al construir un repertorio.",
    image: "/design-import/assets/thumb-aperturas.png",
    meta: "28 de julio, 2026 · 8 min",
  },
  {
    title: "La posición de Lucena, paso a paso",
    category: "Finales",
    excerpt:
      "El método de conversión más importante del ajedrez, explicado movimiento por movimiento.",
    image: "/design-import/assets/thumb-finales.png",
    meta: "21 de julio, 2026 · 10 min",
  },
  {
    title: "Cómo aprovechar un puesto avanzado en el medio juego",
    category: "Estrategia",
    excerpt:
      "Dónde colocar las piezas cuando la estructura te concede una casilla débil y qué hacer después.",
    image: "/design-import/assets/thumb-metodo.png",
    meta: "14 de julio, 2026 · 9 min",
  },
  {
    title: "Siete patrones que debes reconocer de inmediato",
    category: "Táctica",
    excerpt:
      "Clavadas, horquillas y ataques descubiertos: los motivos que deciden la mayoría de las partidas por debajo de 2000.",
    image: "/design-import/assets/thumb-tactica.png",
    meta: "8 de julio, 2026 · 7 min",
  },
];

const highlights = [
  "Cómo organizar tu entrenamiento de ajedrez",
  "Siete patrones que debes reconocer de inmediato",
  "Cómo estudiar una partida de gran maestro sin motor",
];

export default function BlogPage() {
  return (
    <div className="blog-page">
      <div className="blog-page__shell">
        <div className="blog-page__glow" />

        <div className="blog-page__wrap">
          <header className="masthead">
            <Link href="/" className="blog-brand">
              <span className="blog-brand__accent">365</span>
              <span className="blog-brand__label">DiasDeAjedrez</span>
              <span className="blog-brand__marks">
                <span className="blog-brand__mark" />
                <span className="blog-brand__mark blog-brand__mark_hidden" />
                <span className="blog-brand__mark blog-brand__mark_hidden" />
                <span className="blog-brand__mark" />
              </span>
            </Link>

            <div className="masthead__center">
              <div className="masthead__title">El Tablero</div>
              <div className="masthead__subtitle">
                <span className="masthead__subtitle-line" />
                <span>Cuaderno de la academia · Agosto 2026</span>
                <span className="masthead__subtitle-line" />
              </div>
            </div>

            <div className="masthead__right">
              <div className="masthead__edition">Edición nº 14</div>
              <nav className="masthead__nav">
                <Link href="/" className="masthead__nav-link">Inicio</Link>
                <Link href="/blog" className="masthead__nav-link">Blog</Link>
                <Link href="/" className="masthead__nav-link">Herramientas</Link>
                <Link href="/" className="masthead__nav-link">Nosotros</Link>
              </nav>
              <Link href="/#planes" className="blog-button blog-button_variant_primary">
                Primera clase gratis
              </Link>
            </div>
          </header>

          <div className="ticker">
            <span className="ticker__label">En esta edición</span>
            <div className="ticker__items">
              <Link href="#aperturas" className="ticker__item">Aperturas <span className="ticker__item-count">12</span></Link>
              <Link href="#tactica" className="ticker__item">Táctica <span className="ticker__item-count">09</span></Link>
              <Link href="#estrategia" className="ticker__item">Estrategia <span className="ticker__item-count">07</span></Link>
              <Link href="#finales" className="ticker__item">Finales <span className="ticker__item-count">06</span></Link>
              <Link href="#analisis" className="ticker__item">Análisis de partidas <span className="ticker__item-count">11</span></Link>
            </div>
          </div>

          <section className="portada">
            <div className="portada__left">
              <article className="article-card">
                <span className="eyebrow">Método</span>
                <h3 className="article-card__title">Cómo organizar tu entrenamiento de ajedrez</h3>
                <p className="article-card__text">
                  Primero conocimiento sólido, después cálculo y competencia. Una guía para entrenar con orden y ver resultados en tres meses.
                </p>
                <Link href="#" className="article-card__link">
                  Leer <span className="link-arrow">⟶</span>
                </Link>
              </article>

              <article id="tactica" className="article-card">
                <div className="media-frame media-frame_margin_bottom">
                  <img className="media-frame__image" src="/design-import/assets/thumb-tactica.png" alt="Patrones tácticos" />
                </div>
                <span className="eyebrow">Táctica</span>
                <h3 className="article-card__title">Siete patrones que debes reconocer de inmediato</h3>
                <p className="article-card__text">
                  Clavadas, horquillas y ataques descubiertos: los motivos que deciden la mayoría de las partidas por debajo de 2000.
                </p>
                <Link href="#" className="article-card__link">
                  Leer <span className="link-arrow">⟶</span>
                </Link>
              </article>
            </div>

            <div className="portada__center">
              <article className="hero-article">
                <div className="media-frame">
                  <img className="media-frame__image" src="/design-import/assets/thumb-metodo.png" alt="Análisis de una partida" />
                  <span className="media-frame__badge">Portada</span>
                </div>
                <div className="hero-article__meta">
                  <span>Análisis de partidas</span>
                  <span className="hero-article__meta-dot" />
                  <span className="card-meta">12 min de lectura</span>
                </div>
                <h2 className="hero-article__title">
                  <Link href="#" className="hero-article__title-link">La torre en c3: anatomía de una casilla que decide la partida</Link>
                </h2>
                <p className="hero-article__text">
                  Sebastián Luna comenta su mejor partida jugada con negras en una Caro-Kann, Ataque Panov. Cómo neutralizar la presión central, por qué el cambio al final de torres era la decisión correcta y de qué manera la marcha del rey a e3 culmina el plan.
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
            </div>

            <div className="portada__right">
              <div className="sidebar-card">
                <h4 className="sidebar-card__title">Clase abierta cada jueves</h4>
                <p className="sidebar-card__text">Una hora en vivo, análisis de posiciones y preguntas al final.</p>
                <Link href="/#planes" className="blog-button blog-button_variant_primary">Reservar lugar</Link>
              </div>

              <h4 className="reading-list__title">Lo más leído</h4>
              <div className="reading-list">
                {highlights.map((item, index) => (
                  <Link key={item} href="#" className="reading-list__link">
                    <span className="reading-list__index">{String(index + 1).padStart(2, "0")}</span>
                    <span className="reading-list__label">{item}</span>
                  </Link>
                ))}
              </div>

              <div className="subscribe-box">
                <h4 className="subscribe-box__title">Recibe cada edición</h4>
                <p className="subscribe-box__text">Un correo al mes con lo publicado y un ejercicio para resolver.</p>
                <input className="subscribe-box__input" type="email" placeholder="Tu correo electrónico" />
                <button className="subscribe-box__submit" type="button">Suscribirme</button>
              </div>
            </div>
          </section>

          <section className="more-section">
            <div className="more-section__header">
              <h2 className="more-section__title">Más de esta edición</h2>
              <span className="more-section__page">Página 2</span>
            </div>
            <div className="more-section__grid">
              {posts.map((post) => (
                <article key={post.title} id={post.category.toLowerCase() === "aperturas" ? "aperturas" : post.category.toLowerCase() === "finales" ? "finales" : post.category.toLowerCase() === "estrategia" ? "estrategia" : undefined} className="more-section__card">
                  <img className="more-section__card-image" src={post.image} alt={post.title} />
                  <span className="eyebrow">{post.category}</span>
                  <h3 className="more-section__card-title">{post.title}</h3>
                  <p className="more-section__card-text">{post.excerpt}</p>
                  <span className="card-meta">{post.meta}</span>
                </article>
              ))}
            </div>

            <div className="more-section__cta-row" id="analisis">
              <Link href="/" className="blog-button blog-button_variant_secondary blog-button_size_lg">Ver todos los artículos <span className="link-arrow">⟶</span></Link>
            </div>
          </section>
        </div>

        <footer className="blog-footer">
          <div className="blog-footer__wrap">
            <div className="blog-footer__grid">
              <div>
                <Link href="/" className="blog-brand blog-brand_context_footer">
                  <span className="blog-brand__accent blog-brand__accent_context_footer">365</span>
                  <span className="blog-brand__label blog-brand__label_context_footer">DiasDeAjedrez</span>
                  <span className="blog-brand__marks">
                    <span className="blog-brand__mark blog-brand__mark_context_footer" />
                    <span className="blog-brand__mark blog-brand__mark_hidden" />
                    <span className="blog-brand__mark blog-brand__mark_hidden" />
                    <span className="blog-brand__mark blog-brand__mark_context_footer" />
                  </span>
                </Link>
                <p className="blog-footer__description">
                  Academia de ajedrez en línea. Entrenamiento estructurado y clases personalizadas para jugadores que quieren mejorar en serio.
                </p>
              </div>
              <div>
                <h4 className="blog-footer__heading">Academia</h4>
                <div className="blog-footer__links">
                  <Link href="/" className="blog-footer__link">Inicio</Link>
                  <Link href="/" className="blog-footer__link">Nosotros</Link>
                  <Link href="/blog" className="blog-footer__link">Blog</Link>
                  <Link href="/" className="blog-footer__link">Aviso de privacidad</Link>
                  <Link href="/" className="blog-footer__link">Términos y condiciones</Link>
                </div>
              </div>
              <div>
                <h4 className="blog-footer__heading">Contacto</h4>
                <div className="blog-footer__links">
                  <Link href="mailto:contacto@365diasdeajedrez.com" className="blog-footer__link">contacto@365diasdeajedrez.com</Link>
                  <Link href="#" className="blog-footer__link">WhatsApp: +52 000 000 0000</Link>
                  <span className="blog-footer__text">Clases en línea · Español</span>
                </div>
              </div>
            </div>
            <div className="blog-footer__bottom">
              <span>© 2026 365DiasDeAjedrez. Todos los derechos reservados.</span>
              <span>Entrena como un jugador serio.</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
