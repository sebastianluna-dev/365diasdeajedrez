import Link from "next/link";
import "./site-footer.comp.css";

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__grid">
          <div>
            <Link href="/#inicio" className="brand brand_size_sm">
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
  );
}
