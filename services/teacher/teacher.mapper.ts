import type { ClassAgendaDay } from "@/components/platform/shared/class-agenda/class-agenda.comp";
import type { ClassRowData } from "@/components/platform/shared/class-row/class-row.types";
import { formatAgendaDay } from "@/lib/format-class-when";
import { dayKeyIn } from "@/lib/timezone";

// Pure: the week's rows by day in the teacher's zone, the one shape the
// dashboard composes on its own (the rows themselves are the classes mapper's).

/** The rows by day, in the zone, only the days with any; today first and named. */
export function groupTeacherWeek(rows: ClassRowData[], timeZone: string, now: Date): ClassAgendaDay[] {
  const todayKey = dayKeyIn(now, timeZone);
  const days = new Map<string, ClassRowData[]>();
  for (const row of rows) {
    const key = dayKeyIn(new Date(row.startIso), timeZone);
    days.set(key, [...(days.get(key) ?? []), row]);
  }
  return [...days.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, dayRows]) => ({
      key,
      label: formatAgendaDay(key, todayKey),
      isToday: key === todayKey,
      rows: dayRows.sort((left, right) => left.startIso.localeCompare(right.startIso)),
    }));
}

/** «Hola, GM Profesor Demo. Hoy tienes 3 clases.» */
export function teacherGreeting(displayName: string, todayCount: number): string {
  const classes = todayCount === 0 ? "no tienes clases" : `tienes ${todayCount} clase${todayCount === 1 ? "" : "s"}`;
  return `Hola, ${displayName}. Hoy ${classes}.`;
}
