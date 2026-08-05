import Link from "next/link";
import "./cta.css";

export function StickyCtaAndFooter() {
  return (
    <>
      <div className="sticky-cta">
        <div className="sticky-cta__inner">
          <div className="sticky-cta__clock">
            <span>⏰</span>
            <span>900s</span>
          </div>
          <div>
            <p className="sticky-cta__title">Se acaba el tiempo.</p>
            <p className="sticky-cta__subtitle">No te quedes sin tu lugar en la academia.</p>
          </div>
          <div className="sticky-cta__actions">
            <Link className="sticky-cta__link" href="https://wa.me/520000000000">WhatsApp</Link>
            <Link className="sticky-cta__link" href="mailto:contacto@365diasdeajedrez.com">Email</Link>
            <Link href="/#planes" className="sticky-cta__link sticky-cta__link_variant_primary">
              Únete a la academia
            </Link>
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__grid">
            <div>
              <Link href="/#inicio" className="brand" style={{ fontSize: 20 }}>
                <span className="brand__accent">365</span>
                <span>DiasDeAjedrez</span>
              </Link>
              <p className="footer__description">
                Academia de ajedrez en línea. Entrenamiento estructurado y
                clases personalizadas para jugadores que quieren mejorar en
                serio.
              </p>
            </div>
            <div>
              <h4 className="footer__heading">Academia</h4>
              <div className="footer__links">
                <Link href="/#inicio">Inicio</Link>
                <Link href="/#">Nosotros</Link>
                <Link href="/blog">Blog</Link>
                <Link href="/#">Aviso de privacidad</Link>
                <Link href="/#">Términos y condiciones</Link>
              </div>
            </div>
            <div>
              <h4 className="footer__heading">Contacto</h4>
              <div className="footer__links">
                <Link href="mailto:contacto@365diasdeajedrez.com">
                  contacto@365diasdeajedrez.com
                </Link>
                <Link href="#">WhatsApp: +52 000 000 0000</Link>
                <span>Clases en línea · Español</span>
              </div>
            </div>
          </div>
          <div className="footer__note">
            <span>© 2026 365DiasDeAjedrez. Todos los derechos reservados.</span>
            <span>Entrena como un jugador serio.</span>
          </div>
        </div>
      </footer>
    </>
  );
}
