import Link from "next/link";
import { PlatformTable, PlatformTableCell, PlatformTableRow } from "@/components/common/platform-table.comp";
import { teacherRoutes } from "@/lib/platform-routes";
import type { StudyDetail } from "@/services/studies/studies.types";
import "./student-study-view.section.css";

interface StudentStudyViewSectionProps {
  studentId: string;
  studentName: string;
  study: StudyDetail;
}

/**
 * Estudio de un alumno visto por su profesor: la misma tabla de partidas que en
 * «Mis estudios», SIN un solo control de escritura. Las actions de estudios
 * (crear, importar) no se importan aquí a propósito — y aunque se invocaran por
 * POST directo, validan que la base sea del usuario que las llama.
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
