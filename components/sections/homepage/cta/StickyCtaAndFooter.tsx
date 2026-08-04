import Link from "next/link";
import "./cta.css";

export function StickyCtaAndFooter() {
  return (
    <>
      <div className="stickyCta">
        <div className="stickyInner">
          <div className="ctaClock">
            <span>⏰</span>
            <span>900s</span>
          </div>
          <div className="ctaText">
            <p
              style={{
                fontFamily: "var(--font-gramatika), sans-serif",
                fontSize: 16,
                fontWeight: 700,
                color: "#f2ede7",
              }}
            >
              Se acaba el tiempo.
            </p>
            <p style={{ fontSize: 14, color: "#b4a99d", marginTop: 2 }}>
              No te quedes sin tu lugar en la academia.
            </p>
          </div>
          <div className="ctaActions">
            <Link href="https://wa.me/520000000000">WhatsApp</Link>
            <Link href="mailto:contacto@365diasdeajedrez.com">Email</Link>
            <Link href="/#planes" className="ctaPrimary">
              Únete a la academia
            </Link>
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="footerInner">
          <div className="footerGrid">
            <div>
              <Link href="/#inicio" className="brand" style={{ fontSize: 20 }}>
                <span className="brandAccent">365</span>
                <span>DiasDeAjedrez</span>
              </Link>
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: "#b4a99d",
                  margin: "14px 0 0",
                  maxWidth: "36ch",
                }}
              >
                Academia de ajedrez en línea. Entrenamiento estructurado y
                clases personalizadas para jugadores que quieren mejorar en
                serio.
              </p>
            </div>
            <div>
              <h4>Academia</h4>
              <div className="footerLinks">
                <Link href="/#inicio">Inicio</Link>
                <Link href="/#">Nosotros</Link>
                <Link href="/blog">Blog</Link>
                <Link href="/#">Aviso de privacidad</Link>
                <Link href="/#">Términos y condiciones</Link>
              </div>
            </div>
            <div>
              <h4>Contacto</h4>
              <div className="footerLinks">
                <Link href="mailto:contacto@365diasdeajedrez.com">
                  contacto@365diasdeajedrez.com
                </Link>
                <Link href="#">WhatsApp: +52 000 000 0000</Link>
                <span>Clases en línea · Español</span>
              </div>
            </div>
          </div>
          <div className="footerNote">
            <span>© 2026 365DiasDeAjedrez. Todos los derechos reservados.</span>
            <span>Entrena como un jugador serio.</span>
          </div>
        </div>
      </footer>
    </>
  );
}
