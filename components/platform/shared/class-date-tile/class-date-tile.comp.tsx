import { classDayParts } from "@/lib/format-class-when";
import "./class-date-tile.comp.css";

interface ClassDateTileProps {
  startIso: string;
  timeZone: string;
  /** Today's tile carries the accent's border. */
  isToday: boolean;
  /** 64px wide by default; `sm` is the 44 × 52 of a row. */
  size?: "md" | "sm";
}

/**
 * The date of a class as a tile: the weekday, the day in large figures and
 * the month, in the reader's zone, as a calendar page. Today's wears the
 * accent's border. Decorative beside a `ClassWhen` that says the same in
 * words, so it is hidden from assistive technology.
 */
export function ClassDateTile({ startIso, timeZone, isToday, size = "md" }: ClassDateTileProps) {
  const parts = classDayParts(new Date(startIso), timeZone);
  const classes = [
    "class-date-tile",
    size === "sm" ? "class-date-tile_size_sm" : "",
    isToday ? "class-date-tile_state_today" : "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <span className={classes} aria-hidden="true">
      <span className="class-date-tile__weekday">{parts.weekday}</span>
      <span className="class-date-tile__day">{parts.day}</span>
      <span className="class-date-tile__month">{parts.month}</span>
    </span>
  );
}
