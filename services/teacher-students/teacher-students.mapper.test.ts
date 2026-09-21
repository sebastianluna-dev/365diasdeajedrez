import { describe, expect, it } from "vitest";
import { DATABASE_KIND } from "@/constants/platform/study-codes.const";
import { teacherRoutes } from "@/lib/platform-routes";
import type { GameViewRow, StudyDetailRow, StudySummaryRow } from "@/services/studies/studies.mapper";
import { mapStudentGameView, mapStudentStudyDetail, mapStudentStudySummary } from "./teacher-students.mapper";

const kind = { id: 1, code: DATABASE_KIND.STUDY, label: "Estudio", order: 0 };
const dates = { createdAt: new Date(2026, 0, 1), updatedAt: new Date(2026, 0, 1) };

describe("the teacher's read-only view of a student's studies", () => {
  it("el resumen enlaza dentro del panel del profesor y sin permisos de escritura", () => {
    const row = {
      id: "s1",
      userId: "alumna",
      name: "Mis partidas",
      description: null,
      kind,
      courseId: null,
      course: null,
      shares: [],
      games: [],
      _count: { games: 2 },
      ...dates,
    } as unknown as StudySummaryRow;

    const summary = mapStudentStudySummary("alumna", row);
    expect(summary.href).toBe(teacherRoutes.studentStudy("alumna", "s1"));
    expect(summary.permissions.canEditGames).toBe(false);
  });

  it("el detalle reescribe el enlace de cada partida hacia el panel", () => {
    const row = {
      id: "s1",
      userId: "alumna",
      name: "Torneo",
      description: null,
      kind,
      kindId: 1,
      courseId: null,
      course: null,
      isDefault: false,
      shares: [],
      games: [
        {
          id: "g1",
          title: null,
          white: "A",
          black: "B",
          round: null,
          eco: null,
          event: null,
          playedAt: null,
          result: { label: "½-½" },
          _count: { classBlocks: 0 },
        },
      ],
      ...dates,
    } as unknown as StudyDetailRow;

    const detail = mapStudentStudyDetail("alumna", row);
    expect(detail.games[0]?.href).toBe(teacherRoutes.studentGame("alumna", "s1", "g1"));
    expect(detail.permissions.canEditGames).toBe(false);
  });

  it("la partida apunta de vuelta al estudio del alumno dentro del panel", () => {
    const row = {
      id: "g1",
      title: null,
      white: "A",
      black: "B",
      whiteElo: null,
      blackElo: null,
      whiteTitle: null,
      blackTitle: null,
      whiteCountry: null,
      blackCountry: null,
      round: null,
      eco: null,
      event: null,
      site: null,
      playedAt: null,
      initialFen: null,
      pgn: "1. e4 *",
      order: 0,
      result: { label: "*", code: "ONGOING" },
      source: { label: "Manual" },
      database: { id: "s1", name: "Torneo", userId: "alumna", kind: { code: DATABASE_KIND.STUDY } },
      _count: { classBlocks: 0 },
      ...dates,
    } as unknown as GameViewRow;

    const view = mapStudentGameView("alumna", row);
    expect(view.studyHref).toBe(teacherRoutes.studentStudy("alumna", "s1"));
    expect(view.canEdit).toBe(false);
  });
});
