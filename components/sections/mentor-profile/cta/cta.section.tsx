import Link from "next/link";
import "./cta.section.css";

export function MentorCtaSection() {
  return (
    <section className="mentor-cta">
      <div className="mentor-cta__card">
        <div className="mentor-cta__glow" />
        <div className="mentor-cta__content">
          <h2 className="mentor-cta__title">Empecemos por entender tu ajedrez.</h2>
          <p className="mentor-cta__text">
            Una sesión de diagnóstico para ver tus partidas, detectar qué te está frenando y armar un plan de
            trabajo a tu medida.
          </p>
          <div className="mentor-cta__actions">
            <Link href="/#planes" className="button button_variant_primary">
              Reservar mi clase
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
