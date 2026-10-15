import Link from "next/link";
import { CalendarClockIcon } from "@/components/icons/calendar-clock-icon.comp";
import { ChevronRightIcon } from "@/components/icons/chevron-right-icon.comp";
import { CircleVideoIcon } from "@/components/icons/circle-video-icon.comp";
import { LayerGroupIcon } from "@/components/icons/layer-group-icon.comp";
import { UserCheckIcon } from "@/components/icons/user-check-icon.comp";
import { ClassDateTile } from "@/components/platform/shared/class-date-tile/class-date-tile.comp";
import { ClassStatusTag } from "@/components/platform/shared/class-status-tag/class-status-tag.comp";
import { ClassWhen } from "@/components/platform/shared/class-when/class-when.comp";
import { MeetingJoinCard } from "@/components/platform/shared/meeting-join-card/meeting-join-card.comp";
import { formatClassHours } from "@/lib/format-class-when";
import { dayKeyIn } from "@/lib/timezone";
import type { ClassCardData, UnscheduledClassData } from "@/services/classes/classes.types";
import "./class-card.comp.css";

interface ClassCardProps {
  card: ClassCardData;
  /** `featured`: today's or the next class, with how to join; `compact`: a row of a list. */
  variant: "featured" | "compact";
}

/** «2 para preparar» ahead of the class, «4 bloques» after it. */
function blocksLabel(card: ClassCardData): string | null {
  if (card.visibleBlocks === 0) return null;
  if (card.past) return `${card.visibleBlocks} ${card.visibleBlocks === 1 ? "bloque" : "bloques"}`;
  return `${card.visibleBlocks} para preparar`;
}

/**
 * A class as the student's lists draw it: the date as a tile, the phase, the
 * topic and who it is with, and what the student should know at a glance.
 * The title is the link, stretched over the whole card; the join card's
 * button and the link of a moved seat sit above it. Featured, it is today's
 * or the next class with how to join it; compact, a row of «Próximas» or
 * «Pasadas», where a past class says whether they came, whether there is a
 * recording and how many blocks there are. A moved seat says where it went;
 * a make-up says which class it replaces; a cancelled class steps back in
 * its greys.
 */
export function ClassCard({ card, variant }: ClassCardProps) {
  const start = new Date(card.startIso);
  const now = new Date(card.nowIso);
  const isToday = dayKeyIn(start, card.timeZone) === dayKeyIn(now, card.timeZone);
  const blocks = blocksLabel(card);
  const classes = ["class-card", `class-card_variant_${variant}`, card.cancelled ? "class-card_state_cancelled" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={classes}>
      <div className="class-card__when">
        <ClassDateTile
          startIso={card.startIso}
          timeZone={card.timeZone}
          isToday={isToday && !card.cancelled}
          size={variant === "featured" ? "md" : "sm"}
        />
        {variant === "compact" && (
          <time dateTime={card.startIso} className="class-card__hours">
            {formatClassHours(start, card.durationMin, card.timeZone)}
          </time>
        )}
      </div>

      <div className="class-card__what">
        {variant === "featured" && (
          <p className="class-card__tags">
            <ClassStatusTag phase={card.phase} audience="student" />
          </p>
        )}
        <h3 className="class-card__title">
          <Link href={card.href} className="class-card__link">
            {card.title}
          </Link>
        </h3>
        {variant === "featured" && (
          <p className="class-card__line">
            <ClassWhen
              startIso={card.startIso}
              durationMin={card.durationMin}
              timeZone={card.timeZone}
              nowIso={card.nowIso}
            />
          </p>
        )}
        <p className="class-card__people">{card.people}</p>
        {card.makeUpLabel && <p className="class-card__note">{card.makeUpLabel}</p>}
        {card.moved && (
          <p className="class-card__note">
            {card.moved.href ? (
              <Link href={card.moved.href} className="class-card__moved">
                {card.moved.label}
              </Link>
            ) : (
              card.moved.label
            )}
          </p>
        )}
        {variant === "featured" && card.join && !card.cancelled && (
          <div className="class-card__join">
            <MeetingJoinCard {...card.join} audience="student" density="compact" />
          </div>
        )}
      </div>

      <div className="class-card__facts">
        {variant === "compact" && !card.past && <ClassStatusTag phase={card.phase} audience="student" />}
        {card.past && !card.moved && card.past.attended !== null && (
          <span className={`class-card__fact${card.past.attended ? "" : " class-card__fact_tone_warning"}`}>
            <UserCheckIcon variant="classic-solid" className="class-card__fact-icon" />
            {card.past.attended ? "Asististe" : "No asististe"}
          </span>
        )}
        {card.past?.hasRecording && (
          <span className="class-card__fact">
            <CircleVideoIcon variant="classic-solid" className="class-card__fact-icon" />
            Grabación
          </span>
        )}
        {blocks && !card.cancelled && (
          <span className="class-card__fact">
            <LayerGroupIcon variant="classic-solid" className="class-card__fact-icon" />
            {blocks}
          </span>
        )}
      </div>

      <ChevronRightIcon variant="classic-solid" className="class-card__chevron" />
    </article>
  );
}

interface UnscheduledClassCardProps {
  item: UnscheduledClassData;
}

/** A class bought without a date yet: a row without a link, on the soft surface. */
export function UnscheduledClassCard({ item }: UnscheduledClassCardProps) {
  return (
    <div className="class-card class-card_variant_unscheduled">
      <div className="class-card__when">
        <span className="class-card__unscheduled-tile" aria-hidden="true">
          <CalendarClockIcon className="class-card__unscheduled-icon" />
        </span>
      </div>
      <div className="class-card__what">
        <p className="class-card__title">Clase por programar · {item.label}</p>
        <p className="class-card__people">Administración te escribirá para fijar la fecha.</p>
      </div>
    </div>
  );
}
