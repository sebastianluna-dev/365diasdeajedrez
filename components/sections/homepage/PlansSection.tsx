import Link from "next/link";

export function PlansSection() {
  return (
    <section id="planes" className="sectionBlock light">
      <div className="sectionInner">
        <div
          className="sectionHead"
          style={{ justifyContent: "center", textAlign: "center" }}
        >
          <div>
            <h2 className="sectionTitle">Paquetes</h2>
            <p className="sectionText">
              Entrena una vez por semana o duplica el ritmo.
            </p>
          </div>
        </div>

        <div className="plansWrap">
          <div className="planCard">
            <h3>Plan Semanal</h3>
            <div className="priceRow">
              <span className="price">$89</span>
              <span className="mutedText">/ mes</span>
            </div>
            <p>
              Una clase por semana para entrenar con constancia, corregir
              errores y avanzar con un plan claro.
            </p>
            <ul className="planList">
              <li>
                <span>✓</span> 1 clase guiada por semana
              </li>
              <li>
                <span>✓</span> Seguimiento del avance
              </li>
              <li>
                <span>✓</span> Material y ejercicios
              </li>
            </ul>
            <Link href="/#planes" className="planButton">
              Empieza el Plan Semanal
            </Link>
          </div>

          <div className="planCard featured">
            <h3>Plan Mensual</h3>
            <div className="priceRow">
              <span className="price">$159</span>
              <span className="mutedText">/ mes</span>
            </div>
            <p>
              Más sesiones, más seguimiento y una progresión más rápida para
              quienes quieren avanzar con mayor intensidad.
            </p>
            <ul className="planList">
              <li>
                <span>✓</span> 2 clases semanales
              </li>
              <li>
                <span>✓</span> Análisis de partidas
              </li>
              <li>
                <span>✓</span> Plan de estudio completo
              </li>
            </ul>
            <Link href="/#planes" className="planButton alt">
              Prueba el Plan Mensual
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
