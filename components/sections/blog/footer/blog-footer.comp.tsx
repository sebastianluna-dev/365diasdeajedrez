import Link from "next/link";
import { BlogBrand } from "../blog-brand/blog-brand.comp";
import "./blog-footer.comp.css";

export function BlogFooter() {
  return (
    <footer className="blog-footer">
      <div className="blog-footer__wrap">
        <div className="blog-footer__grid">
          <div>
            <BlogBrand context="footer" />
            <p className="blog-footer__description">
              Academia de ajedrez en línea. Entrenamiento estructurado y clases personalizadas para jugadores que
              quieren mejorar en serio.
            </p>
          </div>
          <div>
            <h4 className="blog-footer__heading">Academia</h4>
            <div className="blog-footer__links">
              <Link href="/" className="blog-footer__link">Inicio</Link>
              <Link href="/" className="blog-footer__link">Nosotros</Link>
              <Link href="/blog" className="blog-footer__link">Blog</Link>
              <Link href="/" className="blog-footer__link">Aviso de privacidad</Link>
              <Link href="/" className="blog-footer__link">Términos y condiciones</Link>
            </div>
          </div>
          <div>
            <h4 className="blog-footer__heading">Contacto</h4>
            <div className="blog-footer__links">
              <Link href="mailto:contacto@365diasdeajedrez.com" className="blog-footer__link">
                contacto@365diasdeajedrez.com
              </Link>
              <Link href="#" className="blog-footer__link">WhatsApp: +52 000 000 0000</Link>
              <span className="blog-footer__text">Clases en línea · Español</span>
            </div>
          </div>
        </div>
        <div className="blog-footer__bottom">
          <span>© 2026 365DiasDeAjedrez. Todos los derechos reservados.</span>
          <span>Entrena como un jugador serio.</span>
        </div>
      </div>
    </footer>
  );
}
