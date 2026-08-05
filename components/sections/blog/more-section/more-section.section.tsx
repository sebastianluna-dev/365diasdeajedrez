import Link from "next/link";
import { PostCard } from "./post-card.comp";
import "./more-section.section.css";

const posts = [
  {
    id: "aperturas",
    title: "Deja de memorizar variantes y empieza a entender ideas",
    category: "Aperturas",
    excerpt: "Estructuras de peones, planes típicos y los errores más frecuentes al construir un repertorio.",
    image: "/design-import/assets/thumb-aperturas.png",
    meta: "28 de julio, 2026 · 8 min",
  },
  {
    id: "finales",
    title: "La posición de Lucena, paso a paso",
    category: "Finales",
    excerpt: "El método de conversión más importante del ajedrez, explicado movimiento por movimiento.",
    image: "/design-import/assets/thumb-finales.png",
    meta: "21 de julio, 2026 · 10 min",
  },
  {
    id: "estrategia",
    title: "Cómo aprovechar un puesto avanzado en el medio juego",
    category: "Estrategia",
    excerpt: "Dónde colocar las piezas cuando la estructura te concede una casilla débil y qué hacer después.",
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

export function MoreSection() {
  return (
    <section className="more-section">
      <div className="more-section__header">
        <h2 className="more-section__title">Más de esta edición</h2>
        <span className="more-section__page">Página 2</span>
      </div>
      <div className="more-section__grid">
        {posts.map((post) => (
          <PostCard
            key={post.title}
            id={post.id}
            image={post.image}
            category={post.category}
            title={post.title}
            excerpt={post.excerpt}
            meta={post.meta}
          />
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
