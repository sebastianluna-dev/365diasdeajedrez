import Link from "next/link";
import "./resources.css";

const resources = [
  {
    title: "Cómo pensar en el medio juego",
    text: "Ideas concretas para evaluar una posición y crear un plan sólido.",
    image: "/design-import/assets/thumb-metodo.png",
  },
  {
    title: "Táctica en los primeros minutos",
    text: "Patrones frecuentes y cómo reconocerlos antes de que el ataque se cierre.",
    image: "/design-import/assets/thumb-tactica.png",
  },
  {
    title: "Aperturas con sentido",
    text: "Más allá de la teoría: estructuras, planes y principios.",
    image: "/design-import/assets/thumb-aperturas.png",
  },
];

export function ResourcesSection() {
  return (
    <section id="blog" className="section section_theme_dark resources">
      <div className="section__inner">
        <div className="section__head">
          <div>
            <span className="section__eyebrow">Recursos</span>
            <h2 className="section__title">
              Material de estudio para todos los niveles.
            </h2>
            <p className="section__text">
              Artículos, ideas y ejercicios para seguir aprendiendo entre
              clases.
            </p>
          </div>
          <Link href="/blog" className="button button_variant_primary">
            Ver más
          </Link>
        </div>

        <div className="resources__grid">
          <div className="resources__tabs">
            <button className="resources__tab">Blogs</button>
            <button className="resources__tab">Videos</button>
          </div>
          <div className="resources__cards">
            {resources.map((resource) => (
              <article key={resource.title} className="resource-card">
                <img className="resource-card__image" src={resource.image} alt={resource.title} />
                <div className="resource-card__body">
                  <h3 className="resource-card__title">{resource.title}</h3>
                  <p className="resource-card__text">{resource.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
