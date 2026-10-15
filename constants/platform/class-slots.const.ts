// The durations a class is offered in and the times a class can start at,
// shared by every form that dates a class (register a payment, create a
// class, reschedule it, schedule a paid seat).

/** Minutes. A class created before these existed keeps its own (`durationOptions`). */
export const CLASS_DURATIONS = [30, 45, 60, 90, 120] as const;

/** The starting times, "HH:MM", every quarter of an hour over the whole day. */
export function classTimeOptions(): string[] {
  const options: string[] = [];
  for (let hour = 0; hour < 24; hour += 1) {
    for (const minute of [0, 15, 30, 45]) {
      options.push(`${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`);
    }
  }
  return options;
}
