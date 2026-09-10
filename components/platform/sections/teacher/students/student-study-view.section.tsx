import Link from "next/link";
import { PlatformTable, PlatformTableCell, PlatformTableRow } from "@/components/platform/shared/platform-table.comp";
import { teacherRoutes } from "@/lib/platform-routes";
import type { StudyDetail } from "@/services/studies/studies.types";
import "./student-study-view.section.css";

interface StudentStudyViewSectionProps {
  studentId: string;
  studentName: string;
  study: StudyDetail;
}

/**
 * A student's study seen by their teacher: the same game table as in
 * "Mis estudios", WITHOUT a single write control. The studies actions
 * (create, import) are deliberately not imported here — and even if invoked
 * by direct POST, they validate that the database belongs to the caller.
 */
export function StudentStudyViewSection({ studentId, studentName, study }: StudentStudyViewSectionProps) {
  return (
    <div className="student-study">
      <p className="student-study__breadcrumb">
        <Link href={teacherRoutes.students}>Mis alumnos</Link>
        {" › "}
        <Link href={teacherRoutes.studentDetail(studentId)}>{studentName}</Link>
      </p>

      <div className="student-study__meta">
        <span className="platform-tag">{study.kindLabel}</span>
        <span className="platform-tag">Sólo lectura</span>
      </div>

      {study.description && <p className="student-study__description">{study.description}</p>}

      <PlatformTable
        columns={["Blancas", "Negras", "Resultado", "ECO", "Evento", "Fecha"]}
        emptyLabel="Este estudio todavía no tiene partidas."
      >
        {study.games.map((game) => (
          <PlatformTableRow key={game.id}>
            <PlatformTableCell strong>
              <Link href={game.href}>{game.white}</Link>
            </PlatformTableCell>
            <PlatformTableCell strong>{game.black}</PlatformTableCell>
            <PlatformTableCell>{game.resultLabel}</PlatformTableCell>
            <PlatformTableCell>{game.eco ?? "—"}</PlatformTableCell>
            <PlatformTableCell>{game.event ?? "—"}</PlatformTableCell>
            <PlatformTableCell>{game.playedAtLabel ?? "—"}</PlatformTableCell>
          </PlatformTableRow>
        ))}
      </PlatformTable>
    </div>
  );
}
