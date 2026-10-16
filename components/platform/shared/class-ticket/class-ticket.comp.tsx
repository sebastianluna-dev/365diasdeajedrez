import Link from "next/link";
import { useId } from "react";
import { ArrowRightIcon } from "@/components/icons/arrow-right-icon.comp";
import { ChevronRightIcon } from "@/components/icons/chevron-right-icon.comp";
import { ClockIcon } from "@/components/icons/clock-icon.comp";
import { LayerGroupIcon } from "@/components/icons/layer-group-icon.comp";
import { VideoIcon } from "@/components/icons/video-icon.comp";
import { ClassStatusTag } from "@/components/platform/shared/class-status-tag/class-status-tag.comp";
import { CopyLinkButton } from "@/components/platform/shared/copy-link-button/copy-link-button.comp";
import { MeetingCountdown } from "@/components/platform/shared/meeting-countdown/meeting-countdown.comp";
import { meetingJoinState } from "@/components/platform/shared/meeting-join-card/meeting-join-card.comp";
import { initialsOf } from "@/lib/avatar-tone";
import { formatClassDay, formatClassHours, formatClassLength } from "@/lib/format-class-when";
import { dayKeyIn } from "@/lib/timezone";
import { joinSpanish } from "@/services/shared/class-rules";
import type { ClassCardData } from "@/services/classes/classes.types";
import "./class-ticket.comp.css";

interface ClassTicketProps {
  card: ClassCardData;
  /**
   * The page also draws the fixed bar to join under 1024px (`ClassJoinBar`):
   * there the ticket leaves «Entrar a la clase» to the bar and offers «Ver
   * la clase» instead, so the screen has one way in.
   */
  withJoinBar?: boolean;
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** «Hoy · jue 15 oct», «Mañana · vie 16 oct», «Dom 18 oct». */
function stubDay(card: ClassCardData): { label: string; isToday: boolean } {
  const start = new Date(card.startIso);
  const now = new Date(card.nowIso);
  const day = formatClassDay(start, card.timeZone, now);
  const key = dayKeyIn(start, card.timeZone);
  if (key === dayKeyIn(now, card.timeZone)) return { label: `Hoy · ${day}`, isToday: true };
  if (key === dayKeyIn(new Date(now.getTime() + 24 * 60 * 60 * 1000), card.timeZone)) {
    return { label: `Mañana · ${day}`, isToday: false };
  }
  return { label: capitalize(day), isToday: false };
}

/**
 * An upcoming class as a boarding pass: the stub keeps the day, the hours
 * and how long it lasts, the perforation separates it from the class —
 * its phase and how long until it starts, the topic, who gives it, where
 * and with whom —, and the foot is how to get in: «Entrar a la clase» and
 * the link to copy while the link is open, «Ver la clase» before, and how
 * many things there are to prepare. Never the class's content, nor which
 * payment it belongs to: that waits for the past card (`PastClassCard`).
 * Today's stub is the only tinted one. A Server Component; the ticking is
 * `MeetingCountdown`'s, which asks for the page again when the link opens.
 */
export function ClassTicket({ card, withJoinBar = false }: ClassTicketProps) {
  const titleId = useId();
  const start = new Date(card.startIso);
  const [startHour = "", endHour = ""] = formatClassHours(start, card.durationMin, card.timeZone).split("–");
  const day = stubDay(card);
  const join = card.cancelled ? null : card.join;
  const state = join ? meetingJoinState(join) : "closed";
  const entering =
    join !== null && join.meetingUrl !== null && (state === "open" || state === "live" || state === "tail");
  const opensAt =
    join?.visibleFromIso !== null && join?.visibleFromIso !== undefined
      ? (formatClassHours(new Date(join.visibleFromIso), 0, card.timeZone).split("–")[0] ?? "")
      : "";
  const room = join?.providerLabel ?? (join?.hasLink ? "En línea" : "Por confirmar");
  const classes = [
    "class-ticket",
    day.isToday && !card.cancelled ? "class-ticket_day_today" : "",
    card.cancelled ? "class-ticket_state_cancelled" : "",
    withJoinBar && entering ? "class-ticket_join_bar" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={classes} aria-labelledby={titleId}>
      <div className="class-ticket__stub">
        <p className="class-ticket__day">{day.label}</p>
        <p className="class-ticket__hours">
          <time dateTime={card.startIso} className="class-ticket__start">
            {startHour}
          </time>
          <span className="class-ticket__end">
            <ArrowRightIcon variant="classic-solid" className="class-ticket__end-icon" />
            <span className="class-ticket__sr">a </span>
            {endHour}
          </span>
        </p>
        <p className="class-ticket__length">
          <ClockIcon variant="classic-solid" className="class-ticket__length-icon" />
          <span className="class-ticket__sr">Dura </span>
          {formatClassLength(card.durationMin)}
        </p>
      </div>
      <span className="class-ticket__perforation" aria-hidden="true" />
      <span className="class-ticket__notch class-ticket__notch_side_start" aria-hidden="true" />
      <span className="class-ticket__notch class-ticket__notch_side_end" aria-hidden="true" />

      <div className="class-ticket__main">
        <div className="class-ticket__meta">
          <ClassStatusTag phase={card.phase} audience="student" />
          {join && state === "none" && (
            <span className="class-ticket__lead class-ticket__lead_tone_calm">
              <ClockIcon variant="classic-solid" className="class-ticket__lead-icon" />
              Administración agregará el enlace
            </span>
          )}
          {join && state === "waiting" && !day.isToday && (
            <span className="class-ticket__lead class-ticket__lead_tone_calm">
              <ClockIcon variant="classic-solid" className="class-ticket__lead-icon" />
              El enlace se abre a las {opensAt}
            </span>
          )}
          {join && ((state === "waiting" && day.isToday) || entering) && (
            <span className="class-ticket__lead">
              <ClockIcon variant="classic-solid" className="class-ticket__lead-icon" />
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

        <h3 id={titleId} className="class-ticket__title">
          <Link href={card.href} className="class-ticket__link">
            {card.title}
          </Link>
        </h3>
        {card.makeUpLabel && <p className="class-ticket__note">{card.makeUpLabel}</p>}

        <dl className="class-ticket__fields">
          <div className="class-ticket__field">
            <dt className="class-ticket__label">Profesor</dt>
            <dd className="class-ticket__value">{card.teacherName}</dd>
          </div>
          <div className="class-ticket__field">
            <dt className="class-ticket__label">Sala</dt>
            <dd className="class-ticket__value">{room}</dd>
          </div>
          <div className="class-ticket__field">
            <dt className="class-ticket__label">Tipo</dt>
            <dd className="class-ticket__value">{card.isGroup ? "Grupal" : "Individual"}</dd>
          </div>
          {card.isGroup && card.classmates.length > 0 && (
            <div className="class-ticket__field">
              <dt className="class-ticket__label">Compañeros</dt>
              <dd className="class-ticket__value class-ticket__value_kind_crew">
                <span className="class-ticket__faces" role="img" aria-label={joinSpanish(card.classmates)}>
                  {card.classmates.slice(0, 4).map((name) => (
                    <span key={name} className="class-ticket__face" aria-hidden="true">
                      {initialsOf(name)}
                    </span>
                  ))}
                </span>
                {card.classmates.length > 4 && (
                  <span className="class-ticket__more-faces">+{card.classmates.length - 4}</span>
                )}
              </dd>
            </div>
          )}
        </dl>

        {!card.cancelled && (
          <div className="class-ticket__actions">
            {entering && join.meetingUrl ? (
              <>
                <a
                  href={join.meetingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="platform-button platform-button_variant_accent platform-button_size_lg class-ticket__enter"
                >
                  <VideoIcon variant="classic-solid" className="platform-button__icon" />
                  {state === "tail" ? "Volver a entrar" : "Entrar a la clase"}
                  <span className="class-ticket__sr">(se abre en una pestaña nueva)</span>
                </a>
                <CopyLinkButton url={join.meetingUrl} label="Copiar el enlace" size="lg" />
                {withJoinBar && (
                  <Link href={card.href} className="platform-button platform-button_size_lg class-ticket__view">
                    Ver la clase
                    <ChevronRightIcon variant="classic-solid" className="platform-button__icon" />
                  </Link>
                )}
              </>
            ) : (
              <Link href={card.href} className="platform-button platform-button_size_lg class-ticket__view">
                Ver la clase
                <ChevronRightIcon variant="classic-solid" className="platform-button__icon" />
              </Link>
            )}
            {card.visibleBlocks > 0 && (
              <Link href={`${card.href}#para-preparar`} className="class-ticket__prepare">
                <LayerGroupIcon variant="classic-solid" className="class-ticket__prepare-icon" />
                {card.visibleBlocks} para preparar
              </Link>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
