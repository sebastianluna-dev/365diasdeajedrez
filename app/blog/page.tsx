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
    <div className="blogPage">
      <div className="blogShell">
        <div className="blogGlow" />

        <div className="blogWrap">
          <header className="masthead">
            <Link href="/" className="brand">
              <span className="brandAccent">365</span>
              <span>DiasDeAjedrez</span>
              <span className="brandMarks">
                <span />
                <span />
                <span />
                <span />
              </span>
            </Link>

            <div className="mastheadCenter">
              <div className="title">El Tablero</div>
              <div className="subTitle">
                <span />
                <span>Cuaderno de la academia · Agosto 2026</span>
                <span />
              </div>
            </div>

            <div className="mastheadRight">
              <div className="editionTag">Edición nº 14</div>
              <nav className="nav">
                <Link href="/">Inicio</Link>
                <Link href="/blog">Blog</Link>
                <Link href="/">Herramientas</Link>
                <Link href="/">Nosotros</Link>
              </nav>
              <Link href="/#planes" className="buttonPrimary">
                Primera clase gratis
              </Link>
            </div>
          </header>

          <div className="ticker">
            <span className="tickerLabel">En esta edición</span>
            <div className="tickerItems">
              <Link href="#aperturas">Aperturas <span className="accent">12</span></Link>
              <Link href="#tactica">Táctica <span className="accent">09</span></Link>
              <Link href="#estrategia">Estrategia <span className="accent">07</span></Link>
              <Link href="#finales">Finales <span className="accent">06</span></Link>
              <Link href="#analisis">Análisis de partidas <span className="accent">11</span></Link>
            </div>
          </div>

          <section className="portada">
            <div className="portadaLeft">
              <article>
                <span className="eyebrow">Método</span>
                <h3 className="cardTitle">Cómo organizar tu entrenamiento de ajedrez</h3>
                <p className="cardText">
                  Primero conocimiento sólido, después cálculo y competencia. Una guía para entrenar con orden y ver resultados en tres meses.
                </p>
                <Link href="#" className="readLink">
                  Leer <span style={{ color: "#a81e22" }}>⟶</span>
                </Link>
              </article>

              <article id="tactica">
                <div className="heroImage" style={{ marginBottom: 16 }}>
                  <img src="/design-import/assets/thumb-tactica.png" alt="Patrones tácticos" />
                </div>
                <span className="eyebrow">Táctica</span>
                <h3 className="cardTitle">Siete patrones que debes reconocer de inmediato</h3>
                <p className="cardText">
                  Clavadas, horquillas y ataques descubiertos: los motivos que deciden la mayoría de las partidas por debajo de 2000.
                </p>
                <Link href="#" className="readLink">
                  Leer <span style={{ color: "#a81e22" }}>⟶</span>
                </Link>
              </article>
            </div>

            <div className="portadaCenter">
              <article>
                <div className="heroImage">
                  <img src="/design-import/assets/thumb-metodo.png" alt="Análisis de una partida" />
                  <span className="heroBadge">Portada</span>
                </div>
                <div className="heroMetaRow">
                  <span>Análisis de partidas</span>
                  <span className="dot" />
                  <span className="cardMeta">12 min de lectura</span>
                </div>
                <h2 className="heroTitle">
                  <Link href="#">La torre en c3: anatomía de una casilla que decide la partida</Link>
                </h2>
                <p className="heroText">
                  Sebastián Luna comenta su mejor partida jugada con negras en una Caro-Kann, Ataque Panov. Cómo neutralizar la presión central, por qué el cambio al final de torres era la decisión correcta y de qué manera la marcha del rey a e3 culmina el plan.
                </p>
                <div className="heroFooter">
                  <div className="author">
                    <div className="avatar">
                      <img src="/design-import/assets/profesores/diego.jpg" alt="Sebastián Luna" />
                    </div>
                    <div>
                      <div className="authorName">Sebastián Luna</div>
                      <div className="authorRole">Instructor · 3 de agosto, 2026</div>
                    </div>
                  </div>
                  <Link href="#" className="secondaryButton">
                    Leer la partida completa <span style={{ color: "#a81e22" }}>⟶</span>
                  </Link>
                </div>
              </article>
            </div>

            <div className="portadaRight">
              <div className="sidebarCard">
                <h4>Clase abierta cada jueves</h4>
                <p>Una hora en vivo, análisis de posiciones y preguntas al final.</p>
                <Link href="/#planes" className="buttonPrimary">Reservar lugar</Link>
              </div>

              <h4 className="highlightListTitle">Lo más leído</h4>
              <div className="highlightList">
                {highlights.map((item, index) => (
                  <Link key={item} href="#">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <span>{item}</span>
                  </Link>
                ))}
              </div>

              <div className="subscribeBox">
                <h4>Recibe cada edición</h4>
                <p>Un correo al mes con lo publicado y un ejercicio para resolver.</p>
                <input type="email" placeholder="Tu correo electrónico" />
                <button type="button">Suscribirme</button>
              </div>
            </div>
          </section>

          <section className="moreSection">
            <div className="moreHeader">
              <h2>Más de esta edición</h2>
              <span>Página 2</span>
            </div>
            <div className="gridCards">
              {posts.map((post) => (
                <article key={post.title} id={post.category.toLowerCase() === "aperturas" ? "aperturas" : post.category.toLowerCase() === "finales" ? "finales" : post.category.toLowerCase() === "estrategia" ? "estrategia" : undefined}>
                  <img src={post.image} alt={post.title} />
                  <span className="eyebrow">{post.category}</span>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <span className="cardMeta">{post.meta}</span>
                </article>
              ))}
            </div>

            <div className="ctaRow" id="analisis">
              <Link href="/">Ver todos los artículos <span style={{ color: "#a81e22" }}>⟶</span></Link>
            </div>
          </section>
        </div>

        <footer>
          <div className="footerWrap">
            <div className="footerGrid">
              <div>
                <Link href="/" className="brand" style={{ color: "#f2ede7" }}>
                  <span className="brandAccent">365</span>
                  <span>DiasDeAjedrez</span>
                  <span className="brandMarks" style={{ color: "#f2ede7" }}>
                    <span style={{ background: "#f2ede7" }} />
                    <span />
                    <span />
                    <span style={{ background: "#f2ede7" }} />
                  </span>
                </Link>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: "#b4a99d", margin: "14px 0 0", maxWidth: "36ch" }}>
                  Academia de ajedrez en línea. Entrenamiento estructurado y clases personalizadas para jugadores que quieren mejorar en serio.
                </p>
              </div>
              <div>
                <h4>Academia</h4>
                <div className="footerLinks">
                  <Link href="/">Inicio</Link>
                  <Link href="/">Nosotros</Link>
                  <Link href="/blog">Blog</Link>
                  <Link href="/">Aviso de privacidad</Link>
                  <Link href="/">Términos y condiciones</Link>
                </div>
              </div>
              <div>
                <h4>Contacto</h4>
                <div className="footerLinks">
                  <Link href="mailto:contacto@365diasdeajedrez.com">contacto@365diasdeajedrez.com</Link>
                  <Link href="#">WhatsApp: +52 000 000 0000</Link>
                  <span>Clases en línea · Español</span>
                </div>
              </div>
            </div>
            <div className="footerBottom">
              <span>© 2026 365DiasDeAjedrez. Todos los derechos reservados.</span>
              <span>Entrena como un jugador serio.</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
