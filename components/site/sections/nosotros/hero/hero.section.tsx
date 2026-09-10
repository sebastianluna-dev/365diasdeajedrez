import "./hero.section.css";

const stats = [
  { value: "10", label: "años enseñando" },
  { value: "2000+", label: "clases impartidas" },
  { value: "12", label: "meses de programa" },
];

export function NosotrosHeroSection() {
  return (
    <section className="nosotros-hero">
      <div className="nosotros-hero__glow" />
      <div className="nosotros-hero__content">
        <span className="nosotros-hero__eyebrow">Quiénes somos</span>
        <h1 className="nosotros-hero__title">
          Una academia construida alrededor de una idea: entender antes que memorizar.
        </h1>
        <p className="nosotros-hero__text">
          365DiasDeAjedrez nació de años de competencia y de enseñanza. Trabajamos con jugadores que quieren dejar de
          improvisar: un plan de estudio propio, análisis honesto de cada partida y clases donde siempre se explica
          el porqué de cada decisión.
        </p>
        <div className="nosotros-hero__stats">
          {stats.map((stat) => (
            <div key={stat.label} className="nosotros-hero__stat">
              <div className="nosotros-hero__stat-value">{stat.value}</div>
              <div className="nosotros-hero__stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
