import {
  CLASS_BLOCK_KIND,
  CLASS_BLOCK_VISIBILITY,
  CLASS_FORMAT,
  CLASS_STATUS,
  type ClassBlockVisibilityCode,
  type ClassFormatCode,
  type ClassStatusCode,
} from "../constants/platform/class-codes.const";
import { CURRENCY } from "../constants/platform/currency-codes.const";
import { DEMO_CLASSMATE_EMAILS } from "../constants/platform/demo-user.const";
import { STUDY_DAY_TIMEZONE } from "../constants/platform/timezones.const";
import { mainlinePath } from "../lib/chess/exercise-derivation";
import type { PrismaClient } from "../lib/platform-db/generated/client";
import { dayRangeIn } from "../lib/timezone";
import { slotInstant } from "../services/shared/class-schedule-rules";
import {
  classMeetingColumns,
  classScheduleColumns,
  meetingProviderIds,
} from "../services/shared/class-schedule.service";
import { moveClassSeat, syncClassSeat, type SeatCoverage } from "../services/shared/class-seats.service";
import { IDS } from "./seed-data";

// The classes demo: five classmates beside the demo student, five payments,
// twenty classes — one in every phase at 11:40 of the reference day, a group
// class, a free one, a no-show moved to a new date, a mark the staff changed
// after a report — so the staff's agenda, the teacher's day and the student's
// balance have something to show on the day of a demo.
//
// Everything hangs from the reference day D: the date in Mexico City of the
// seed's instant (`seedReferenceDate`, 18:00 UTC = 12:00 in Mexico City, or
// `SEED_NOW`). At 11:40 of D the specification's example is on screen: the
// Najdorf with its link open. Each class is placed with `slotInstant` at a
// wall-clock hour of the academy, so the hours read the same whatever the
// machine.
//
// The seed is the one documented exception to the single writers (docs/ →
// Platform → Data model): the facts — the class, its status, who closed or
// cancelled it, the marks and their log, the payments — are written as data by
// fixed id, so a re-seed moves the dates without recording a «reschedule»; the
// derived columns come from the same pure functions the writers spread; and
// the seats go through `syncClassSeat` and `moveClassSeat`, so the payment's
// invariant holds for the demo too and re-seeding is idempotent.

const ZOOM = (room: string) => `https://zoom.us/j/${room}`;
const MINUTE_MS = 60 * 1000;

/** The classmates: ordinary accounts with the demo password, like the demo student. */
export const DEMO_CLASSMATES = [
  { id: IDS.valentinaUser, email: DEMO_CLASSMATE_EMAILS.valentina, displayName: "Valentina Cruz" },
  { id: IDS.mateoUser, email: DEMO_CLASSMATE_EMAILS.mateo, displayName: "Mateo Ríos" },
  { id: IDS.diegoUser, email: DEMO_CLASSMATE_EMAILS.diego, displayName: "Diego Salas" },
  { id: IDS.luciaUser, email: DEMO_CLASSMATE_EMAILS.lucia, displayName: "Lucía Herrera" },
  { id: IDS.andreaUser, email: DEMO_CLASSMATE_EMAILS.andrea, displayName: "Andrea López" },
] as const;

/** Who studies with the demo teacher: everyone but Lucía, who is in the group class without a teacher of her own. */
export const CLASSMATE_ASSIGNMENTS = [
  { id: "a2000000-0000-4000-8000-000000000001", studentId: IDS.valentinaUser },
  { id: "a2000000-0000-4000-8000-000000000002", studentId: IDS.mateoUser },
  { id: "a2000000-0000-4000-8000-000000000003", studentId: IDS.diegoUser },
  { id: "a2000000-0000-4000-8000-000000000004", studentId: IDS.andreaUser },
] as const;

/** The reference day D as a `yyyy-mm-dd` in the academy's zone, and the days around it. */
export function referenceDayKey(now: Date): string {
  return dayRangeIn(now, STUDY_DAY_TIMEZONE).key;
}

function dayPlus(key: string, days: number): string {
  return new Date(Date.parse(`${key}T00:00:00.000Z`) + days * 24 * 60 * MINUTE_MS).toISOString().slice(0, 10);
}

export interface SeedPayment {
  id: string;
  studentId: string;
  amount: string;
  currency: string;
  /** Days before D. */
  daysAgo: number;
  classCount: number;
  reference: string | null;
}

export function buildClassPayments(now: Date): (SeedPayment & { paidOn: Date })[] {
  const day = referenceDayKey(now);
  const payments: SeedPayment[] = [
    {
      id: IDS.paymentDemoOld,
      studentId: IDS.demoUser,
      amount: "1400.00",
      currency: CURRENCY.MXN,
      daysAgo: 41,
      classCount: 4,
      reference: null,
    },
    {
      id: IDS.paymentDemo,
      studentId: IDS.demoUser,
      amount: "1400.00",
      currency: CURRENCY.MXN,
      daysAgo: 13,
      classCount: 4,
      reference: "Transferencia 8841",
    },
    {
      id: IDS.paymentValentina,
      studentId: IDS.valentinaUser,
      amount: "1400.00",
      currency: CURRENCY.MXN,
      daysAgo: 29,
      classCount: 4,
      reference: null,
    },
    {
      id: IDS.paymentDiego,
      studentId: IDS.diegoUser,
      amount: "1400.00",
      currency: CURRENCY.MXN,
      daysAgo: 9,
      classCount: 4,
      reference: null,
    },
    {
      id: IDS.paymentMateo,
      studentId: IDS.mateoUser,
      amount: "700.00",
      currency: CURRENCY.MXN,
      daysAgo: 2,
      classCount: 2,
      reference: null,
    },
  ];
  // `paidOn` is a date column: the day, at midnight UTC, as Prisma writes a @db.Date.
  return payments.map((payment) => ({
    ...payment,
    paidOn: new Date(`${dayPlus(day, -payment.daysAgo)}T00:00:00.000Z`),
  }));
}

/** A mark written by the teacher or the staff, in the order they happened. */
export interface SeedAttendanceChange {
  id: string;
  /** Who wrote it: the teacher's or the staff's user. */
  byUserId: string;
  fromAttended: boolean | null;
  toAttended: boolean;
  reason: string | null;
  isOverride: boolean;
  /** Minutes after the class ended. */
  minutesAfterEnd: number;
}

export interface SeedSeat {
  studentId: string;
  coverage: SeatCoverage;
  /** The mark as the class stands today; null is «Sin pasar lista». */
  attended: boolean | null;
  changes: SeedAttendanceChange[];
  /** A no-show's seat the staff gave another date: the class it went to, and the note. */
  movedTo?: { classId: string; note: string; minutesAfterEnd: number };
}

export interface SeedClass {
  id: string;
  title: string | null;
  description: string | null;
  format: ClassFormatCode;
  capacity: number | null;
  /** Days after D (negative: before). */
  day: number;
  time: string;
  durationMin: number;
  status: ClassStatusCode;
  meetingUrl: string | null;
  recordingUrl: string | null;
  summary: string | null;
  /** Only with CANCELLED. */
  cancel: { reason: string; note: string | null } | null;
  seats: SeedSeat[];
}

let changeCounter = 0;
function changeId(): string {
  changeCounter += 1;
  return `b3000000-0000-4000-8000-${String(changeCounter).padStart(12, "0")}`;
}

function markedBy(byUserId: string, attended: boolean, minutesAfterEnd = 5): SeedAttendanceChange {
  return {
    id: changeId(),
    byUserId,
    fromAttended: null,
    toAttended: attended,
    reason: null,
    isOverride: false,
    minutesAfterEnd,
  };
}

function attendedSeat(studentId: string, coverage: SeatCoverage): SeedSeat {
  return { studentId, coverage, attended: true, changes: [markedBy(IDS.teacherUser, true)] };
}

function openSeat(studentId: string, coverage: SeatCoverage): SeedSeat {
  return { studentId, coverage, attended: null, changes: [] };
}

const paid = (paymentId: string): SeatCoverage => ({ paymentId });

/** The twenty classes of the demo, in the order of the story. The change ids are fixed by position. */
export function buildClasses(): SeedClass[] {
  changeCounter = 0;
  const done = (
    id: string,
    title: string | null,
    day: number,
    time: string,
    seats: SeedSeat[],
    extra: Partial<SeedClass> = {},
  ): SeedClass => ({
    id,
    title,
    description: null,
    format: CLASS_FORMAT.INDIVIDUAL,
    capacity: null,
    day,
    time,
    durationMin: 60,
    status: CLASS_STATUS.COMPLETED,
    meetingUrl: null,
    recordingUrl: null,
    summary: null,
    cancel: null,
    seats,
    ...extra,
  });
  const scheduled = (
    id: string,
    title: string | null,
    day: number,
    time: string,
    seats: SeedSeat[],
    extra: Partial<SeedClass> = {},
  ): SeedClass => done(id, title, day, time, seats, { status: CLASS_STATUS.SCHEDULED, ...extra });

  return [
    // 1. A week ago: the class every student view uses as its example of a finished
    // class. The teacher marked «Faltó»; the staff changed it the next morning.
    done(
      IDS.classPast,
      "Ataques al rey en el centro",
      -7,
      "12:00",
      [
        {
          studentId: IDS.demoUser,
          coverage: paid(IDS.paymentDemo),
          attended: true,
          changes: [
            markedBy(IDS.teacherUser, false),
            {
              id: changeId(),
              byUserId: IDS.staffUser,
              fromAttended: false,
              toAttended: true,
              reason: "Estuvo conectado; se le cayó el audio.",
              isOverride: true,
              minutesAfterEnd: 21 * 60 + 5,
            },
          ],
        },
      ],
      {
        description:
          "Clase práctica sobre cómo castigar al rey sin enrocar, con la Partida de la Ópera como hilo conductor.",
        meetingUrl: ZOOM("00000000000"),
        recordingUrl: "https://zoom.us/rec/demo-ataques-al-rey",
        summary:
          "Vimos los tres errores típicos que dejan al rey en el centro y la técnica de Morphy para explotarlos: desarrollo con amenaza, apertura de columnas y sacrificio de calidad en d7.",
      },
    ),
    // 2. Today at noon: «Enlace abierto» at 11:40, «En vivo» from 12:00.
    scheduled(
      IDS.classUpcoming,
      "Repaso de la Najdorf: tus dudas",
      0,
      "12:00",
      [openSeat(IDS.demoUser, paid(IDS.paymentDemo))],
      {
        description: "Sesión de preguntas sobre el capítulo 2 del curso de la Siciliana.",
        meetingUrl: ZOOM("11111111111"),
      },
    ),
    // 3. Today, without a link: the «Sin enlace» queue.
    scheduled(IDS.classMateoToday, "Plan de aperturas con blancas", 0, "17:00", [
      openSeat(IDS.mateoUser, paid(IDS.paymentMateo)),
    ]),
    // 4. Today, without a topic: «Clase de Valentina Cruz», her last paid class.
    scheduled(IDS.classValentinaToday, null, 0, "19:00", [openSeat(IDS.valentinaUser, paid(IDS.paymentValentina))], {
      meetingUrl: ZOOM("33333333333"),
    }),
    // 5. The group class, in three days: four of six seats, one without a payment.
    scheduled(
      IDS.classGroup,
      "Taller de finales de torre",
      3,
      "10:00",
      [
        openSeat(IDS.demoUser, paid(IDS.paymentDemo)),
        openSeat(IDS.mateoUser, paid(IDS.paymentMateo)),
        openSeat(IDS.diegoUser, paid(IDS.paymentDiego)),
        openSeat(IDS.luciaUser, "unpaid"),
      ],
      { format: CLASS_FORMAT.GROUP, capacity: 6, durationMin: 90, meetingUrl: ZOOM("22222222222") },
    ),
    // 6. Ended two days ago and never finalized: «Por finalizar».
    scheduled(IDS.classAwaitingClose, "Defensa Caro-Kann: ideas", -2, "17:00", [
      openSeat(IDS.diegoUser, paid(IDS.paymentDiego)),
    ]),
    // 7. Cancelled by the staff: the seat went back to Diego's payment.
    scheduled(
      IDS.classCancelled,
      "Táctica de la semana",
      -5,
      "18:00",
      [openSeat(IDS.diegoUser, paid(IDS.paymentDiego))],
      {
        status: CLASS_STATUS.CANCELLED,
        cancel: { reason: "El alumno pidió moverla por un examen.", note: "Te escribiremos para fijar otra fecha." },
      },
    ),
    // 8. A free diagnosis, in two days.
    scheduled(IDS.classFreeDiagnosis, "Clase de diagnóstico", 2, "18:00", [openSeat(IDS.andreaUser, "free")]),
    // 9. Diego missed it: the case for changing a mark or moving the seat.
    done(IDS.classDiegoMissed, "Finales de peones", -9, "17:00", [
      {
        studentId: IDS.diegoUser,
        coverage: paid(IDS.paymentDiego),
        attended: false,
        changes: [markedBy(IDS.teacherUser, false)],
      },
    ]),
    // 10.
    done(IDS.classDiegoPlans, "Medio juego: planes", -6, "17:00", [
      attendedSeat(IDS.diegoUser, paid(IDS.paymentDiego)),
    ]),
    // 11. Valentina missed it and the staff gave her seat another date (12).
    done(IDS.classValentinaMissed, "Estructuras de peones", -12, "19:00", [
      {
        studentId: IDS.valentinaUser,
        coverage: paid(IDS.paymentValentina),
        attended: false,
        changes: [markedBy(IDS.teacherUser, false)],
        movedTo: { classId: IDS.classValentinaMovedTo, note: "Te la reponemos el viernes.", minutesAfterEnd: 14 * 60 },
      },
    ]),
    // 12. Where the seat went: its row is created by the move, and marked here.
    done(IDS.classValentinaMovedTo, null, -5, "19:00", [attendedSeat(IDS.valentinaUser, paid(IDS.paymentValentina))]),
    // 13–14.
    done(IDS.classValentina1, "Aperturas abiertas", -28, "19:00", [
      attendedSeat(IDS.valentinaUser, paid(IDS.paymentValentina)),
    ]),
    done(IDS.classValentina2, "El medio juego", -21, "19:00", [
      attendedSeat(IDS.valentinaUser, paid(IDS.paymentValentina)),
    ]),
    // 15–18: the demo student's previous payment, spent.
    done(IDS.classDemo1, "La Siciliana: ideas", -40, "12:00", [attendedSeat(IDS.demoUser, paid(IDS.paymentDemoOld))]),
    done(IDS.classDemo2, "Estructuras de la Siciliana", -33, "12:00", [
      attendedSeat(IDS.demoUser, paid(IDS.paymentDemoOld)),
    ]),
    done(IDS.classDemo3, "Tácticas en la apertura", -26, "12:00", [
      attendedSeat(IDS.demoUser, paid(IDS.paymentDemoOld)),
    ]),
    done(IDS.classDemo4, "Finales elementales", -19, "12:00", [attendedSeat(IDS.demoUser, paid(IDS.paymentDemoOld))]),
    // 19–20: two free classes long ago, where the old attendance activities point.
    done(IDS.classDemoReview, "Repaso de aperturas", -60, "12:00", [attendedSeat(IDS.demoUser, "free")]),
    done(IDS.classDemoDiagnosis, "Clase de diagnóstico", -420, "12:00", [attendedSeat(IDS.demoUser, "free")]),
  ];
}

/** The instant a class starts: its day around D, at its wall-clock hour in the academy's zone. */
export function classStartOf(cls: Pick<SeedClass, "day" | "time">, now: Date): Date {
  const instant = slotInstant(dayPlus(referenceDayKey(now), cls.day), cls.time, STUDY_DAY_TIMEZONE);
  if (!instant) throw new Error(`The demo class on day ${cls.day} at ${cls.time} has no instant`);
  return instant;
}

/** The classes with their instants, as the rest of the seed and the tests read them. */
export function buildClassSchedule(now: Date): (SeedClass & { scheduledAt: Date; endsAt: Date })[] {
  return buildClasses().map((cls) => {
    const scheduledAt = classStartOf(cls, now);
    return { ...cls, scheduledAt, endsAt: new Date(scheduledAt.getTime() + cls.durationMin * MINUTE_MS) };
  });
}

interface SeedBlock {
  id: string;
  classId: string;
  order: number;
  kind: string;
  visibility: ClassBlockVisibilityCode;
  text: string | null;
  caption: string | null;
  videoUrl: string | null;
  gameId: string | null;
  lessonId: string | null;
  positionId: string | null;
  movePath: string | null;
}

function block(
  id: string,
  classId: string,
  order: number,
  kind: string,
  visibility: ClassBlockVisibilityCode,
  fields: Partial<Pick<SeedBlock, "text" | "caption" | "videoUrl" | "gameId" | "lessonId" | "positionId" | "movePath">>,
): SeedBlock {
  return {
    id,
    classId,
    order,
    kind,
    visibility,
    text: null,
    caption: null,
    videoUrl: null,
    gameId: null,
    lessonId: null,
    positionId: null,
    movePath: null,
    ...fields,
  };
}

export const CLASS_BLOCKS: SeedBlock[] = [
  block(IDS.blockPastIntro, IDS.classPast, 1, CLASS_BLOCK_KIND.TEXT, CLASS_BLOCK_VISIBILITY.AFTER, {
    text: "## Qué vimos\n\nTres señales de que puedes atacar un rey en el centro:\n\n1. Columnas centrales abiertas o semiabiertas.\n2. Ventaja de desarrollo de dos o más piezas.\n3. El rey enemigo sin posibilidad inmediata de enroque.",
  }),
  block(IDS.blockPastGame, IDS.classPast, 2, CLASS_BLOCK_KIND.GAME_REF, CLASS_BLOCK_VISIBILITY.AFTER, {
    gameId: IDS.gameOpera,
    movePath: mainlinePath(19),
    caption: "La Partida de la Ópera desde 10.Cxb5: la fase decisiva del ataque.",
  }),
  block(IDS.blockPastLesson, IDS.classPast, 3, CLASS_BLOCK_KIND.LESSON_REF, CLASS_BLOCK_VISIBILITY.AFTER, {
    lessonId: IDS.lsBreakD5,
    caption: "Repasa la lección de la ruptura ...d5: el mismo principio de apertura del centro.",
  }),
  block(IDS.blockPastVideo, IDS.classPast, 4, CLASS_BLOCK_KIND.VIDEO, CLASS_BLOCK_VISIBILITY.AFTER, {
    videoUrl: "https://www.youtube.com/watch?v=demo-morphy-opera",
    caption: "Video complementario: Morphy y el desarrollo con amenaza.",
  }),
  // The Najdorf: what to prepare, what comes after, and the teacher's script.
  block(
    "b1000000-0000-4000-8000-000000000005",
    IDS.classUpcoming,
    1,
    CLASS_BLOCK_KIND.TEXT,
    CLASS_BLOCK_VISIBILITY.BEFORE,
    {
      text: "Trae tus dudas del capítulo 2: apunta las posiciones donde no supiste qué plan seguir.",
    },
  ),
  block(
    "b1000000-0000-4000-8000-000000000006",
    IDS.classUpcoming,
    2,
    CLASS_BLOCK_KIND.LESSON_REF,
    CLASS_BLOCK_VISIBILITY.BEFORE,
    {
      lessonId: IDS.lsNajdorfStart,
      caption: "Repasa cómo nace la Najdorf antes de la clase.",
    },
  ),
  block(
    "b1000000-0000-4000-8000-000000000007",
    IDS.classUpcoming,
    3,
    CLASS_BLOCK_KIND.LESSON_REF,
    CLASS_BLOCK_VISIBILITY.AFTER,
    {
      lessonId: IDS.lsPoisonedPawn,
      caption: "Lo que veremos al final: el Peón Envenenado.",
    },
  ),
  block(
    "b1000000-0000-4000-8000-000000000008",
    IDS.classUpcoming,
    4,
    CLASS_BLOCK_KIND.TEXT,
    CLASS_BLOCK_VISIBILITY.TEACHER,
    {
      text: "Preguntas para abrir: ¿por qué 5...a6? ¿Qué pasa si las blancas juegan 6.Ag5 y no 6.Ae3?",
    },
  ),
  // The group class.
  block(
    "b1000000-0000-4000-8000-000000000009",
    IDS.classGroup,
    1,
    CLASS_BLOCK_KIND.LESSON_REF,
    CLASS_BLOCK_VISIBILITY.BEFORE,
    {
      lessonId: IDS.lsLucena,
      caption: "La posición de Lucena: la base del taller.",
    },
  ),
  block(
    "b1000000-0000-4000-8000-00000000000a",
    IDS.classGroup,
    2,
    CLASS_BLOCK_KIND.LESSON_REF,
    CLASS_BLOCK_VISIBILITY.AFTER,
    {
      lessonId: IDS.lsPhilidor,
      caption: "Después del taller: la defensa de Philidor.",
    },
  ),
  block(
    "b1000000-0000-4000-8000-00000000000b",
    IDS.classGroup,
    3,
    CLASS_BLOCK_KIND.TEXT,
    CLASS_BLOCK_VISIBILITY.TEACHER,
    {
      text: "Guion: empezar con Lucena en el tablero mural; cada alumno construye el puente por turnos.",
    },
  ),
];

/** The minimum of the client the seed needs: the real one, outside Next. */
type SeedDb = PrismaClient;

/**
 * Seeds the payments, the classes, their seats and their marks. The catalogs
 * and the accounts are seeded before by `prisma/seed.ts`; the blocks and the
 * transcript after, with the rest of the content.
 */
export async function seedClasses(
  db: SeedDb,
  now: Date,
  ids: { status: Map<string, number>; format: Map<string, number> },
): Promise<void> {
  const statusId = (code: string) => {
    const id = ids.status.get(code);
    if (id === undefined) throw new Error(`ClassStatus not seeded: ${code}`);
    return id;
  };
  const formatId = (code: string) => {
    const id = ids.format.get(code);
    if (id === undefined) throw new Error(`ClassFormat not seeded: ${code}`);
    return id;
  };
  const currencies = new Map(
    (await db.currency.findMany({ select: { id: true, code: true } })).map((row) => [row.code, row.id]),
  );
  const providerIds = await meetingProviderIds(db);

  // --- Payments: facts, by fixed id. A payment of a demo account that is not
  // the seed's is a leftover — the migration of 2026-10-14 made one of each
  // paid seat the old seed wrote — and goes: its seats fall to «Sin pago»
  // (the relation sets null) and are covered again below by the demo's
  // payments, through the writer. Only the demo accounts: nobody else's money
  // is touched.
  const payments = buildClassPayments(now);
  await db.classPayment.deleteMany({
    where: {
      studentId: { in: [IDS.demoUser, ...DEMO_CLASSMATES.map((user) => user.id)] },
      id: { notIn: payments.map((payment) => payment.id) },
    },
  });
  for (const payment of payments) {
    const currencyId = currencies.get(payment.currency);
    if (currencyId === undefined) throw new Error(`Currency not seeded: ${payment.currency}`);
    const data = {
      studentId: payment.studentId,
      amount: payment.amount,
      currencyId,
      paidOn: payment.paidOn,
      classCount: payment.classCount,
      reference: payment.reference,
      note: null,
      recordedById: IDS.staffUser,
    };
    await db.classPayment.upsert({ where: { id: payment.id }, update: data, create: { id: payment.id, ...data } });
  }

  // --- Classes: facts, by fixed id, with the derived columns from the pure functions.
  const classes = buildClassSchedule(now);
  for (const cls of classes) {
    const closed = cls.status === CLASS_STATUS.COMPLETED;
    const marked = cls.seats.some((seat) => seat.changes.length > 0);
    const data = {
      teacherId: IDS.teacher,
      formatId: formatId(cls.format),
      capacity: cls.capacity,
      title: cls.title,
      description: cls.description,
      ...classScheduleColumns(cls.scheduledAt, cls.durationMin),
      statusId: statusId(cls.status),
      ...classMeetingColumns({ meetingUrl: cls.meetingUrl, visibleFromChosen: null }, providerIds),
      recordingUrl: cls.recordingUrl,
      summary: cls.summary,
      createdById: IDS.staffUser,
      closedAt: closed ? new Date(cls.endsAt.getTime() + 5 * MINUTE_MS) : null,
      closedById: closed ? IDS.teacherUser : null,
      cancelledAt: cls.cancel ? new Date(cls.scheduledAt.getTime() - 2 * 24 * 60 * MINUTE_MS) : null,
      cancelledById: cls.cancel ? IDS.staffUser : null,
      cancelReason: cls.cancel?.reason ?? null,
      cancelNote: cls.cancel?.note ?? null,
      attendanceTakenAt: marked ? new Date(cls.endsAt.getTime() + 5 * MINUTE_MS) : null,
    };
    await db.class.upsert({ where: { id: cls.id }, update: data, create: { id: cls.id, ...data } });
  }

  // --- Seats, through their writer, only when missing; a seat the move creates
  // (class 12) is skipped here and marked below.
  const movedIn = new Set(
    classes.flatMap((cls) =>
      cls.seats.flatMap((seat) => (seat.movedTo ? [`${seat.movedTo.classId}:${seat.studentId}`] : [])),
    ),
  );
  for (const cls of classes) {
    for (const seat of cls.seats) {
      if (movedIn.has(`${cls.id}:${seat.studentId}`)) continue;
      const existing = await db.classParticipant.findUnique({
        where: { classId_userId: { classId: cls.id, userId: seat.studentId } },
        select: { paymentId: true, isFree: true },
      });
      // A seat that is there but lost its payment (see above) is covered again.
      const mode = existing
        ? existing.paymentId === null && !existing.isFree && typeof seat.coverage === "object"
          ? "cover"
          : null
        : "add";
      if (mode === null) continue;
      const written = await db.$transaction((tx) =>
        syncClassSeat(tx, {
          classId: cls.id,
          studentId: seat.studentId,
          coverage: seat.coverage,
          addedById: IDS.staffUser,
          mode,
        }),
      );
      if (!written.ok) {
        throw new Error(`The demo cannot seat ${seat.studentId} in ${cls.id} (${mode}): ${written.code}`);
      }
    }
  }

  // --- Marks and their log: facts. The moved seat keeps «Faltó» before it moves.
  for (const cls of classes) {
    for (const seat of cls.seats) {
      if (movedIn.has(`${cls.id}:${seat.studentId}`)) continue;
      await db.classParticipant.update({
        where: { classId_userId: { classId: cls.id, userId: seat.studentId } },
        data: { attended: seat.attended },
      });
      await writeChanges(db, cls, seat);
    }
  }

  // --- The no-show's seat given another date, through its writer, once.
  for (const cls of classes) {
    for (const seat of cls.seats) {
      if (!seat.movedTo) continue;
      const row = await db.classParticipant.findUnique({
        where: { classId_userId: { classId: cls.id, userId: seat.studentId } },
        select: { seatMovedAt: true },
      });
      if (row?.seatMovedAt) continue;
      const moved = await db.$transaction((tx) =>
        moveClassSeat(tx, {
          fromClassId: cls.id,
          studentId: seat.studentId,
          toClassId: seat.movedTo!.classId,
          note: seat.movedTo!.note,
          actorId: IDS.staffUser,
          now: new Date(cls.endsAt.getTime() + seat.movedTo!.minutesAfterEnd * MINUTE_MS),
        }),
      );
      if (!moved.ok) throw new Error(`The demo cannot move ${seat.studentId}'s seat from ${cls.id}: ${moved.code}`);
    }
  }

  // --- The marks of the seats the move created.
  for (const cls of classes) {
    for (const seat of cls.seats) {
      if (!movedIn.has(`${cls.id}:${seat.studentId}`)) continue;
      await db.classParticipant.update({
        where: { classId_userId: { classId: cls.id, userId: seat.studentId } },
        data: { attended: seat.attended },
      });
      await writeChanges(db, cls, seat);
    }
  }
}

async function writeChanges(db: SeedDb, cls: SeedClass & { endsAt: Date }, seat: SeedSeat): Promise<void> {
  for (const change of seat.changes) {
    const data = {
      classId: cls.id,
      userId: seat.studentId,
      fromAttended: change.fromAttended,
      toAttended: change.toAttended,
      reason: change.reason,
      changedById: change.byUserId,
      isOverride: change.isOverride,
      changedAt: new Date(cls.endsAt.getTime() + change.minutesAfterEnd * MINUTE_MS),
    };
    await db.classAttendanceChange.upsert({
      where: { id: change.id },
      update: data,
      create: { id: change.id, ...data },
    });
  }
}
