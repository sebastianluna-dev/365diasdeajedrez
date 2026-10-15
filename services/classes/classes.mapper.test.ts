import { describe, expect, it } from "vitest";
import {
  CLASS_BLOCK_KIND,
  CLASS_FORMAT,
  CLASS_PHASE,
  CLASS_STATUS,
  TRANSCRIPT_STATUS,
} from "@/constants/platform/class-codes.const";
import { BOARD_ORIENTATION } from "@/constants/platform/shared-codes.const";
import { GAME_ANALYSIS_MODE } from "@/constants/platform/study-codes.const";
import { CLASSES_NOW, CLASSES_TIME_ZONE, cdmx } from "@/lib/testing/fixtures/classes";
import {
  balanceLineOf,
  coverageLineOf,
  groupPastByMonth,
  mapClassBlocks,
  mapClassCard,
  mapStudentBalance,
  mapStudentClassDetail,
  mapUnscheduled,
  paymentDayOf,
  peopleLineOf,
  type ClassDetailRow,
  type StudentClassSource,
  type StudentContext,
  type StudentPaymentCount,
  type StudentSeatSource,
} from "./classes.mapper";

// Hand-built sources with the shape the service feeds; the block rows are
// asserted as Prisma's because what is tested is the mapping, not Prisma.
type BlockRow = ClassDetailRow["blocks"][number];

const PAYMENT = { id: "pay-oct-1", paidOn: new Date("2026-10-01T00:00:00.000Z"), classCount: 4 };
const WHATSAPP = "https://wa.me/522291348338?text=Hola";

const context: StudentContext = {
  now: CLASSES_NOW,
  timeZone: CLASSES_TIME_ZONE,
  whatsappHref: WHATSAPP,
  ordinalOf: (paymentId, classId) => (paymentId === PAYMENT.id && classId === "c2" ? 2 : undefined),
};

function seat(extra: Partial<StudentSeatSource> = {}): StudentSeatSource {
  return {
    payment: PAYMENT,
    isFree: false,
    attended: null,
    seatMovedAt: null,
    seatMovedToClass: null,
    replaces: null,
    ...extra,
  };
}

/** Today's class at noon, the link open at 11:40. */
function source(extra: Partial<StudentClassSource> = {}): StudentClassSource {
  return {
    id: "c2",
    title: "Repaso de la Najdorf: tus dudas",
    description: null,
    scheduledAt: cdmx("2026-10-14", "12:00"),
    endsAt: cdmx("2026-10-14", "13:00"),
    durationMin: 60,
    statusCode: CLASS_STATUS.SCHEDULED,
    formatCode: CLASS_FORMAT.INDIVIDUAL,
    teacherName: "GM Profesor Demo",
    meetingUrl: "https://zoom.us/j/11111111111",
    meetingUrlVisibleFrom: null,
    providerLabel: "Zoom",
    recordingUrl: null,
    summary: null,
    previousScheduledAt: null,
    rescheduleNote: null,
    cancelNote: null,
    classmates: [],
    blocks: [{ visibility: "BEFORE" }, { visibility: "BEFORE" }, { visibility: "AFTER" }, { visibility: "TEACHER" }],
    seat: seat(),
    ...extra,
  };
}

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
    createdAt: new Date("2026-10-01T00:00:00.000Z"),
    ...overrides,
  } as unknown as BlockRow;
}

function detailRow(overrides: Record<string, unknown> = {}): ClassDetailRow {
  return { blocks: [], transcript: null, ...overrides } as unknown as ClassDetailRow;
}

function detail(extra: Partial<StudentClassSource> = {}, row: ClassDetailRow = detailRow(), at: Date = CLASSES_NOW) {
  return mapStudentClassDetail({ ...source(extra), row, viewerId: "me", balanceLine: null }, { ...context, now: at });
}

describe("mapClassCard", () => {
  it("today's class: «Enlace abierto», the link, what there is to prepare, and no word about money", () => {
    const card = mapClassCard(source(), context);
    expect(card.phase).toBe(CLASS_PHASE.OPEN);
    expect(card.title).toBe("Repaso de la Najdorf: tus dudas");
    expect(card.people).toBe("con GM Profesor Demo");
    expect(card.visibleBlocks).toBe(2);
    expect(card.join).toMatchObject({
      meetingUrl: "https://zoom.us/j/11111111111",
      hasLink: true,
      providerLabel: "Zoom",
    });
    expect(card.past).toBeNull();
    expect(card.cancelled).toBe(false);
    expect(JSON.stringify(card)).not.toMatch(/pago|\$|email/i);
  });

  it("a class without a topic is «Clase con …»; a group class names the classmates", () => {
    const card = mapClassCard(
      source({
        title: null,
        formatCode: CLASS_FORMAT.GROUP,
        classmates: ["Mateo Ríos", "Diego Salas", "Lucía Herrera"],
      }),
      context,
    );
    expect(card.title).toBe("Clase con GM Profesor Demo");
    expect(card.people).toBe("con GM Profesor Demo · Grupal, con Mateo Ríos, Diego Salas y Lucía Herrera");
    expect(peopleLineOf({ teacherName: "GM Profesor Demo", formatCode: CLASS_FORMAT.GROUP, classmates: [] })).toBe(
      "con GM Profesor Demo · Grupal",
    );
  });

  it("a past class says whether they came, whether there is a recording, and how many blocks there are", () => {
    const card = mapClassCard(
      source({
        id: "c1",
        scheduledAt: cdmx("2026-10-07", "12:00"),
        endsAt: cdmx("2026-10-07", "13:00"),
        statusCode: CLASS_STATUS.COMPLETED,
        recordingUrl: "https://zoom.us/rec/1",
        seat: seat({ attended: true }),
      }),
      context,
    );
    expect(card.phase).toBe(CLASS_PHASE.DONE);
    expect(card.past).toEqual({ attended: true, hasRecording: true });
    expect(card.visibleBlocks).toBe(3);
  });

  it("the link is offered half an hour past the end, and the class stays ahead until then", () => {
    const row = source({ scheduledAt: cdmx("2026-10-14", "10:30"), endsAt: cdmx("2026-10-14", "11:30") });
    const tail = mapClassCard(row, context);
    expect(tail.phase).toBe(CLASS_PHASE.AWAITING_CLOSE);
    expect(tail.past).toBeNull();
    expect(tail.join?.meetingUrl).toBe("https://zoom.us/j/11111111111");
    const over = mapClassCard(row, { ...context, now: cdmx("2026-10-14", "12:00") });
    expect(over.past).toEqual({ attended: null, hasRecording: false });
    expect(over.join?.meetingUrl).toBeNull();
  });

  it("the old class of a moved seat points at the new date; the new class says it is the make-up", () => {
    const old = mapClassCard(
      source({
        id: "c11",
        statusCode: CLASS_STATUS.COMPLETED,
        scheduledAt: cdmx("2026-10-02", "19:00"),
        endsAt: cdmx("2026-10-02", "20:00"),
        seat: seat({
          attended: false,
          seatMovedAt: cdmx("2026-10-03", "09:00"),
          seatMovedToClass: { id: "c12", scheduledAt: cdmx("2026-10-09", "19:00") },
        }),
      }),
      context,
    );
    expect(old.moved).toEqual({ label: "No asististe · tu clase pasó al vie 9 oct", href: "/clases/c12" });
    expect(old.past).toEqual({ attended: false, hasRecording: false });

    const makeUp = mapClassCard(
      source({
        id: "c12",
        seat: seat({ replaces: { scheduledAt: cdmx("2026-10-02", "19:00"), note: "Te la reponemos." } }),
      }),
      context,
    );
    expect(makeUp.makeUpLabel).toBe("Es la reposición de tu clase del vie 2 oct.");
  });

  it("a seat returned to its payment says so only when it was paid", () => {
    const moved = { attended: false, seatMovedAt: cdmx("2026-10-03", "09:00") };
    expect(mapClassCard(source({ seat: seat(moved) }), context).moved).toEqual({
      label: "No asististe · tu clase volvió a tu pago",
      href: null,
    });
    expect(mapClassCard(source({ seat: seat({ ...moved, payment: null }) }), context).moved?.label).toBe(
      "No asististe · se te dará otra fecha",
    );
    expect(mapClassCard(source({ seat: seat({ ...moved, isFree: true }) }), context).moved?.label).toBe(
      "No asististe · se te dará otra fecha",
    );
  });

  it("a cancelled class has no join card and shows nothing to prepare", () => {
    const card = mapClassCard(source({ statusCode: CLASS_STATUS.CANCELLED }), context);
    expect(card.cancelled).toBe(true);
    expect(card.join).toBeNull();
    expect(card.visibleBlocks).toBe(0);
    expect(card.past).toBeNull();
  });
});

describe("coverageLineOf", () => {
  it("«Clase n de m de tu pago del …», «Esta clase es gratis.», or nothing without a payment", () => {
    expect(coverageLineOf(source(), context)).toBe("Clase 2 de 4 de tu pago del 1 de octubre · Individual");
    expect(coverageLineOf(source({ formatCode: CLASS_FORMAT.GROUP, id: "c5" }), context)).toBe(
      "De tu pago del 1 de octubre · Grupal",
    );
    expect(coverageLineOf(source({ seat: seat({ isFree: true }) }), context)).toBe("Esta clase es gratis.");
    expect(coverageLineOf(source({ seat: seat({ payment: null }) }), context)).toBeNull();
  });

  it("a payment's day carries its year only when it is another one", () => {
    expect(paymentDayOf(new Date("2025-12-20T00:00:00.000Z"), CLASSES_NOW)).toBe("20 de diciembre de 2025");
  });
});

describe("mapStudentClassDetail", () => {
  it("looks ahead until the link closes and reviews after, with the classmates by name only", () => {
    const view = detail({ title: null, classmates: ["Valentina Cruz"] });
    expect(view.title).toBe("Clase con GM Profesor Demo");
    expect(view.view).toBe("ahead");
    expect(view.classmates).toEqual(["Valentina Cruz"]);
    expect(view.coverage).toBe("Clase 2 de 4 de tu pago del 1 de octubre · Individual");
    expect(view.join.meetingUrl).toBe("https://zoom.us/j/11111111111");
    expect(JSON.stringify(view)).not.toMatch(/email|\$/i);

    const closes = cdmx("2026-10-14", "13:30");
    expect(detail({}, detailRow(), new Date(closes.getTime() - 1)).view).toBe("ahead");
    const over = detail({}, detailRow(), closes);
    expect(over.view).toBe("review");
    expect(over.join.meetingUrl).toBeNull();
    expect(over.phase).toBe(CLASS_PHASE.AWAITING_CLOSE);
  });

  it("hides the link until it opens and leaves only the instant, which belongs to the link", () => {
    const visibleFrom = cdmx("2026-10-14", "11:45");
    const before = detail({ meetingUrlVisibleFrom: visibleFrom });
    expect(before.join.meetingUrl).toBeNull();
    expect(before.join.visibleFromIso).toBe(visibleFrom.toISOString());
    expect(detail({ meetingUrlVisibleFrom: visibleFrom }, detailRow(), visibleFrom).join.meetingUrl).toBe(
      "https://zoom.us/j/11111111111",
    );
    const noLink = detail({ meetingUrl: null, meetingUrlVisibleFrom: visibleFrom });
    expect(noLink.join).toMatchObject({ meetingUrl: null, hasLink: false, visibleFromIso: null, untilIso: null });
  });

  it("a cancelled class carries the staff's note and whether the seat went back to a payment", () => {
    const paid = detail({ statusCode: CLASS_STATUS.CANCELLED, cancelNote: "Te escribiremos para fijar otra fecha." });
    expect(paid.cancelled).toEqual({ note: "Te escribiremos para fijar otra fecha.", returnedToPayment: true });
    expect(paid.rescheduled).toBeNull();
    expect(
      detail({ statusCode: CLASS_STATUS.CANCELLED, seat: seat({ isFree: true }) }).cancelled?.returnedToPayment,
    ).toBe(false);
    expect(
      detail({ statusCode: CLASS_STATUS.CANCELLED, seat: seat({ payment: null }) }).cancelled?.returnedToPayment,
    ).toBe(false);
  });

  it("a rescheduled class says where it came from, and a make-up which class it replaces, with the note", () => {
    const moved = detail({ previousScheduledAt: cdmx("2026-10-13", "12:00"), rescheduleNote: "Por un examen." });
    expect(moved.rescheduled).toEqual({ previousLabel: "mar 13 oct", note: "Por un examen." });
    const makeUp = detail({
      seat: seat({ replaces: { scheduledAt: cdmx("2026-10-02", "19:00"), note: "Te la reponemos el viernes." } }),
    });
    expect(makeUp.makeUp).toEqual({
      label: "Es la reposición de tu clase del vie 2 oct.",
      note: "Te la reponemos el viernes.",
    });
  });

  it("the student sees what is to prepare always, what comes after from the end, and the script never", () => {
    const row = detailRow({
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
    expect(detail({}, row).blocks.map((item) => item.id)).toEqual(["b"]);
    expect(detail({}, row, cdmx("2026-10-14", "13:01")).blocks.map((item) => item.id)).toEqual(["b", "a"]);
    expect(detail({ statusCode: CLASS_STATUS.CANCELLED }, row).blocks).toEqual([]);
    expect(
      mapClassBlocks(row.blocks, { audience: "staff", phase: CLASS_PHASE.UPCOMING }).map((item) => item.id),
    ).toEqual(["b", "a", "t"]);
  });

  it("a block added after the class started, in the last week, is new", () => {
    const row = detailRow({
      blocks: [
        block({ id: "old", kind: { code: CLASS_BLOCK_KIND.TEXT }, text: "x" }),
        block({ id: "new", kind: { code: CLASS_BLOCK_KIND.TEXT }, text: "y", createdAt: cdmx("2026-10-14", "12:30") }),
      ],
    });
    const blocks = detail({}, row, cdmx("2026-10-14", "14:00")).blocks;
    expect(blocks.map((item) => [item.id, item.isNew])).toEqual([
      ["old", false],
      ["new", true],
    ]);
  });

  it("drops the empty blocks and maps each kind to its view", () => {
    const row = detailRow({
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
    const blocks = detail({}, row).blocks;
    expect(blocks.map((item) => item.kind)).toEqual(["TEXT", "VIDEO", "POSITION_REF", "FILE"]);
    expect(blocks[0]).toMatchObject({ id: "t1", caption: "Intro", text: "Hola" });
    expect(blocks[2]).toMatchObject({ position: { orientation: "black", title: undefined } });
  });

  it("a game block carries the players, the result, the orientation, the concealment and the pinned comment", () => {
    const game = {
      id: "g1",
      white: "Morphy",
      black: "Duque de Brunswick",
      whiteElo: null,
      blackElo: null,
      whiteTitle: null,
      blackTitle: null,
      whiteCountry: "USA",
      blackCountry: null,
      pgn: "1. e4 e5",
      pinnedComment: "La Partida de la Ópera.",
      databaseId: "db1",
      result: { label: "1-0" },
      orientation: { code: BOARD_ORIENTATION.BLACK },
      analysisMode: { code: GAME_ANALYSIS_MODE.CONCEAL },
      database: { userId: "teacher" },
    };
    const row = detailRow({
      blocks: [
        block({ id: "own", kind: { code: CLASS_BLOCK_KIND.GAME_REF }, pgn: "1. d4", game, movePath: "0" }),
        block({ id: "ref", kind: { code: CLASS_BLOCK_KIND.GAME_REF }, game }),
        block({ id: "none", kind: { code: CLASS_BLOCK_KIND.GAME_REF } }),
      ],
    });
    const [own, ref, ...rest] = detail({}, row).blocks;
    expect(rest).toEqual([]);
    expect(own).toMatchObject({
      kind: "GAME_REF",
      game: { id: "own", label: "Partida de la clase", pgn: "1. d4", movePath: "0" },
    });
    expect(ref).toMatchObject({
      kind: "GAME_REF",
      game: {
        id: "g1",
        label: "Morphy – Duque de Brunswick",
        players: { white: { name: "Morphy", country: "USA" }, black: { name: "Duque de Brunswick" } },
        result: "1-0",
        orientation: "black",
        conceal: true,
        pinnedComment: "La Partida de la Ópera.",
      },
    });
    expect((ref as { game: { href?: string } }).game.href).toBeUndefined();
  });

  it("«Abrir la partida» only when the study is the reader's", () => {
    const game = {
      id: "g1",
      white: "A",
      black: "B",
      pgn: "1. e4",
      databaseId: "db-mine",
      result: { label: "*" },
      orientation: null,
      analysisMode: null,
      database: { userId: "me" },
    };
    const row = detailRow({ blocks: [block({ id: "ref", kind: { code: CLASS_BLOCK_KIND.GAME_REF }, game })] });
    expect(detail({}, row).blocks[0]).toMatchObject({
      game: { href: "/estudios/db-mine/partidas/g1", orientation: "white" },
    });
  });

  it("a lesson block brings the PGN of its game when it has one, and its orientation", () => {
    const row = detailRow({
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
    expect(detail({}, row).blocks[0]).toMatchObject({
      kind: "LESSON_REF",
      lesson: { id: "00000001", pgn: "de la partida", orientation: "black", href: "/cursos/10000009/2/00000001" },
    });
  });

  it("maps the transcript when there is one", () => {
    const row = detailRow({ transcript: { status: { code: TRANSCRIPT_STATUS.READY, label: "Lista" }, text: "…" } });
    expect(detail({}, row).transcript).toEqual({
      statusCode: TRANSCRIPT_STATUS.READY,
      statusLabel: "Lista",
      text: "…",
    });
    expect(detail().transcript).toBeNull();
  });
});

describe("the balance", () => {
  const payment = (extra: Partial<StudentPaymentCount> = {}): StudentPaymentCount => ({
    ...PAYMENT,
    taken: 1,
    scheduled: 2,
    toSchedule: 1,
    ...extra,
  });

  it("says what is left of one payment, and of several", () => {
    expect(balanceLineOf([payment()], CLASSES_NOW)).toBe(
      "Te quedan 3 clases de tu pago del 1 de octubre: 2 programadas y 1 por programar.",
    );
    expect(balanceLineOf([payment({ scheduled: 0, toSchedule: 1 })], CLASSES_NOW)).toBe(
      "Te queda 1 clase de tu pago del 1 de octubre: 1 por programar.",
    );
    expect(
      balanceLineOf(
        [
          payment({ id: "p1", paidOn: new Date("2026-09-03T00:00:00.000Z"), scheduled: 1, toSchedule: 0 }),
          payment({ id: "p2", scheduled: 1, toSchedule: 1 }),
        ],
        CLASSES_NOW,
      ),
    ).toBe("Te quedan 3 clases de tus pagos del 3 de septiembre y del 1 de octubre: 2 programadas y 1 por programar.");
  });

  it("with nothing left it says the payment was taken; without a payment it says nothing", () => {
    expect(balanceLineOf([payment({ taken: 4, scheduled: 0, toSchedule: 0 })], CLASSES_NOW)).toBe(
      "Ya tomaste las 4 clases de tu pago del 1 de octubre.",
    );
    expect(balanceLineOf([], CLASSES_NOW)).toBeNull();
    expect(mapStudentBalance([], context)).toBeNull();
  });

  it("counts across the open payments, leaves a spent one out, and never carries an amount", () => {
    const spent = payment({ id: "p0", taken: 4, scheduled: 0, toSchedule: 0 });
    const view = mapStudentBalance(
      [spent, payment(), payment({ id: "p2", taken: 0, scheduled: 0, toSchedule: 2 })],
      context,
    );
    expect(view).toMatchObject({ left: 5, taken: 1, scheduled: 2, toSchedule: 3, whatsappHref: WHATSAPP });
    expect(JSON.stringify(view)).not.toMatch(/\$|amount|MXN/);
    expect(mapStudentBalance([spent], context)).toMatchObject({ left: 0, taken: 4 });
  });

  it("gives one row per class bought without a date", () => {
    expect(mapUnscheduled([payment({ toSchedule: 2 })], CLASSES_NOW)).toEqual([
      { paymentId: PAYMENT.id, label: "de tu pago del 1 de octubre" },
      { paymentId: PAYMENT.id, label: "de tu pago del 1 de octubre" },
    ]);
  });
});

describe("groupPastByMonth", () => {
  const past = (id: string, date: string, attended = true) =>
    mapClassCard(
      source({
        id,
        scheduledAt: cdmx(date, "12:00"),
        endsAt: cdmx(date, "13:00"),
        statusCode: CLASS_STATUS.COMPLETED,
        seat: seat({ attended }),
      }),
      context,
    );
  const spent: StudentPaymentCount = {
    id: "pay-sep-3",
    paidOn: new Date("2026-09-03T00:00:00.000Z"),
    classCount: 4,
    taken: 4,
    scheduled: 0,
    toSchedule: 0,
  };

  it("splits by month, newest first, and folds a month that is one spent payment", () => {
    const months = groupPastByMonth(
      [
        { card: past("o1", "2026-10-07"), payment: { ...PAYMENT, taken: 1, scheduled: 2, toSchedule: 1 } },
        { card: past("s4", "2026-09-28"), payment: spent },
        { card: past("s3", "2026-09-21"), payment: spent },
        { card: past("s2", "2026-09-14"), payment: spent },
        { card: past("s1", "2026-09-07"), payment: spent },
      ],
      context,
    );
    expect(months.map((month) => [month.key, month.label, month.cards.length, month.foldedLabel])).toEqual([
      ["2026-10", "Octubre 2026", 1, null],
      ["2026-09", "Septiembre 2026", 4, "Las cuatro clases de tu pago del 3 de septiembre."],
    ]);
  });

  it("does not fold a month with a no-show, a free class or a payment still open", () => {
    const open = { ...spent, taken: 3, scheduled: 1 };
    expect(
      groupPastByMonth([{ card: past("a", "2026-09-07", false), payment: spent }], context)[0]?.foldedLabel,
    ).toBeNull();
    expect(
      groupPastByMonth(
        [
          { card: past("a", "2026-09-07"), payment: spent },
          { card: past("b", "2026-09-14"), payment: null },
        ],
        context,
      )[0]?.foldedLabel,
    ).toBeNull();
    expect(
      groupPastByMonth(
        [
          { card: past("a", "2026-09-07"), payment: open },
          { card: past("b", "2026-09-14"), payment: open },
          { card: past("c", "2026-09-21"), payment: open },
        ],
        context,
      )[0]?.foldedLabel,
    ).toBeNull();
  });
});
