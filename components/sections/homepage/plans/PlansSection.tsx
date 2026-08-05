import Link from "next/link";
import "./plans.css";

export function PlansSection() {
  return (
    <section id="planes" className="section section_theme_light plans">
      <div className="section__inner">
        <div
          className="section__head"
          style={{ justifyContent: "center", textAlign: "center" }}
        >
          <div>
            <h2 className="section__title">Paquetes</h2>
            <p className="section__text">
              Entrena una vez por semana o duplica el ritmo.
            </p>
          </div>
        </div>

        <div className="plans__wrap">
          <div className="plan-card">
            <h3 className="plan-card__title">Plan Semanal</h3>
            <div className="plan-card__price-row">
              <span className="plan-card__price">$89</span>
              <span className="muted-text">/ mes</span>
            </div>
            <p className="plan-card__description">
              Una clase por semana para entrenar con constancia, corregir
              errores y avanzar con un plan claro.
            </p>
            <ul className="plan-card__list">
              <li className="plan-card__list-item">
                <span className="plan-card__list-icon">✓</span> 1 clase guiada por semana
              </li>
              <li className="plan-card__list-item">
                <span className="plan-card__list-icon">✓</span> Seguimiento del avance
              </li>
              <li className="plan-card__list-item">
                <span className="plan-card__list-icon">✓</span> Material y ejercicios
              </li>
            </ul>
            <Link href="/#planes" className="plan-card__button">
              Empieza el Plan Semanal
            </Link>
          </div>

          <div className="plan-card plan-card_featured">
            <h3 className="plan-card__title">Plan Mensual</h3>
            <div className="plan-card__price-row">
              <span className="plan-card__price">$159</span>
              <span className="muted-text">/ mes</span>
            </div>
            <p className="plan-card__description">
              Más sesiones, más seguimiento y una progresión más rápida para
              quienes quieren avanzar con mayor intensidad.
            </p>
            <ul className="plan-card__list">
              <li className="plan-card__list-item">
                <span className="plan-card__list-icon">✓</span> 2 clases semanales
              </li>
              <li className="plan-card__list-item">
                <span className="plan-card__list-icon">✓</span> Análisis de partidas
              </li>
              <li className="plan-card__list-item">
                <span className="plan-card__list-icon">✓</span> Plan de estudio completo
              </li>
            </ul>
            <Link href="/#planes" className="plan-card__button plan-card__button_variant_alt">
              Prueba el Plan Mensual
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
