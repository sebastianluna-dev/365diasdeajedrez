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
    <section id="blog" className="sectionBlock resourcesSection">
      <div className="sectionInner">
        <div className="sectionHead">
          <div>
            <span className="sectionEyebrow">Recursos</span>
            <h2 className="sectionTitle">
              Material de estudio para todos los niveles.
            </h2>
            <p className="sectionText">
              Artículos, ideas y ejercicios para seguir aprendiendo entre
              clases.
            </p>
          </div>
          <Link href="/blog" className="primaryBtn">
            Ver más
          </Link>
        </div>

        <div className="resourcesGrid">
          <div className="resourceTabs">
            <button className="resourceTab">Blogs</button>
            <button className="resourceTab">Videos</button>
          </div>
          <div className="resourceCards">
            {resources.map((resource) => (
              <article key={resource.title} className="resourceCard">
                <img src={resource.image} alt={resource.title} />
                <div className="resourceBody">
                  <h3>{resource.title}</h3>
                  <p>{resource.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
