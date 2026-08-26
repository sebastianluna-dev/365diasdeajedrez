import Link from "next/link";
import { Logo } from "@/components/common/logo.comp";
import { buildWhatsappUrl } from "@/lib/build-whatsapp-url";
import { getSiteSettingsData } from "@/services/site-settings/site-settings.service";
import "./footer.section.css";

interface FooterProps {
  accent?: "orange" | "red";
}

export async function Footer({ accent = "orange" }: FooterProps) {
  const { whatsappNumber, whatsappDefaultMessage } = await getSiteSettingsData();
  const whatsappUrl = buildWhatsappUrl(whatsappNumber, whatsappDefaultMessage);

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
              <Link href="/#programa" className="site-footer__link">
                Programa
              </Link>
              <Link href="/#maestro" className="site-footer__link">
                Maestro
              </Link>
              <Link href="/#planes" className="site-footer__link">
                Paquetes
              </Link>
              <Link href="/#preguntas" className="site-footer__link">
                Preguntas frecuentes
              </Link>
              <Link href="/reloj-de-ajedrez" className="site-footer__link">
                Reloj de ajedrez
              </Link>
            </div>
          </div>
          <div>
            <h4 className="site-footer__heading">Contacto</h4>
            <div className="site-footer__links">
              <Link href="mailto:contacto@365diasdeajedrez.com" className="site-footer__link">
                contacto@365diasdeajedrez.com
              </Link>
              <Link href={whatsappUrl} className="site-footer__link" target="_blank">
                WhatsApp: +{whatsappNumber}
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
