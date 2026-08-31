import { formatSpanishDate } from "@/lib/format-spanish-date";
import { teacherRoutes } from "@/lib/platform-routes";
import { mapGameView, mapStudyDetail, mapStudySummary, type GameViewRow, type StudyDetailRow, type StudySummaryRow } from "@/services/studies/studies.mapper";
import type { GameView, StudyDetail, StudySummary } from "@/services/studies/studies.types";

// Los view-models de «Mis estudios» sirven tal cual para la vista del profesor:
// lo único que cambia son los enlaces, que tienen que quedarse dentro de
// /profesor/alumnos/<id> (si apuntaran a /estudios el profesor recibiría un 404,
// porque esas rutas sólo muestran los estudios de quien las abre).

export function mapStudentStudySummary(studentId: string, row: StudySummaryRow): StudySummary {
  return { ...mapStudySummary(row), href: teacherRoutes.studentStudy(studentId, row.id) };
}

export function mapStudentStudyDetail(studentId: string, row: StudyDetailRow): StudyDetail {
  const detail = mapStudyDetail(row);
  return {
    ...detail,
    games: detail.games.map((game) => ({ ...game, href: teacherRoutes.studentGame(studentId, row.id, game.id) })),
  };
}

export function mapStudentGameView(studentId: string, row: GameViewRow): GameView {
  const view = mapGameView(row);
  return { ...view, studyHref: teacherRoutes.studentStudy(studentId, view.studyId) };
}

export function formatOptionalDate(date: Date | null | undefined): string | undefined {
  return date ? formatSpanishDate(date) : undefined;
}
