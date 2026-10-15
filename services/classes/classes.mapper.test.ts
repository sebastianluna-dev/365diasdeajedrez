import { describe, expect, it } from "vitest";
import { CLASS_BLOCK_KIND, CLASS_STATUS, TRANSCRIPT_STATUS } from "@/constants/platform/class-codes.const";
import { BOARD_ORIENTATION } from "@/constants/platform/shared-codes.const";
import { formatSpanishDate } from "@/lib/format-spanish-date";
import { formatSpanishTime } from "@/lib/format-spanish-time";
import {
  mapClassBlocks,
  mapClassDetail,
  mapClassSummary,
  type ClassDetailRow,
  type ClassSummaryRow,
} from "./classes.mapper";

// Hand-built fixtures with the shape the includes return; the type is asserted
// because what is tested is the mapping, not Prisma.
type BlockRow = ClassDetailRow["blocks"][number];

const when = new Date(Date.UTC(2026, 8, 21, 18, 30));

/** Loose on purpose: the fixtures name only what the mapper reads. */
function block(overrides: Record<string, unknown> & { kind: { code: string } }): BlockRow {
  return {
    id: "b1",
    visibility: { code: "BEFORE" },
    caption: null,
    text: null,
    videoUrl: null,
    pgn: null,
    movePath: null,
    game: null,
    lesson: null,
    position: null,
    ...overrides,
  } as unknown as BlockRow;
}

function detail(overrides: Record<string, unknown> = {}): ClassDetailRow {
  return {
    id: "c1",
    title: "Finales de torre",
    description: null,
    scheduledAt: when,
    durationMin: 60,
    endsAt: new Date(when.getTime() + 60 * 60_000),
    status: { code: CLASS_STATUS.SCHEDULED, label: "Programada" },
    format: { code: "INDIVIDUAL" },
    meetingProvider: { label: "Zoom" },
    meetingUrl: "https://zoom.us/j/1",
    meetingUrlVisibleFrom: null,
    recordingUrl: null,
    summary: null,
    teacher: { displayName: "Sebastián", title: "MF" },
    participants: [
      { userId: "me", user: { displayName: "Alumno Demo" } },
      { userId: "other", user: { displayName: "Valentina Cruz" } },
    ],
    transcript: null,
    blocks: [],
    ...overrides,
  } as unknown as ClassDetailRow;
}

describe("mapClassSummary", () => {
  it("lleva la fecha, la hora, el estado y el enlace de la clase", () => {
    const row = {
      id: "c1",
      title: "Finales",
      scheduledAt: when,
      durationMin: 45,
      status: { code: CLASS_STATUS.LIVE, label: "En curso" },
      format: { code: "INDIVIDUAL" },
      teacher: { displayName: "Sebastián" },
    } as unknown as ClassSummaryRow;

    expect(mapClassSummary(row)).toEqual({
      id: "c1",
      title: "Finales",
      teacherName: "Sebastián",
      scheduledAtIso: when.toISOString(),
      dateLabel: formatSpanishDate(when),
      timeLabel: formatSpanishTime(when),
      durationMin: 45,
      statusCode: CLASS_STATUS.LIVE,
      statusLabel: "En curso",
      href: "/clases/c1",
    });
  });
});

describe("mapClassDetail", () => {
  it("nombra la clase sin tema por su profesor, y a los compañeros sólo por su nombre", () => {
    const view = mapClassDetail(detail({ title: null }), when, "me");
    expect(view.title).toBe("Clase con Sebastián");
    expect(view.classmates).toEqual(["Valentina Cruz"]);
    expect(view.phase).toBe("IN_PROGRESS");
    expect(JSON.stringify(view)).not.toMatch(/email|payment/);
  });

  it("cierra el enlace media hora después del fin, aunque nadie finalizara la clase", () => {
    const closes = new Date(when.getTime() + 90 * 60_000);
    expect(mapClassDetail(detail(), new Date(closes.getTime() - 1)).meetingUrl).toBe("https://zoom.us/j/1");
    const view = mapClassDetail(detail(), closes);
    expect(view.meetingUrl).toBeUndefined();
    expect(view.meetingVisibleFromIso).toBeUndefined();
    expect(view.phase).toBe("AWAITING_CLOSE");
  });

  it("el alumno ve lo de preparar siempre, lo de después desde el fin, y el guion nunca", () => {
    const row = detail({
      blocks: [
        block({
          id: "b",
          kind: { code: CLASS_BLOCK_KIND.TEXT },
          text: "Trae tus dudas",
          visibility: { code: "BEFORE" },
        }),
        block({ id: "a", kind: { code: CLASS_BLOCK_KIND.TEXT }, text: "Lo que vimos", visibility: { code: "AFTER" } }),
        block({ id: "t", kind: { code: CLASS_BLOCK_KIND.TEXT }, text: "Preguntas", visibility: { code: "TEACHER" } }),
      ],
    });
    const before = mapClassDetail(row, new Date(when.getTime() - 60_000)).blocks.map((item) => item.id);
    const after = mapClassDetail(row, new Date(when.getTime() + 61 * 60_000)).blocks.map((item) => item.id);
    expect(before).toEqual(["b"]);
    expect(after).toEqual(["b", "a"]);
    expect(mapClassBlocks(row.blocks, { audience: "staff", phase: "UPCOMING" }).map((item) => item.id)).toEqual([
      "b",
      "a",
      "t",
    ]);
  });

  it("oculta el enlace de la reunión hasta la hora de visibilidad y deja la cuenta atrás", () => {
    const visibleFrom = new Date(when.getTime() - 15 * 60_000);
    const before = mapClassDetail(detail({ meetingUrlVisibleFrom: visibleFrom }), new Date(visibleFrom.getTime() - 1));
    expect(before.meetingUrl).toBeUndefined();
    expect(before.meetingVisibleFromIso).toBe(visibleFrom.toISOString());

    const after = mapClassDetail(detail({ meetingUrlVisibleFrom: visibleFrom }), visibleFrom);
    expect(after.meetingUrl).toBe("https://zoom.us/j/1");
    expect(after.meetingVisibleFromIso).toBeUndefined();
  });

  it("sin hora elegida, el enlace se abre media hora antes de la clase", () => {
    const opens = new Date(when.getTime() - 30 * 60_000);
    const before = mapClassDetail(detail(), new Date(opens.getTime() - 1));
    expect(before.meetingUrl).toBeUndefined();
    expect(before.meetingVisibleFromIso).toBe(opens.toISOString());
    expect(mapClassDetail(detail(), opens).meetingUrl).toBe("https://zoom.us/j/1");
  });

  // The instant a row stores means nothing without a link: a countdown to it
  // would promise a link that does not exist, and past it the countdown would
  // ask the server for the page again and again.
  it("sin enlace no hay cuenta atrás, ni antes ni después de la hora de visibilidad", () => {
    const visibleFrom = new Date(when.getTime() - 30 * 60_000);
    const row = detail({ meetingUrl: null, meetingUrlVisibleFrom: visibleFrom });

    for (const now of [new Date(visibleFrom.getTime() - 1), visibleFrom, new Date(when.getTime() + 60 * 60_000)]) {
      const view = mapClassDetail(row, now);
      expect(view.meetingUrl).toBeUndefined();
      expect(view.meetingVisibleFromIso).toBeUndefined();
    }
  });

  it("sin enlace ni hora de visibilidad no manda nada", () => {
    const view = mapClassDetail(detail({ meetingUrl: null }), when);
    expect(view.meetingUrl).toBeUndefined();
    expect(view.meetingVisibleFromIso).toBeUndefined();
  });

  it("descarta los bloques vacíos y mapea cada tipo a su vista", () => {
    const row = detail({
      blocks: [
        block({ id: "t0", kind: { code: CLASS_BLOCK_KIND.TEXT }, text: "" }),
        block({ id: "t1", kind: { code: CLASS_BLOCK_KIND.TEXT }, text: "Hola", caption: "Intro" }),
        block({ id: "v1", kind: { code: CLASS_BLOCK_KIND.VIDEO }, videoUrl: "https://youtu.be/x" }),
        block({
          id: "p1",
          kind: { code: CLASS_BLOCK_KIND.POSITION_REF },
          position: { fen: "8/8/8/8/8/8/8/K6k w - - 0 1", title: null, orientation: { code: BOARD_ORIENTATION.BLACK } },
        }),
        block({ id: "f1", kind: { code: CLASS_BLOCK_KIND.FILE } }),
        block({ id: "x1", kind: { code: "UNKNOWN" } }),
      ],
    });

    const blocks = mapClassDetail(row, when).blocks;
    expect(blocks.map((item) => item.kind)).toEqual(["TEXT", "VIDEO", "POSITION_REF", "FILE"]);
    expect(blocks[0]).toMatchObject({ id: "t1", caption: "Intro", text: "Hola" });
    expect(blocks[2]).toMatchObject({ position: { orientation: "black", title: undefined } });
  });

  it("en una referencia de partida manda el PGN transcrito en el bloque; si no, la partida enlazada", () => {
    const game = { id: "g1", white: "Morphy", black: "Duque", pgn: "1. e4 e5", databaseId: "db1" };
    const row = detail({
      blocks: [
        block({ id: "own", kind: { code: CLASS_BLOCK_KIND.GAME_REF }, pgn: "1. d4", game, movePath: "0" }),
        block({ id: "ref", kind: { code: CLASS_BLOCK_KIND.GAME_REF }, game }),
        block({ id: "none", kind: { code: CLASS_BLOCK_KIND.GAME_REF } }),
      ],
    });

    const [own, ref, ...rest] = mapClassDetail(row, when).blocks;
    expect(rest).toEqual([]);
    expect(own).toMatchObject({
      kind: "GAME_REF",
      game: { id: "own", label: "Partida de la clase", pgn: "1. d4", movePath: "0" },
    });
    expect(ref).toMatchObject({
      kind: "GAME_REF",
      game: { id: "g1", label: "Morphy – Duque", pgn: "1. e4 e5", href: "/estudios/db1/partidas/g1" },
    });
  });

  it("una lección enlazada trae el PGN de su partida cuando la tiene, y su orientación", () => {
    const row = detail({
      blocks: [
        block({
          id: "l1",
          kind: { code: CLASS_BLOCK_KIND.LESSON_REF },
          lesson: {
            id: "00000001",
            name: "Torre activa",
            pgn: "propio",
            game: { pgn: "de la partida" },
            orientation: { code: BOARD_ORIENTATION.BLACK },
            chapter: { order: 2, courseId: "10000009" },
          },
        }),
      ],
    });

    expect(mapClassDetail(row, when).blocks[0]).toMatchObject({
      kind: "LESSON_REF",
      lesson: { id: "00000001", pgn: "de la partida", orientation: "black", href: "/cursos/10000009/2/00000001" },
    });
  });

  it("mapea la transcripción cuando existe", () => {
    const row = detail({ transcript: { status: { code: TRANSCRIPT_STATUS.READY, label: "Lista" }, text: "…" } });
    expect(mapClassDetail(row, when).transcript).toEqual({
      statusCode: TRANSCRIPT_STATUS.READY,
      statusLabel: "Lista",
      text: "…",
    });
    expect(mapClassDetail(detail(), when).transcript).toBeUndefined();
  });
});
