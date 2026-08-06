import "./ticker.comp.css";

export function Ticker() {
  return (
    <div className="ticker">
      <span className="ticker__label">En esta edición</span>
      <div className="ticker__items">
        <span className="ticker__item">Aperturas</span>
        <span className="ticker__item">Táctica</span>
        <span className="ticker__item">Estrategia</span>
        <span className="ticker__item">Finales</span>
        <span className="ticker__item">Análisis de partidas</span>
      </div>
    </div>
  );
}
