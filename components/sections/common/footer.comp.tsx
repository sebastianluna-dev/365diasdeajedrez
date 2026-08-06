import Link from "next/link";
import { Logo } from "./logo.comp";
import "./footer.comp.css";

interface FooterProps {
  accent?: "orange" | "red";
}

export function Footer({ accent = "orange" }: FooterProps) {
  return (
    <footer className={`site-footer site-footer_accent_${accent}`}>
      <div className="site-footer__wrap">
        <div className="site-footer__grid">
          <div>
            <Logo theme="dark" accent={accent} />
            <p className="site-footer__description">
              Academia de ajedrez en línea. Entrenamiento estructurado y clases personalizadas para jugadores que
              quieren mejorar en serio.
            </p>
          </div>
          <div>
            <h4 className="site-footer__heading">Academia</h4>
            <div className="site-footer__links">
              <Link href="/" className="site-footer__link">
                Inicio
              </Link>
              <Link href="/blog" className="site-footer__link">
                Blog
              </Link>
              <Link href="/reloj-de-ajedrez" className="site-footer__link">
                Reloj de ajedrez
              </Link>
              <Link href="/" className="site-footer__link">
                Nosotros
              </Link>
              <Link href="/" className="site-footer__link">
                Aviso de privacidad
              </Link>
              <Link href="/" className="site-footer__link">
                Términos y condiciones
              </Link>
            </div>
          </div>
          <div>
            <h4 className="site-footer__heading">Contacto</h4>
            <div className="site-footer__links">
              <Link href="mailto:contacto@365diasdeajedrez.com" className="site-footer__link">
                contacto@365diasdeajedrez.com
              </Link>
              <Link href="https://w.app/365diasdeajedrez" className="site-footer__link">
                WhatsApp: +52 229 134 8338
              </Link>
              <span className="site-footer__text">Clases en línea · Español</span>
            </div>
          </div>
        </div>
        <div className="site-footer__bottom">
          <span>© 2026 365DiasDeAjedrez. Todos los derechos reservados.</span>
          <span>Entrena como un jugador serio.</span>
        </div>
      </div>
    </footer>
  );
}
