import Link from "next/link";
import "./cta.section.css";

export function NosotrosCtaSection() {
  return (
    <section className="nosotros-cta">
      <div className="nosotros-cta__card">
        <div className="nosotros-cta__copy">
          <h2 className="nosotros-cta__title">¿Entrenamos juntos?</h2>
          <p className="nosotros-cta__text">
            Agenda tu primera clase de diagnóstico y define un plan de estudio a tu medida.
          </p>
        </div>
        <Link href="/#planes" className="button button_variant_primary">
          Únete a la academia
        </Link>
      </div>
    </section>
  );
}
