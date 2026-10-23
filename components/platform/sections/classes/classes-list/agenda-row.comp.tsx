import Link from "next/link";
import { joinSpanish } from "@/services/shared/class-rules";
import type { ClassCardData } from "@/services/classes/classes.types";
import { agendaClass } from "./agenda-class";
import { ClassPhaseChip } from "./class-phase-chip.comp";
import "./agenda-row.comp.css";

/**
 * A class of a later day in «Mis clases» (2026-10-23, «M4» of the owner's
 * canvas): one outlined row that is the link to the class and lifts under
 * the pointer — the hours at its left, the topic with who gives it, the kind
 * and where, the make-up's note, its phase, and at the right when the link
 * opens (or that the staff will add it) and how many things there are to
 * prepare. Never the class's content, nor which payment it belongs to.
 */
export function AgendaRow({ card }: { card: ClassCardData }) {
  const agenda = agendaClass(card);
  const crew = card.isGroup
    ? `Grupal${card.classmates.length > 0 ? `, con ${joinSpanish(card.classmates)}` : ""}`
    : "Individual";
  const lead = card.cancelled
    ? null
    : agenda.state === "none"
      ? "Administración agregará el enlace"
      : agenda.state === "waiting"
        ? `El enlace se abre a las ${agenda.opensAt}`
        : null;

  return (
    <Link href={card.href} className={`agenda-row${card.cancelled ? " agenda-row_state_cancelled" : ""}`}>
      <span className="agenda-row__time">
        <time dateTime={card.startIso} className="agenda-row__start">
          {agenda.startHour}
        </time>
        <span className="agenda-row__span">
          <span aria-hidden="true">→ </span>
          <span className="agenda-row__sr">a las </span>
          {agenda.endHour} · {agenda.length}
        </span>
      </span>
      <span className="agenda-row__main">
        <span className="agenda-row__title">{card.title}</span>
        <span className="agenda-row__meta">
          {card.teacherName} · {crew} · {agenda.room}
        </span>
        {card.makeUpLabel && <span className="agenda-row__note">{card.makeUpLabel}</span>}
      </span>
      <ClassPhaseChip phase={card.phase} />
      <span className="agenda-row__lead">
        {lead && <span>{lead}</span>}
        {!card.cancelled && card.visibleBlocks > 0 && (
          <span className="agenda-row__prepare">{card.visibleBlocks} para preparar</span>
        )}
      </span>
    </Link>
  );
}
