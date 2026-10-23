import Link from "next/link";
import { useId } from "react";
import { CirclePlayIcon } from "@/components/icons/circle-play-icon.comp";
import { CopyLinkButton } from "@/components/platform/shared/copy-link-button/copy-link-button.comp";
import { MeetingCountdown } from "@/components/platform/shared/meeting-countdown/meeting-countdown.comp";
import { initialsOf } from "@/lib/avatar-tone";
import { mdButton } from "@/lib/material/material-classes";
import { joinSpanish } from "@/services/shared/class-rules";
import type { ClassCardData } from "@/services/classes/classes.types";
import { agendaClass } from "./agenda-class";
import { ClassPhaseChip } from "./class-phase-chip.comp";
import "./today-class.comp.css";

interface TodayClassProps {
  card: ClassCardData;
  /**
   * The page also draws the fixed bar to join under 1024px (`ClassJoinBar`):
   * there the card leaves «Entrar a la clase» to the bar and offers «Ver la
   * clase» instead, so the screen has one way in.
   */
  withJoinBar?: boolean;
}

/**
 * Today's class in «Mis clases» (2026-10-23, «M4» of the owner's canvas):
 * a large band of the primary's wash with the stub of the day — the day,
 * the hour it starts in large figures, when it ends and how long — and
 * beside it the phase and the countdown, the topic, who gives it, where,
 * the kind and the classmates' faces; and the way in: «Entrar a la clase»
 * and «Copiar el enlace» while the link is open, «Ver la clase» before,
 * and how many things there are to prepare. Never the class's content, nor
 * which payment it belongs to. A class whose link is open on another day
 * is drawn this way too.
 */
export function TodayClass({ card, withJoinBar = false }: TodayClassProps) {
  const titleId = useId();
  const agenda = agendaClass(card);
  const { join, state } = agenda;

  return (
    <article
      className={`today-class${withJoinBar && agenda.entering ? " today-class_join_bar" : ""}`}
      aria-labelledby={titleId}
    >
      <div className="today-class__stub">
        <p className="today-class__day">{agenda.stubDay}</p>
        <p className="today-class__start">
          <time dateTime={card.startIso}>{agenda.startHour}</time>
        </p>
        <p className="today-class__span">
          <span aria-hidden="true">→ </span>
          <span className="today-class__sr">a las </span>
          {agenda.endHour} · <span className="today-class__sr">dura </span>
          {agenda.length}
        </p>
      </div>

      <div className="today-class__main">
        <div className="today-class__meta">
          <ClassPhaseChip phase={card.phase} />
          {join && state === "none" && <span className="today-class__lead">Administración agregará el enlace</span>}
          {join && (state === "waiting" || agenda.entering) && (
            <span className="today-class__lead">
              <MeetingCountdown
                startIso={join.startIso}
                endIso={join.endIso}
                visibleFromIso={join.visibleFromIso}
                untilIso={join.untilIso}
                hasLink={join.meetingUrl !== null}
                nowIso={join.nowIso}
                timeZone={join.timeZone}
              />
            </span>
          )}
        </div>

        <h3 id={titleId} className="today-class__title">
          <Link href={card.href} className="today-class__link">
            {card.title}
          </Link>
        </h3>
        {card.makeUpLabel && <p className="today-class__note">{card.makeUpLabel}</p>}

        <dl className="today-class__fields">
          <div className="today-class__field">
            <dt>Profesor</dt>
            <dd>{card.teacherName}</dd>
          </div>
          <div className="today-class__field">
            <dt>Sala</dt>
            <dd>{agenda.room}</dd>
          </div>
          <div className="today-class__field">
            <dt>Tipo</dt>
            <dd>{card.isGroup ? "Grupal" : "Individual"}</dd>
          </div>
          {card.isGroup && card.classmates.length > 0 && (
            <div className="today-class__field">
              <dt>Compañeros</dt>
              <dd className="today-class__crew">
                <span className="today-class__faces" role="img" aria-label={joinSpanish(card.classmates)}>
                  {card.classmates.slice(0, 4).map((name) => (
                    <span key={name} className="today-class__face" aria-hidden="true">
                      {initialsOf(name)}
                    </span>
                  ))}
                </span>
                {card.classmates.length > 4 && (
                  <span className="today-class__more-faces">+{card.classmates.length - 4}</span>
                )}
              </dd>
            </div>
          )}
        </dl>

        <div className="today-class__actions">
          {agenda.entering && join?.meetingUrl ? (
            <>
              <a
                href={join.meetingUrl}
                target="_blank"
                rel="noreferrer"
                className={`${mdButton("filled", "sm")} today-class__enter`}
              >
                <CirclePlayIcon variant="classic-solid" className="platform-md-icon" />
                {state === "tail" ? "Volver a entrar" : "Entrar a la clase"}
                <span className="today-class__sr">(se abre en una pestaña nueva)</span>
              </a>
              <span className="today-class__copy">
                <CopyLinkButton url={join.meetingUrl} label="Copiar el enlace" material="tonal" />
              </span>
              <Link href={card.href} className={`${mdButton("tonal", "sm")} today-class__view`}>
                Ver la clase
              </Link>
            </>
          ) : (
            <Link href={card.href} className={mdButton("tonal", "sm")}>
              Ver la clase
            </Link>
          )}
          {card.visibleBlocks > 0 && (
            <Link href={`${card.href}#para-preparar`} className={mdButton("text", "sm")}>
              {card.visibleBlocks} para preparar
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
