import Link from "next/link";
import { useId } from "react";
import { StaticDiagram } from "@/components/chess/static-diagram.comp";
import { ChevronRightIcon } from "@/components/icons/chevron-right-icon.comp";
import { CircleVideoIcon } from "@/components/icons/circle-video-icon.comp";
import { LayerGroupIcon } from "@/components/icons/layer-group-icon.comp";
import { UserCheckIcon } from "@/components/icons/user-check-icon.comp";
import { UserXmarkIcon } from "@/components/icons/user-xmark-icon.comp";
import { ClassStatusTag } from "@/components/platform/shared/class-status-tag/class-status-tag.comp";
import { formatClassHours, formatLongDay } from "@/lib/format-class-when";
import { dayKeyIn } from "@/lib/timezone";
import type { ClassCardData } from "@/services/classes/classes.types";
import "./past-class-card.comp.css";

interface PastClassCardProps {
  card: ClassCardData;
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/**
 * A class once it is over and counts as finished: whether the student came,
 * the hours, the topic, «Finalizada · con …», the summary the teacher left,
 * the recording and how many blocks there are, and «Ver la clase». The board
 * of the class's first position, game or lesson leads the card when the
 * class has one; a class without chess keeps the same card without it. A
 * free class says «Gratis»; which payment a paid one came from, never. A
 * moved seat says where the class went; a cancelled class steps back.
 */
export function PastClassCard({ card }: PastClassCardProps) {
  const titleId = useId();
  const start = new Date(card.startIso);
  const longDay = capitalize(
    formatLongDay(dayKeyIn(start, card.timeZone), dayKeyIn(new Date(card.nowIso), card.timeZone)),
  );
  const board = card.past?.board ?? null;
  const attended = card.past?.attended ?? null;
  const blocks = card.cancelled ? 0 : card.visibleBlocks;

  return (
    <article
      className={`past-class-card${board ? " past-class-card_board_on" : ""}${card.cancelled ? " past-class-card_state_cancelled" : ""}`}
      aria-labelledby={titleId}
    >
      {board && (
        <div className="past-class-card__board" role="img" aria-label={`Tablero de la clase: ${board.label}`}>
          <StaticDiagram fen={board.fen} orientation={board.orientation} />
        </div>
      )}
      <div className="past-class-card__body">
        <div className="past-class-card__top">
          <span className="past-class-card__tags">
            {card.cancelled ? (
              <ClassStatusTag phase={card.phase} audience="student" />
            ) : attended === true ? (
              <span className="platform-tag platform-tag_variant_success">
                <UserCheckIcon variant="classic-solid" className="platform-tag__icon" />
                Asististe
              </span>
            ) : attended === false ? (
              <span className="platform-tag platform-tag_variant_warning">
                <UserXmarkIcon variant="classic-solid" className="platform-tag__icon" />
                No asististe
              </span>
            ) : null}
            {card.isFree && <span className="platform-tag">Gratis</span>}
          </span>
          <time dateTime={card.startIso} className="past-class-card__hours">
            {formatClassHours(start, card.durationMin, card.timeZone)}
          </time>
        </div>

        <div className="past-class-card__head">
          <h3 id={titleId} className="past-class-card__title">
            <Link href={card.href} className="past-class-card__link">
              <span className="past-class-card__sr">{longDay}: </span>
              {card.title}
            </Link>
          </h3>
          <p className="past-class-card__meta">
            {card.cancelled ? "Cancelada" : "Finalizada"} · {card.people}
          </p>
        </div>

        {card.makeUpLabel && <p className="past-class-card__note">{card.makeUpLabel}</p>}
        {card.moved && (
          <p className="past-class-card__note">
            {card.moved.href ? (
              <Link href={card.moved.href} className="past-class-card__moved">
                {card.moved.label}
              </Link>
            ) : (
              card.moved.label
            )}
          </p>
        )}
        {card.past?.summary && <p className="past-class-card__summary">{card.past.summary}</p>}

        {(card.past?.hasRecording || blocks > 0) && (
          <div className="past-class-card__facts">
            {card.past?.hasRecording && (
              <span className="past-class-card__fact">
                <CircleVideoIcon variant="classic-solid" className="past-class-card__fact-icon" />
                Grabación
              </span>
            )}
            {blocks > 0 && (
              <span className="past-class-card__fact">
                <LayerGroupIcon variant="classic-solid" className="past-class-card__fact-icon" />
                {blocks} {blocks === 1 ? "bloque" : "bloques"}
              </span>
            )}
          </div>
        )}

        <Link href={card.href} className="past-class-card__more" aria-hidden="true" tabIndex={-1}>
          Ver la clase
          <ChevronRightIcon variant="classic-solid" className="past-class-card__more-icon" />
        </Link>
      </div>
    </article>
  );
}
