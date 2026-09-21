import { describe, expect, it } from "vitest";
import { CLASS_BLOCK_KIND, CLASS_STATUS, TRANSCRIPT_STATUS } from "@/constants/platform/class-codes.const";
import { BOARD_ORIENTATION } from "@/constants/platform/shared-codes.const";
import { formatSpanishDate } from "@/lib/format-spanish-date";
import { formatSpanishTime } from "@/lib/format-spanish-time";
import { mapClassDetail, mapClassSummary, type ClassDetailRow, type ClassSummaryRow } from "./classes.mapper";

// Hand-built fixtures with the shape the includes return; the type is asserted
// because what is tested is the mapping, not Prisma.
type BlockRow = ClassDetailRow["blocks"][number];

const when = new Date(Date.UTC(2026, 8, 21, 18, 30));

/** Loose on purpose: the fixtures name only what the mapper reads. */
function block(overrides: Record<string, unknown> & { kind: { code: string } }): BlockRow {
  return {
    id: "b1",
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
    status: { code: CLASS_STATUS.SCHEDULED, label: "Programada" },
    meetingProvider: { label: "Zoom" },
    meetingUrl: "https://zoom.us/j/1",
    meetingUrlVisibleFrom: null,
    recordingUrl: null,
    summary: null,
    teacher: { displayName: "Sebastián", title: "MF" },
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
  it("oculta el enlace de la reunión hasta la hora de visibilidad y deja la cuenta atrás", () => {
    const visibleFrom = new Date(when.getTime() - 15 * 60_000);
    const before = mapClassDetail(detail({ meetingUrlVisibleFrom: visibleFrom }), new Date(visibleFrom.getTime() - 1));
    expect(before.meetingUrl).toBeUndefined();
    expect(before.meetingVisibleFromIso).toBe(visibleFrom.toISOString());

    const after = mapClassDetail(detail({ meetingUrlVisibleFrom: visibleFrom }), visibleFrom);
    expect(after.meetingUrl).toBe("https://zoom.us/j/1");
    expect(after.meetingVisibleFromIso).toBeUndefined();
  });

  it("sin hora de visibilidad, el enlace se ve siempre", () => {
    expect(mapClassDetail(detail(), new Date(0)).meetingUrl).toBe("https://zoom.us/j/1");
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
          },
        }),
      ],
    });

    expect(mapClassDetail(row, when).blocks[0]).toMatchObject({
      kind: "LESSON_REF",
      lesson: { id: "00000001", pgn: "de la partida", orientation: "black", href: "/lecciones/00000001" },
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
