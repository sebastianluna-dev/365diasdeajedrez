import { formatClassWhen } from "@/lib/format-class-when";

interface ClassWhenProps {
  startIso: string;
  durationMin: number;
  /** The zone the reader reads in: the academy's for the staff and the student, the teacher's own for them. */
  timeZone: string;
  /** The instant the page was read, for «Hoy», «Mañana» and «Ayer». */
  nowIso: string;
  /** Append the zone's name: «(hora de Ciudad de México)». */
  withZone?: boolean;
}

/**
 * When a class is, the one way: «mié 14 oct · 12:00–13:00», «Hoy · …»,
 * «Mañana · …», the year only when it differs (`formatClassWhen`). A `<time>`
 * with the instant, so the words and the machine-readable value never part.
 */
export function ClassWhen({ startIso, durationMin, timeZone, nowIso, withZone = false }: ClassWhenProps) {
  return (
    <time dateTime={startIso}>
      {formatClassWhen({ start: new Date(startIso), durationMin, timeZone, now: new Date(nowIso), withZone })}
    </time>
  );
}
