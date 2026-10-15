import Link from "next/link";
import { ClassRow } from "@/components/platform/shared/class-row/class-row.comp";
import type { ClassRowData } from "@/components/platform/shared/class-row/class-row.types";
import "./class-agenda.comp.css";

export interface ClassAgendaDay {
  /** The day's `yyyy-mm-dd` key in the reader's zone. */
  key: string;
  /** Its heading: «Hoy · miércoles 14 de octubre» (`formatAgendaDay`). */
  label: string;
  isToday: boolean;
  rows: ClassRowData[];
}

interface ClassAgendaProps {
  /** Only the days with classes; an empty list draws `emptyLine`. */
  days: ClassAgendaDay[];
  audience: "staff" | "teacher";
  /** What to say when there are no days: «No hay clases esta semana.» */
  emptyLine: string;
  /** A link at the foot: «Ver la semana siguiente». */
  foot?: { label: string; href: string };
}

/**
 * Classes by day: a heading per day and its rows, only the days that have
 * any, with a line when none does and a link at the foot to the next
 * stretch of days.
 */
export function ClassAgenda({ days, audience, emptyLine, foot }: ClassAgendaProps) {
  return (
    <div className="class-agenda">
      {days.length === 0 ? (
        <p className="class-agenda__empty">{emptyLine}</p>
      ) : (
        days.map((day) => (
          <section key={day.key} className="class-agenda__day" aria-labelledby={`agenda-${day.key}`}>
            <h2
              id={`agenda-${day.key}`}
              className={`class-agenda__heading${day.isToday ? " class-agenda__heading_state_today" : ""}`}
            >
              {day.label}
            </h2>
            <ul className="class-agenda__rows">
              {day.rows.map((row) => (
                <li key={row.id} className="class-agenda__row">
                  <ClassRow row={row} audience={audience} />
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
      {foot && (
        <p className="class-agenda__foot">
          <Link href={foot.href} className="class-agenda__foot-link">
            {foot.label}
          </Link>
        </p>
      )}
    </div>
  );
}
