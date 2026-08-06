import "./values.section.css";

const values = [
  {
    icon: "♟",
    title: "Pasión por el ajedrez",
    text: "El aprendizaje comienza con la curiosidad: transmitimos el entusiasmo por descubrir ideas y disfrutar el proceso de estudio.",
  },
  {
    icon: "♞",
    title: "Desaprender para aprender",
    text: "Progresar implica cuestionar hábitos y corregir conceptos erróneos. El desaprendizaje es parte esencial del crecimiento.",
  },
  {
    icon: "♝",
    title: "Memorización con comprensión",
    text: "La memoria es una herramienta, no el objetivo: memorizamos desde los principios y planes para aplicarlos en posiciones nuevas.",
  },
  {
    icon: "♜",
    title: "Respeto y deportividad",
    text: "Respeto por compañeros, rivales y el juego: humildad para aprender, honestidad al competir y actitud deportiva dentro y fuera del tablero.",
  },
];

export function ValoresSection() {
  return (
    <section id="valores" className="section nosotros-values">
      <div className="section__inner">
        <div className="nosotros-values__head">
          <span className="nosotros-values__eyebrow">En lo que creemos</span>
          <h2 className="nosotros-values__title">Nuestros valores</h2>
          <p className="nosotros-values__text">
            Cuatro principios que guían cada clase, cada análisis y cada partida que jugamos juntos.
          </p>
        </div>

        <div className="nosotros-values__grid">
          {values.map((value) => (
            <div key={value.title} className="nosotros-values__card">
              <span className="nosotros-values__card-icon">{value.icon}</span>
              <h3 className="nosotros-values__card-title">{value.title}</h3>
              <p className="nosotros-values__card-text">{value.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
