export function ProgramSection() {
  return (
    <section id="programa" className="sectionBlock light">
      <div className="sectionInner">
        <div className="sectionHead">
          <div>
            <span className="sectionEyebrow">Programa</span>
            <h2 className="sectionTitle">
              Una ruta clara para mejorar sin perderte.
            </h2>
            <p className="sectionText">
              El Método 365 está pensado para trabajar las habilidades que
              realmente cambian una partida: posición, criterio, cálculo y
              ejecución.
            </p>
          </div>
          <div className="sectionText" style={{ maxWidth: 220 }}>
            Cinco módulos progresivos y un plan de estudio adaptado a tu ritmo.
          </div>
        </div>

        <div className="programCardWrap">
          <div className="programList">
            <div className="programListItem">
              <span>01</span>
              <div>
                <strong>Fundamentos</strong>
                <br />
                Principios del juego y bases sólidas.
              </div>
            </div>
            <div className="programListItem">
              <span>02</span>
              <div>
                <strong>Aperturas</strong>
                <br />
                Comprender ideas en lugar de memorizar líneas.
              </div>
            </div>
            <div className="programListItem">
              <span>03</span>
              <div>
                <strong>Medio juego</strong>
                <br />
                Planes, estructuras y evaluación de posiciones.
              </div>
            </div>
            <div className="programListItem">
              <span>04</span>
              <div>
                <strong>Cálculo</strong>
                <br />
                Visualización, variantes y precisión en la práctica.
              </div>
            </div>
            <div className="programListItem">
              <span>05</span>
              <div>
                <strong>Finales</strong>
                <br />
                Convertir ventajas en resultados concretos.
              </div>
            </div>
          </div>

          <div className="programPanel">
            <h3>Aprende a pensar, no sólo a mover.</h3>
            <p>
              La mitad del programa está dedicada a comprender el juego; la otra
              mitad, a la ejecución técnica. Nuestro objetivo es que tomes
              mejores decisiones y construyas criterio propio.
            </p>
            <div className="programStats">
              <div className="programStat">
                <strong>5 módulos</strong>
                <br />
                progresivos
              </div>
              <div className="programStat">
                <strong>1 plan</strong>
                <br />a tu medida
              </div>
              <div className="programStat">
                <strong>100%</strong>
                <br />
                en vivo y guiado
              </div>
            </div>
          </div>
        </div>

        <p className="programNote">
          No buscamos que memorices más movimientos, sino que aprendas a
          encontrar las mejores ideas por ti mismo.
        </p>
      </div>
    </section>
  );
}
