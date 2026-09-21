import { describe, expect, it } from "vitest";
import { CLASS_BLOCK_KIND, CLASS_STATUS } from "@/constants/platform/class-codes.const";
import { mapClassDetail, type ClassDetailRow } from "@/services/classes/classes.mapper";
import { mapTeacherClassDetail, type TeacherClassDetailRow } from "./teacher-classes.mapper";

// The meeting link is the difference that justifies the teacher having their own
// mapper: the student's hides it until `meetingUrlVisibleFrom` and the teacher —
// who is the one who sets it — has to see it always.

const SCHEDULED_AT = new Date("2026-09-15T17:00:00.000Z");
const VISIBLE_FROM = new Date("2026-09-15T16:30:00.000Z");
const BEFORE_VISIBLE = new Date("2026-09-15T10:00:00.000Z");
const MEETING_URL = "https://zoom.us/j/99999999999";

const SHORT_PGN = "1. e4 e5 2. Nf3 Nc6 *";

function teacherRow(overrides: Partial<TeacherClassDetailRow> = {}): TeacherClassDetailRow {
  return {
    id: "class-1",
    teacherId: "teacher-1",
    title: "Ataque al rey en el centro",
    description: null,
    scheduledAt: SCHEDULED_AT,
    durationMin: 60,
    statusId: 1,
    meetingProviderId: 1,
    meetingUrl: MEETING_URL,
    meetingUrlVisibleFrom: VISIBLE_FROM,
    recordingUrl: null,
    summary: null,
    createdAt: SCHEDULED_AT,
    updatedAt: SCHEDULED_AT,
    status: { id: 1, code: CLASS_STATUS.SCHEDULED, label: "Programada", order: 0 },
    meetingProvider: { id: 1, code: "ZOOM", label: "Zoom", order: 0 },
    transcript: null,
    participants: [],
    blocks: [],
    ...overrides,
  } as unknown as TeacherClassDetailRow;
}

function studentRow(): ClassDetailRow {
  return {
    ...teacherRow(),
    teacher: { displayName: "GM Profesor Demo", title: "Gran Maestro" },
    blocks: [],
  } as unknown as ClassDetailRow;
}

describe("mapTeacherClassDetail", () => {
  it("muestra el enlace de la reunión aunque todavía no sea visible para el alumno", () => {
    const teacherView = mapTeacherClassDetail(teacherRow(), "UTC");
    const studentView = mapClassDetail(studentRow(), BEFORE_VISIBLE);

    expect(teacherView.meetingUrl).toBe(MEETING_URL);
    expect(studentView.meetingUrl).toBeUndefined();
    expect(studentView.meetingVisibleFromIso).toBe(VISIBLE_FROM.toISOString());
  });

  it("pinta la fecha para el input en la zona del profesor", () => {
    expect(mapTeacherClassDetail(teacherRow(), "UTC").scheduledAtInput).toBe("2026-09-15T17:00");
    expect(mapTeacherClassDetail(teacherRow(), "America/Mexico_City").scheduledAtInput).toBe("2026-09-15T11:00");
  });

  it("marca el movePath que ya no resuelve contra el PGN actual", () => {
    const blocks = [
      {
        id: "block-ok",
        classId: "class-1",
        order: 1,
        kindId: 3,
        text: null,
        videoUrl: null,
        gameId: "game-1",
        lessonId: null,
        positionId: null,
        movePath: "0.0",
        caption: null,
        kind: { id: 3, code: CLASS_BLOCK_KIND.GAME_REF, label: "Partida", order: 2 },
        game: { id: "game-1", white: "Morphy", black: "Duque", pgn: SHORT_PGN },
        lesson: null,
        position: null,
      },
      {
        id: "block-broken",
        classId: "class-1",
        order: 2,
        kindId: 3,
        text: null,
        videoUrl: null,
        gameId: "game-1",
        lessonId: null,
        positionId: null,
        movePath: "0.0.0.0.0.0.0.0",
        caption: null,
        kind: { id: 3, code: CLASS_BLOCK_KIND.GAME_REF, label: "Partida", order: 2 },
        game: { id: "game-1", white: "Morphy", black: "Duque", pgn: SHORT_PGN },
        lesson: null,
        position: null,
      },
    ];

    const view = mapTeacherClassDetail(teacherRow({ blocks } as Partial<TeacherClassDetailRow>), "UTC");
    expect(view.blocks[0]?.isMovePathBroken).toBe(false);
    expect(view.blocks[1]?.isMovePathBroken).toBe(true);
    expect(view.blocks[0]?.referenceLabel).toBe("Morphy – Duque");
  });
});
