import { STUDY_DAY_TIMEZONE } from "./timezones.const";
import { formatClassDay, formatClassHours } from "@/lib/format-class-when";

// The copy of the classes' forms and notices, apart from the staff's and the
// teacher's message maps: what a popup says under a field when the server
// refuses it (`CLASS_FIELD_ERRORS`), and what the page says once an action
// went well (`CLASS_NOTICES`), read from `?aviso=<code>[.arg…]`.
//
// A notice's arguments are numbers or ids, never a name (D10): the page
// composes the text with its own data where a name is needed, and the map
// gives null for those codes. Pure module, no "server-only".

/** Pluralises «clase» with its count. */
const classes = (count: number) => `${count} ${count === 1 ? "clase" : "clases"}`;

/** «mié 21 oct · 12:00–13:00» from the minutes since the epoch and the duration, in the academy's zone. */
function whenOf(startMinutes: number, durationMin: number): string {
  const start = new Date(startMinutes * 60 * 1000);
  return `${formatClassDay(start, STUDY_DAY_TIMEZONE, start)} · ${formatClassHours(start, durationMin, STUDY_DAY_TIMEZONE)}`;
}

/**
 * What each notice says, from its arguments; `null` when the page composes
 * it with its own data (a name, a title). The arguments arrive as strings
 * and are read here.
 */
export const CLASS_NOTICES = {
  paymentRegistered: ([total = "0", dated = "0", later = "0"]: string[]) => {
    const all = Number(total);
    const withDate = Number(dated);
    const toSchedule = Number(later);
    if (toSchedule === 0) return `Pago registrado: ${classes(all)}, ${all === 1 ? "con fecha" : "todas con fecha"}.`;
    if (withDate === 0) return `Pago registrado: ${classes(all)} por programar.`;
    return `Pago registrado: ${classes(all)}, ${withDate} con fecha y ${toSchedule} por programar.`;
  },
  paymentUpdated: () => "Pago guardado.",
  paymentDeleted: ([unpaid = "0"]: string[]) => {
    const seats = Number(unpaid);
    if (seats === 0) return "Pago eliminado.";
    return `Pago eliminado. ${classes(seats)} ${seats === 1 ? "quedó" : "quedaron"} «Sin pago».`;
  },
  seatScheduled: ([start = "0", duration = "60"]: string[]) =>
    `Clase programada: ${whenOf(Number(start), Number(duration))}.`,
  classCreated: () => null,
  classRescheduled: () => null,
  teacherChanged: () => null,
  meetingAdded: () => null,
  meetingChanged: () => null,
  participantsAdded: ([count = "1"]: string[]) =>
    Number(count) === 1 ? "Alumno agregado." : `${count} alumnos agregados.`,
  participantRemoved: () => "Alumno quitado de la clase.",
  classCancelled: ([returned = "0"]: string[]) => {
    const seats = Number(returned);
    if (seats === 0) return "Clase cancelada.";
    if (seats === 1) return "Clase cancelada. 1 clase volvió a su pago.";
    return `Clase cancelada. ${seats} clases volvieron a sus pagos.`;
  },
  attendanceChanged: () => null,
  seatRescheduled: ([start = "0", duration = "60"]: string[]) =>
    `Clase reprogramada al ${whenOf(Number(start), Number(duration))}: no gasta otra.`,
  seatReturned: () => "La clase volvió a su pago, por programar.",
  classFinalized: () => null,
  topicSaved: () => "Tema guardado.",
  blockAdded: () => "Bloque agregado.",
  blockSaved: () => "Bloque guardado.",
  blockDeleted: () => "Bloque eliminado.",
  afterNotesSaved: () => "Resumen y grabación guardados.",
  gameSaved: () => null,
} as const satisfies Record<string, (args: string[]) => string | null>;

export type ClassNoticeCode = keyof typeof CLASS_NOTICES;

export interface ClassNotice {
  code: ClassNoticeCode;
  args: string[];
  /** The text the map gives, or null for a notice the page composes. */
  text: string | null;
}

const NOTICE_ARG = /^(?:\d+|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|[A-Za-z0-9]{8})$/;

/**
 * The notice in a `?aviso=` value, or null for anything that could not have
 * been written by `withNoticeParam`: anybody can type a parameter.
 */
export function readNotice(raw: string | string[] | undefined): ClassNotice | null {
  if (typeof raw !== "string" || raw.length === 0) return null;
  const [code = "", ...args] = raw.split(".");
  if (!Object.hasOwn(CLASS_NOTICES, code)) return null;
  if (!args.every((arg) => NOTICE_ARG.test(arg))) return null;
  const notice = code as ClassNoticeCode;
  return { code: notice, args, text: CLASS_NOTICES[notice](args) };
}

/**
 * What a field of a classes' form says when the server refuses it, by the
 * code the action returns (`PopupFormState.fieldErrors`) or redirects with
 * (`?error=`). The writers' codes are here too, in the words of the screen.
 */
export const CLASS_FIELD_ERRORS: Record<string, string> = {
  invalid: "Revisa los datos: falta algún campo obligatorio o tiene un formato incorrecto.",
  throttled: "Demasiados intentos. Espera un minuto.",
  reasonRequired: "Escribe el motivo del cambio.",
  attendanceRequired: "Elige «Asistió» o «Faltó».",
  seatMoved: "La plaza ya se reprogramó: su asistencia no se cambia.",
  markLocked: "Administración ya cambió esta marca.",
  notStarted: "La clase no ha empezado.",
  classCancelled: "La clase está cancelada.",
  classClosed: "La clase ya está finalizada o cancelada.",
  missingMark: "Falta marcar a algún alumno.",
  meetingOpensLate: "El enlace se abriría después de empezar la clase.",
  studentInClass: "Ese alumno ya está en la clase.",
  classFull: "La clase no admite más alumnos.",
  seatsExhausted: "Ese pago ya no tiene clases por programar.",
  noPaidSeats: "El alumno no tiene clases pagadas por programar.",
  paymentNotStudents: "Ese pago no es de este alumno.",
  seatIsFree: "Esa plaza es gratis: no se paga.",
  seatAlreadyPaid: "Esa plaza ya tiene pago.",
  notInClass: "Ese alumno no está en la clase.",
  seatNotMovable: "Sólo se reprograma la plaza de quien faltó a una clase finalizada.",
  groupTitle: "Una clase grupal necesita tema.",
  capacity: "La capacidad de una grupal va de 2 a 12.",
  amount: "Escribe el importe cobrado.",
  classCount: "Elige cuántas clases cubre el pago.",
  tooManySeats: "Hay más clases con fecha y cubiertas que las que paga.",
  classCountBelowSeats: "El pago no puede cubrir menos clases de las que ya tiene con fecha o tomadas.",
  paidOnFuture: "La fecha del pago no puede ser futura.",
};
