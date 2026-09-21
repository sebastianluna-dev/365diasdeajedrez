import { teacherRoutes } from "@/lib/platform-routes";
import { mapGameView, mapStudyDetail, mapStudySummary, type GameViewRow, type StudyDetailRow, type StudySummaryRow } from "@/services/studies/studies.mapper";
import type { GameView, StudyDetail, StudySummary } from "@/services/studies/studies.types";

// The "Mis estudios" view models serve the teacher's view as they are: the only
// thing that changes are the links, which have to stay inside
// /profesor/alumnos/<id> (if they pointed at /estudios the teacher would get a
// 404, because those routes only show the studies of whoever opens them).

// `null` as the viewer in all three: the teacher LOOKS at their student's
// material — so they can cite it in class — and neither edits nor deletes it.
// The server would reject it all the same, but this way the buttons are not
// offered either.

export function mapStudentStudySummary(studentId: string, row: StudySummaryRow): StudySummary {
  return { ...mapStudySummary(row, null), href: teacherRoutes.studentStudy(studentId, row.id) };
}

export function mapStudentStudyDetail(studentId: string, row: StudyDetailRow): StudyDetail {
  const detail = mapStudyDetail(row, null);
  return {
    ...detail,
    games: detail.games.map((game) => ({ ...game, href: teacherRoutes.studentGame(studentId, row.id, game.id) })),
  };
}

export function mapStudentGameView(studentId: string, row: GameViewRow): GameView {
  const view = mapGameView(row, null);
  return { ...view, studyHref: teacherRoutes.studentStudy(studentId, view.studyId) };
}
