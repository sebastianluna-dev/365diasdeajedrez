import type { ClassHistoryEntry } from "@/services/shared/class-history";
import "./class-history.comp.css";

interface ClassHistoryProps {
  entries: ClassHistoryEntry[];
}

/** What happened to a class, in order: «lun 12 oct, 18:05 · Staff Demo creó la clase». */
export function ClassHistory({ entries }: ClassHistoryProps) {
  if (entries.length === 0) return <p className="class-history__empty">Sin historial.</p>;
  return (
    <ol className="class-history">
      {entries.map((entry, index) => (
        <li key={`${entry.atIso}:${index}`} className="class-history__entry">
          <time dateTime={entry.atIso} className="class-history__stamp">
            {entry.stamp}
          </time>
          <span className="class-history__text">{entry.text}</span>
        </li>
      ))}
    </ol>
  );
}
