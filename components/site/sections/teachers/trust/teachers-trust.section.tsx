import { BookOpenIcon } from "@/components/icons/book-open-icon.comp";
import { EyeIcon } from "@/components/icons/eye-icon.comp";
import { LockIcon } from "@/components/icons/lock-icon.comp";
import { MessageSlashIcon } from "@/components/icons/message-slash-icon.comp";
import { TagIcon } from "@/components/icons/tag-icon.comp";
import { UserIcon } from "@/components/icons/user-icon.comp";
import { UsersIcon } from "@/components/icons/users-icon.comp";
import { XmarkIcon } from "@/components/icons/xmark-icon.comp";
import { SiteEyebrow } from "@/components/site/shared/site-eyebrow/site-eyebrow.comp";
import { SiteHeading } from "@/components/site/shared/site-heading/site-heading.comp";
import { SiteLead } from "@/components/site/shared/site-lead/site-lead.comp";
import { SiteSection } from "@/components/site/shared/site-section/site-section.comp";
import "./teachers-trust.section.css";

const CARDS = [
  {
    icon: MessageSlashIcon,
    title: "Sin chat entre usuarios",
    text: "Dentro de la plataforma nadie puede escribirle a tu alumno: ni un desconocido ni otro alumno.",
  },
  {
    icon: TagIcon,
    title: "El alumno nunca ve importes",
    text: "Ve cuántas clases le quedan, nunca cuánto costaron.",
    sample: "Te quedan 2 clases de tu pago del 2 de octubre.",
  },
  {
    icon: EyeIcon,
    title: "Cada profesor, sólo sus alumnos",
    text: "Un profesor ve a los alumnos que tiene asignados. Los de otro profesor no aparecen en su cuenta.",
  },
  {
    icon: BookOpenIcon,
    title: "Sus estudios son suyos",
    text: "La administración no abre los estudios privados del alumno. Su profesor puede leerlos, sin cambiarlos.",
  },
  {
    icon: UsersIcon,
    title: "En grupales, sólo el nombre",
    text: "En una clase grupal, los compañeros se ven por su nombre y nada más.",
  },
] as const;

/** «Profesores · Confianza A»: a closed platform, for students of every age. */
export function TeachersTrustSection() {
  return (
    <SiteSection id="confianza" labelledBy="teachers-trust-title">
      <div className="teachers-trust">
        <div className="teachers-trust__head">
          <div className="teachers-trust__copy">
            <SiteEyebrow>
              <LockIcon variant="classic-solid" />
              Confianza y privacidad
            </SiteEyebrow>
            <SiteHeading
              id="teachers-trust-title"
              text="Una plataforma cerrada, pensada para alumnos de todas las edades"
            />
          </div>
          <SiteLead text="Muchos de tus alumnos son niños. Por eso aquí nadie entra solo, nadie le escribe a nadie y cada quien ve sólo lo que le toca." />
        </div>

        <ul className="teachers-trust__grid">
          <li className="teachers-trust__card teachers-trust__card_wide teachers-trust__card_tone_accent">
            <div className="teachers-trust__feature">
              <span className="teachers-trust__icon-wrap">
                <UserIcon className="teachers-trust__icon" />
              </span>
              <h3 className="teachers-trust__card-title teachers-trust__card-title_size_large">Sin registro público</h3>
              <p className="teachers-trust__card-text">
                Nadie se da de alta solo. Cada alumno existe porque alguien lo inscribe: la academia o, próximamente, su
                profesor. Un desconocido no tiene por dónde entrar.
              </p>
            </div>
            <div
              className="teachers-trust__login"
              role="img"
              aria-label="La pantalla para entrar: correo, contraseña y Entrar; no hay botón para crear una cuenta"
            >
              <strong className="teachers-trust__login-title">Iniciar sesión</strong>
              <span className="teachers-trust__login-field">Correo</span>
              <span className="teachers-trust__login-field">Contraseña</span>
              <span className="teachers-trust__login-enter">Entrar</span>
              <span className="teachers-trust__login-none">
                <XmarkIcon className="teachers-trust__login-none-icon" variant="classic-solid" />
                <s>Crear una cuenta</s>: no existe
              </span>
            </div>
          </li>
          {CARDS.map(({ icon: Icon, title, text, ...rest }) => (
            <li key={title} className="teachers-trust__card">
              <span className="teachers-trust__icon-wrap">
                <Icon className="teachers-trust__icon" />
              </span>
              <h3 className="teachers-trust__card-title">{title}</h3>
              <p className="teachers-trust__card-text">{text}</p>
              {"sample" in rest && <p className="teachers-trust__sample">{rest.sample}</p>}
            </li>
          ))}
          <li className="teachers-trust__card teachers-trust__card_wide">
            <div className="teachers-trust__feature">
              <span className="teachers-trust__icon-wrap">
                <LockIcon className="teachers-trust__icon" />
              </span>
              <h3 className="teachers-trust__card-title">Contraseñas cifradas</h3>
              <p className="teachers-trust__card-text">
                La contraseña se guarda cifrada. Nadie la puede leer, ni la academia; si se olvida, se crea una nueva.
              </p>
            </div>
            <div
              className="teachers-trust__sample teachers-trust__sample_kind_hash"
              role="img"
              aria-label="Lo que se guarda de una contraseña: una cadena cifrada que no se puede leer"
            >
              <span className="teachers-trust__hash-label">Lo que se guarda de «ajedrez2026»</span>
              <code className="teachers-trust__hash">scrypt$32768$8$1$9f2c4a7e1b…d03e8a51c6f7b2</code>
            </div>
          </li>
        </ul>
      </div>
    </SiteSection>
  );
}
