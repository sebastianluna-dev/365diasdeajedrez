// The sample week of the teachers' landing calendar (the owner's «Calendario
// A»): 19 to 25 October 2026, «now» Wednesday 21 at 18:20 — the same week the
// platform's calendar preview uses. Staff schedules the classes today; the
// teacher sees them, so every sample is one the academy assigned.

export type ClassWeekState = "done" | "close" | "live" | "open" | "up" | "cancel";

export interface ClassWeekDay {
  num: number;
  short: string;
  long: string;
}

export interface ClassWeekClass {
  id: string;
  day: number;
  start: string;
  minutes: number;
  /** Empty: a class without a topic yet. */
  topic: string;
  people: string;
  kind: "individual" | "group";
  state: ClassWeekState;
  noLink: boolean;
}

/** First hour drawn in the grid; each hour is one row. */
export const CLASS_WEEK_START_HOUR = 8;
export const CLASS_WEEK_HOURS = 13;

export const CLASS_WEEK_NOW = { day: 21, minutes: 18 * 60 + 20 } as const;

export const CLASS_WEEK_DAYS: readonly ClassWeekDay[] = [
  { num: 19, short: "Lun", long: "Lunes 19" },
  { num: 20, short: "Mar", long: "Martes 20" },
  { num: 21, short: "Mié", long: "Miércoles 21" },
  { num: 22, short: "Jue", long: "Jueves 22" },
  { num: 23, short: "Vie", long: "Viernes 23" },
  { num: 24, short: "Sáb", long: "Sábado 24" },
  { num: 25, short: "Dom", long: "Domingo 25" },
];

export const CLASS_WEEK_STATE_LABEL: Record<ClassWeekState, string> = {
  done: "Finalizada",
  close: "Por finalizar",
  live: "En vivo",
  open: "Enlace abierto",
  up: "Programada",
  cancel: "Cancelada",
};

/** The class on now, selected when the section opens. */
export const CLASS_WEEK_LIVE: ClassWeekClass = {
  id: "a6",
  day: 21,
  start: "18:00",
  minutes: 60,
  topic: "La defensa de Philidor",
  people: "Grupal · Ana, Diego, Mateo y Sofía",
  kind: "group",
  state: "live",
  noLink: false,
};

export const CLASS_WEEK_CLASSES: readonly ClassWeekClass[] = [
  {
    id: "a1",
    day: 19,
    start: "09:00",
    minutes: 60,
    topic: "Táctica: clavadas",
    people: "Mateo Ríos",
    kind: "individual",
    state: "done",
    noLink: false,
  },
  {
    id: "a2",
    day: 19,
    start: "17:00",
    minutes: 60,
    topic: "Repaso de la Najdorf",
    people: "Diego Salas",
    kind: "individual",
    state: "close",
    noLink: false,
  },
  {
    id: "a3",
    day: 20,
    start: "11:00",
    minutes: 90,
    topic: "Finales de peones",
    people: "Grupal · 6 alumnos",
    kind: "group",
    state: "done",
    noLink: false,
  },
  {
    id: "a4",
    day: 20,
    start: "16:30",
    minutes: 60,
    topic: "Defensa francesa",
    people: "Ana Paredes",
    kind: "individual",
    state: "cancel",
    noLink: false,
  },
  {
    id: "a5",
    day: 21,
    start: "09:30",
    minutes: 60,
    topic: "Planes en el medio juego",
    people: "Lucía Herrera",
    kind: "individual",
    state: "done",
    noLink: false,
  },
  CLASS_WEEK_LIVE,
  {
    id: "a7",
    day: 21,
    start: "19:30",
    minutes: 45,
    topic: "Revisión de partida",
    people: "Mateo Ríos",
    kind: "individual",
    state: "up",
    noLink: false,
  },
  {
    id: "a8",
    day: 22,
    start: "10:00",
    minutes: 60,
    topic: "Táctica: ataques dobles",
    people: "Diego Salas",
    kind: "individual",
    state: "up",
    noLink: false,
  },
  {
    id: "a9",
    day: 22,
    start: "19:00",
    minutes: 60,
    topic: "",
    people: "Ana Paredes",
    kind: "individual",
    state: "up",
    noLink: false,
  },
  {
    id: "a10",
    day: 23,
    start: "08:00",
    minutes: 45,
    topic: "Mate del pasillo",
    people: "Grupal · 3 alumnos",
    kind: "group",
    state: "up",
    noLink: true,
  },
  {
    id: "a11",
    day: 23,
    start: "12:00",
    minutes: 60,
    topic: "Finales de torres",
    people: "Lucía Herrera",
    kind: "individual",
    state: "up",
    noLink: false,
  },
  {
    id: "a12",
    day: 24,
    start: "10:00",
    minutes: 120,
    topic: "Torneo interno: análisis",
    people: "Grupal · 8 alumnos",
    kind: "group",
    state: "up",
    noLink: true,
  },
];
