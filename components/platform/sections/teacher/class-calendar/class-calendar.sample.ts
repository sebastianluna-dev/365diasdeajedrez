import { CLASS_PHASE, type ClassPhaseCode } from "@/constants/platform/class-codes.const";
import { teacherRoutes } from "@/lib/platform-routes";
import type { CalendarClass } from "./class-calendar.comp";

// A teacher's classes around Wednesday 21 October 2026, 18:20 in Mexico City,
// for the calendar's stories and its tile on the overview sheet while the
// calendar reads no classes of its own. Mexico City keeps UTC-6 all year.

export const CALENDAR_SAMPLE_ZONE = "America/Mexico_City";
export const CALENDAR_SAMPLE_NOW = "2026-10-21T18:20:00-06:00";

let next = 0;
function sample(
  day: string,
  time: string,
  durationMin: number,
  title: string,
  people: string,
  phase: ClassPhaseCode,
): CalendarClass {
  next += 1;
  const id = `c${next}`;
  const joinable = phase === CLASS_PHASE.OPEN || phase === CLASS_PHASE.IN_PROGRESS;
  return {
    id,
    href: teacherRoutes.classDetail(id),
    title,
    people,
    phase,
    startIso: `${day}T${time}:00-06:00`,
    durationMin,
    ...(joinable ? { meetingUrl: `https://meet.google.com/abc-defg-h${next}` } : {}),
  };
}

export const CALENDAR_SAMPLE_CLASSES: CalendarClass[] = [
  sample("2026-10-12", "17:00", 60, "Aperturas abiertas", "Diego Salas", CLASS_PHASE.DONE),
  sample("2026-10-14", "18:00", 60, "La posición de Lucena", "Grupal · 4 alumnos", CLASS_PHASE.DONE),
  sample("2026-10-16", "10:00", 45, "Mate del pasillo", "Lucía Herrera", CLASS_PHASE.DONE),
  sample("2026-10-19", "09:00", 60, "Táctica: clavadas", "Mateo Ríos", CLASS_PHASE.DONE),
  sample("2026-10-19", "17:00", 60, "Repaso de la Najdorf", "Diego Salas", CLASS_PHASE.AWAITING_CLOSE),
  sample("2026-10-20", "11:00", 90, "Finales de peones", "Grupal · 6 alumnos", CLASS_PHASE.DONE),
  sample("2026-10-20", "16:30", 60, "Defensa francesa", "Ana Paredes", CLASS_PHASE.CANCELLED),
  sample("2026-10-21", "09:30", 60, "Planes en el medio juego", "Lucía Herrera", CLASS_PHASE.DONE),
  sample("2026-10-21", "18:00", 60, "La defensa de Philidor", "Grupal · 4 alumnos", CLASS_PHASE.IN_PROGRESS),
  sample("2026-10-21", "18:30", 45, "Revisión de partida", "Mateo Ríos", CLASS_PHASE.OPEN),
  sample("2026-10-22", "10:00", 60, "Táctica: ataques dobles", "Diego Salas", CLASS_PHASE.UPCOMING),
  sample("2026-10-22", "19:00", 60, "Gambito de dama", "Ana Paredes", CLASS_PHASE.UPCOMING),
  sample("2026-10-23", "08:00", 45, "Mate del pasillo", "Grupal · 3 alumnos", CLASS_PHASE.UPCOMING),
  sample("2026-10-23", "12:00", 60, "Finales de torres", "Lucía Herrera", CLASS_PHASE.UPCOMING),
  sample("2026-10-24", "10:00", 120, "Torneo interno: análisis", "Grupal · 8 alumnos", CLASS_PHASE.UPCOMING),
  sample("2026-10-27", "18:00", 60, "La posición de Vancura", "Grupal · 4 alumnos", CLASS_PHASE.UPCOMING),
  sample("2026-10-29", "17:00", 60, "Aperturas cerradas", "Diego Salas", CLASS_PHASE.UPCOMING),
  sample("2026-11-03", "18:00", 60, "Finales de alfil", "Grupal · 4 alumnos", CLASS_PHASE.UPCOMING),
];
