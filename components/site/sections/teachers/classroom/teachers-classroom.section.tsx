import { BellIcon } from "@/components/icons/bell-icon.comp";
import { BookOpenIcon } from "@/components/icons/book-open-icon.comp";
import { ChessBoardIcon } from "@/components/icons/chess-board-icon.comp";
import { CircleDotIcon } from "@/components/icons/circle-dot-icon.comp";
import { ClockIcon } from "@/components/icons/clock-icon.comp";
import { ClosedCaptioningIcon } from "@/components/icons/closed-captioning-icon.comp";
import { EllipsisVerticalIcon } from "@/components/icons/ellipsis-vertical-icon.comp";
import { MicrophoneIcon } from "@/components/icons/microphone-icon.comp";
import { MicrophoneSlashIcon } from "@/components/icons/microphone-slash-icon.comp";
import { PhoneSlashIcon } from "@/components/icons/phone-slash-icon.comp";
import { ScreencastIcon } from "@/components/icons/screencast-icon.comp";
import { UsersIcon } from "@/components/icons/users-icon.comp";
import { VideoIcon } from "@/components/icons/video-icon.comp";
import { SiteBoard } from "@/components/site/shared/site-board/site-board.comp";
import { SiteHeading } from "@/components/site/shared/site-heading/site-heading.comp";
import { SiteLead } from "@/components/site/shared/site-lead/site-lead.comp";
import { SiteSection } from "@/components/site/shared/site-section/site-section.comp";
import { mdButton } from "@/lib/material/material-classes";
import { MATE_IN_ONE } from "../hero/mate-in-one.const";
import "./teachers-classroom.section.css";

const FEATURES = [
  {
    icon: ChessBoardIcon,
    title: "Un tablero para todos",
    text: "Mueves tú o le pasas el tablero a un alumno; todos lo ven en vivo.",
  },
  { icon: BookOpenIcon, title: "El cuaderno a un lado", text: "Lo que preparaste, a un clic de llevarlo al tablero." },
  { icon: ClosedCaptioningIcon, title: "Subtítulos en vivo", text: "Para seguir la clase aunque falle el audio." },
  {
    icon: CircleDotIcon,
    title: "La grabación se queda en la clase",
    text: "Sin subir enlaces: tus alumnos la encuentran ahí.",
  },
  { icon: UsersIcon, title: "Quién está y quién falta", text: "Silenciar a todos, llamar a quien no ha entrado." },
] as const;

const PEOPLE = [
  { initials: "LM", name: "Laura · profesora", muted: false, talking: true, tone: "teacher" },
  { initials: "VC", name: "Valentina", muted: false, talking: false, tone: "one" },
  { initials: "LU", name: "Luis", muted: true, talking: false, tone: "two" },
  { initials: "SR", name: "Sofía", muted: true, talking: false, tone: "three" },
] as const;

const NOTEBOOK = [
  {
    group: "Para preparar",
    blocks: [
      { kind: "Ejercicio", text: "El pasillo abierto", note: "En el tablero ahora" },
      { kind: "Partida", text: "Tu partida del sábado" },
    ],
  },
  {
    group: "Guion del profesor",
    blocks: [{ kind: "Texto", text: "Que lo encuentre sola antes de dar pistas.", script: true }],
  },
  { group: "Después de la clase", blocks: [{ kind: "Ejercicio", text: "Serie: mates en la última fila" }] },
] as const;

const CONTROLS = [
  { icon: MicrophoneIcon, label: "Micrófono" },
  { icon: VideoIcon, label: "Cámara" },
  { icon: ClosedCaptioningIcon, label: "Subtítulos, activados", on: true },
  { icon: ScreencastIcon, label: "Compartir pantalla" },
  { icon: EllipsisVerticalIcon, label: "Más opciones" },
  { icon: PhoneSlashIcon, label: "Salir de la clase", end: true },
] as const;

/**
 * «Profesores · Aula B»: the classroom inside the platform, which does not
 * exist yet (the owner's decision of 2026-10-26: «Próximamente» wherever it
 * is claimed). A concept drawing, so its controls are pictures, not buttons.
 */
export function TeachersClassroomSection() {
  return (
    <SiteSection id="aula" labelledBy="teachers-classroom-title">
      <div className="teachers-classroom">
        <div className="teachers-classroom__copy">
          <span className="teachers-classroom__soon">
            <ClockIcon className="teachers-classroom__soon-icon" variant="classic-solid" />
            Próximamente
          </span>
          <SiteHeading id="teachers-classroom-title" text="La clase se da aquí, no en otra app" />
          <SiteLead text="Estamos construyendo el aula de Plataforma Ajedrez 365: la videollamada junto al tablero y al cuaderno de la clase. Hoy, cada clase lleva el enlace de tu videollamada y tus alumnos entran desde su inicio." />
          <ul className="teachers-classroom__features">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="teachers-classroom__feature">
                <span className="teachers-classroom__feature-icon-wrap">
                  <Icon className="teachers-classroom__feature-icon" variant="classic-solid" />
                </span>
                <span>
                  <strong className="teachers-classroom__feature-title">{title}</strong>
                  <span className="teachers-classroom__feature-text">{text}</span>
                </span>
              </li>
            ))}
          </ul>
          <a className={`${mdButton("outlined", "sm")} teachers-classroom__notify`} href="#lista">
            <BellIcon className="site-md-icon" />
            Avísame cuando esté
          </a>
        </div>

        <figure className="teachers-classroom__mock" aria-labelledby="teachers-classroom-mock-caption">
          <figcaption className="teachers-classroom__mock-caption" id="teachers-classroom-mock-caption">
            Concepto del aula: las cámaras arriba, el tablero y el cuaderno abajo
          </figcaption>
          <div className="teachers-classroom__strip">
            <ul className="teachers-classroom__people" aria-label="Quién está en la clase">
              {PEOPLE.map((person) => (
                <li
                  key={person.initials}
                  className={`teachers-classroom__tile${person.talking ? " teachers-classroom__tile_talking" : ""}`}
                >
                  <span
                    className={`teachers-classroom__face teachers-classroom__face_tone_${person.tone}`}
                    aria-hidden="true"
                  >
                    {person.initials}
                  </span>
                  <span className="teachers-classroom__name">
                    {person.muted ? (
                      <MicrophoneSlashIcon className="teachers-classroom__name-icon" variant="classic-solid" />
                    ) : (
                      <MicrophoneIcon className="teachers-classroom__name-icon" variant="classic-solid" />
                    )}
                    {person.name}
                    {person.muted && <span className="teachers-classroom__hidden"> (micrófono apagado)</span>}
                  </span>
                </li>
              ))}
            </ul>
            <div className="teachers-classroom__status">
              <span className="teachers-classroom__recording">
                <CircleDotIcon className="teachers-classroom__recording-icon" variant="classic-solid" />
                Grabando
              </span>
              <span className="teachers-classroom__concept">Concepto</span>
            </div>
          </div>
          <div className="teachers-classroom__split">
            <div className="teachers-classroom__board">
              <SiteBoard
                fen={MATE_IN_ONE.fen}
                lastMove={{ from: "d1", to: "d8" }}
                label="El tablero compartido: el pasillo abierto, la profesora marca d1 y d8"
              />
              <p className="teachers-classroom__subtitle">
                <ClosedCaptioningIcon className="teachers-classroom__subtitle-icon" variant="classic-solid" />
                <span>
                  <strong>Laura:</strong> el rey no tiene casillas; ¿quién lo ve?
                </span>
              </p>
            </div>
            <div className="teachers-classroom__notebook">
              <p className="teachers-classroom__notebook-head">
                <strong className="teachers-classroom__notebook-title">El cuaderno</strong>
                <span className="teachers-classroom__notebook-kind">Táctica · Individual</span>
              </p>
              {NOTEBOOK.map((group) => (
                <div key={group.group} className="teachers-classroom__notebook-group">
                  <p className="teachers-classroom__notebook-label">{group.group}</p>
                  {group.blocks.map((block) => (
                    <p
                      key={block.text}
                      className={`teachers-classroom__block${"script" in block ? " teachers-classroom__block_kind_script" : ""}`}
                    >
                      <span className="teachers-classroom__block-kind">{block.kind}</span>
                      <span className="teachers-classroom__block-text">{block.text}</span>
                      {"note" in block && <span className="teachers-classroom__block-note">{block.note}</span>}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <ul className="teachers-classroom__controls" aria-label="Controles de la llamada (concepto)">
            {CONTROLS.map(({ icon: Icon, label, ...rest }) => (
              <li
                key={label}
                className={`teachers-classroom__control${"on" in rest ? " teachers-classroom__control_on" : ""}${"end" in rest ? " teachers-classroom__control_end" : ""}`}
              >
                <Icon className="teachers-classroom__control-icon" variant="classic-solid" />
                <span className="teachers-classroom__hidden">{label}</span>
              </li>
            ))}
          </ul>
        </figure>
      </div>
    </SiteSection>
  );
}
