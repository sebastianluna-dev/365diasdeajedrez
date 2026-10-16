import Link from "next/link";
import { CircleCheckIcon } from "@/components/icons/circle-check-icon.comp";
import { CircleXmarkIcon } from "@/components/icons/circle-xmark-icon.comp";
import { EmptyState } from "@/components/platform/shared/empty-state/empty-state.comp";
import {
  PlatformTable,
  PlatformTableCell,
  PlatformTableRow,
} from "@/components/platform/shared/platform-table/platform-table.comp";
import type { SeriesProgressCell, SeriesProgressData } from "./series-progress-table.types";
import "./series-progress-table.comp.css";

interface SeriesProgressTableProps {
  progress: SeriesProgressData;
}

/** «Fallado, 2 intentos». */
function failedLabel(attempts: number): string {
  return `Fallado, ${attempts} ${attempts === 1 ? "intento" : "intentos"}`;
}

/** A cell: an icon with its words for the reader, never a bare glyph; nothing drawn for «Sin intentar». */
function Cell({ cell }: { cell: SeriesProgressCell }) {
  if (cell.state === "solved") {
    return (
      <span className="series-progress-table__mark series-progress-table__mark_state_solved">
        <CircleCheckIcon variant="classic-solid" className="series-progress-table__icon" />
        <span className="series-progress-table__reader">Resuelto</span>
      </span>
    );
  }
  if (cell.state === "failed") {
    return (
      <span className="series-progress-table__mark series-progress-table__mark_state_failed">
        <CircleXmarkIcon variant="classic-solid" className="series-progress-table__icon" />
        <span className="series-progress-table__count" aria-hidden="true">
          {cell.attempts}
        </span>
        <span className="series-progress-table__reader">{failedLabel(cell.attempts)}</span>
      </span>
    );
  }
  return <span className="series-progress-table__reader">Sin intentar</span>;
}

/**
 * Who solved what in a series (D24): a matrix of the students the series
 * reaches now by its exercises in order — the check for a solve, the cross
 * with the attempt count for a failure, nothing for one not tried, each with
 * its words for a screen reader —, «N de M» per student, and above it
 * «Resolvieron N de M», the students who solved every exercise. Counted on
 * reading, never stored.
 */
export function SeriesProgressTable({ progress }: SeriesProgressTableProps) {
  const { items, students, completed } = progress;
  if (students.length === 0) {
    return (
      <EmptyState
        title="Ningún alumno tiene esta serie todavía."
        description="Dásela a tus alumnos y aquí verás qué resolvió cada uno."
      />
    );
  }
  return (
    <div className="series-progress-table">
      <p className="series-progress-table__summary">
        <strong className="series-progress-table__figure">
          Resolvieron {completed} de {students.length}
        </strong>
        <span className="series-progress-table__summary-note">
          {students.length === 1 ? "alumno con" : "alumnos con"} todos los ejercicios de la serie resueltos
        </span>
      </p>
      <PlatformTable
        label="Progreso de la serie"
        columns={["Alumno", ...items.map((item) => String(item.n)), { label: "Resueltos", align: "right" }]}
        minWidth={320 + items.length * 56}
      >
        {students.map((student) => (
          <PlatformTableRow key={student.userId}>
            <PlatformTableCell strong>
              <Link href={student.href}>{student.displayName}</Link>
            </PlatformTableCell>
            {student.cells.map((cell, index) => (
              <PlatformTableCell key={items[index]?.exerciseId ?? index}>
                <Cell cell={cell} />
              </PlatformTableCell>
            ))}
            <PlatformTableCell align="right">
              {student.solved} de {items.length}
            </PlatformTableCell>
          </PlatformTableRow>
        ))}
      </PlatformTable>
      <ol className="series-progress-table__legend" aria-label="Ejercicios de la serie, por número">
        {items.map((item) => (
          <li key={item.exerciseId} className="series-progress-table__legend-item">
            <span className="series-progress-table__legend-n">{item.n}</span>
            {item.title}
          </li>
        ))}
      </ol>
    </div>
  );
}
