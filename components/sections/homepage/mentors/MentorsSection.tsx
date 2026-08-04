import "./mentors.css";

const mentors = [
  {
    name: "Diego Morales",
    role: "Mentor principal",
    text: "Especialista en desarrollo posicional y pensamiento profundo.",
    image: "/design-import/assets/profesores/diego.jpg",
  },
  {
    name: "Emiliano Ruiz",
    role: "Coach de táctica",
    text: "Enfocado en cálculo, patrones y resolución de posiciones reales.",
    image: "/design-import/assets/profesores/emiliano.jpg",
  },
  {
    name: "Andrés Vega",
    role: "Instructor de finales",
    text: "Ayuda a convertir ventajas en resultados concretos y claros.",
    image: "/design-import/assets/profesores/andres.jpg",
  },
  {
    name: "Sebastián Luna",
    role: "Analista de partidas",
    text: "Guía el estudio de partidas clásicas y modernas con criterio.",
    image: "/design-import/assets/profesores/sebastian.jpg",
  },
];

export function MentorsSection() {
  return (
    <section id="mentores" className="sectionBlock dark">
      <div className="sectionInner">
        <div className="sectionHead" style={{ marginBottom: 44 }}>
          <div>
            <span className="sectionEyebrow">Nuestros mentores</span>
            <h2 className="sectionTitle">
              Más que profesores, mentores de tu aprendizaje.
            </h2>
            <p className="sectionText">
              Creemos que enseñar ajedrez es formar la manera de pensar de un
              jugador. Nuestros instructores te acompañarán paso a paso para
              desarrollar criterio, disciplina y confianza sobre el tablero.
            </p>
          </div>
        </div>

        <div className="mentorGrid">
          {mentors.map((mentor) => (
            <article key={mentor.name} className="mentorCard">
              <div className="mentorImage">
                <img src={mentor.image} alt={mentor.name} />
              </div>
              <div className="mentorBody">
                <h3>{mentor.name}</h3>
                <p>{mentor.text}</p>
                <div className="mentorMeta">{mentor.role}</div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
