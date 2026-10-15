import { CLASS_PHASE, type ClassPhaseCode } from "@/constants/platform/class-codes.const";
import type { MeetingJoinData } from "@/components/platform/shared/meeting-join-card/meeting-join-card.types";
import type { ClassCardData, ClassDetailView, StudentBalanceView } from "@/services/classes/classes.types";
import { CLASSES_NOW, CLASSES_TIME_ZONE, cdmx } from "./classes";

// The student's classes as the mappers hand them to the screens, fixed to
// the example day (Wednesday 14 October 2026, 11:40 in Mexico City): for the
// stories of the cards and the class pages, and for the overview. Never read
// by the app.

export const STUDENT_WHATSAPP = "https://wa.me/522291348338?text=Hola%2C%20soy%20Alumno%20Demo.";

const ZOOM = "https://zoom.us/j/11111111111";

/** Today's class at noon, its link open since 11:30. */
export function studentJoin(extra: Partial<MeetingJoinData> = {}): MeetingJoinData {
  return {
    phase: CLASS_PHASE.OPEN,
    meetingUrl: ZOOM,
    hasLink: true,
    providerLabel: "Zoom",
    startIso: cdmx("2026-10-14", "12:00").toISOString(),
    endIso: cdmx("2026-10-14", "13:00").toISOString(),
    visibleFromIso: cdmx("2026-10-14", "11:30").toISOString(),
    untilIso: cdmx("2026-10-14", "13:30").toISOString(),
    nowIso: CLASSES_NOW.toISOString(),
    timeZone: CLASSES_TIME_ZONE,
    whatsappHref: STUDENT_WHATSAPP,
    ...extra,
  };
}

export function studentCard(extra: Partial<ClassCardData> = {}): ClassCardData {
  const join = extra.join === undefined ? studentJoin() : extra.join;
  return {
    id: "c2",
    href: "/clases/c2",
    title: "Repaso de la Najdorf: tus dudas",
    phase: join?.phase ?? CLASS_PHASE.OPEN,
    startIso: join?.startIso ?? cdmx("2026-10-14", "12:00").toISOString(),
    durationMin: 60,
    timeZone: CLASSES_TIME_ZONE,
    nowIso: CLASSES_NOW.toISOString(),
    people: "con GM Profesor Demo",
    visibleBlocks: 2,
    join,
    past: null,
    moved: null,
    makeUpLabel: null,
    cancelled: false,
    ...extra,
  };
}

/** A class at another hour of the example week, with its join data moved along. */
export function studentCardAt(
  date: string,
  time: string,
  durationMin: number,
  phase: ClassPhaseCode,
  extra: Partial<ClassCardData> = {},
): ClassCardData {
  const start = cdmx(date, time);
  const end = new Date(start.getTime() + durationMin * 60_000);
  const hasLink = extra.join !== null;
  return studentCard({
    phase,
    startIso: start.toISOString(),
    durationMin,
    join:
      extra.join === null
        ? null
        : studentJoin({
            phase,
            startIso: start.toISOString(),
            endIso: end.toISOString(),
            visibleFromIso: hasLink ? new Date(start.getTime() - 30 * 60_000).toISOString() : null,
            untilIso: hasLink ? new Date(end.getTime() + 30 * 60_000).toISOString() : null,
            meetingUrl: phase === CLASS_PHASE.OPEN || phase === CLASS_PHASE.IN_PROGRESS ? ZOOM : null,
          }),
    ...extra,
  });
}

/** Saturday's workshop, with the classmates. */
export const STUDENT_GROUP_CARD = studentCardAt("2026-10-17", "10:00", 90, CLASS_PHASE.UPCOMING, {
  id: "c5",
  href: "/clases/c5",
  title: "Taller de finales de torre",
  people: "con GM Profesor Demo · Grupal, con Mateo Ríos, Diego Salas y Lucía Herrera",
  visibleBlocks: 1,
});

/** Last week's class, attended, with its recording. */
export const STUDENT_PAST_CARD = studentCardAt("2026-10-07", "12:00", 60, CLASS_PHASE.DONE, {
  id: "c1",
  href: "/clases/c1",
  title: "Ataques al rey en el centro",
  visibleBlocks: 4,
  past: { attended: true, hasRecording: true },
});

export const STUDENT_BALANCE: StudentBalanceView = {
  left: 3,
  taken: 1,
  scheduled: 2,
  toSchedule: 1,
  line: "Te quedan 3 clases de tu pago del 1 de octubre: 2 programadas y 1 por programar.",
  whatsappHref: STUDENT_WHATSAPP,
};

export function studentDetail(extra: Partial<ClassDetailView> = {}): ClassDetailView {
  const join = extra.join ?? studentJoin();
  return {
    id: "c2",
    title: "Repaso de la Najdorf: tus dudas",
    view: "ahead",
    phase: join.phase,
    description: "Sesión de preguntas sobre el capítulo 2 del curso de la Siciliana.",
    teacherName: "GM Profesor Demo",
    startIso: join.startIso,
    endIso: join.endIso,
    durationMin: 60,
    timeZone: CLASSES_TIME_ZONE,
    nowIso: join.nowIso,
    people: "con GM Profesor Demo",
    classmates: [],
    join,
    coverage: "Clase 2 de 4 de tu pago del 1 de octubre · Individual",
    attended: null,
    moved: null,
    makeUp: null,
    rescheduled: null,
    cancelled: null,
    summary: null,
    recordingUrl: null,
    blocks: [],
    transcript: null,
    balanceLine: STUDENT_BALANCE.line,
    whatsappHref: STUDENT_WHATSAPP,
    href: "/clases/c2",
    ...extra,
  };
}
