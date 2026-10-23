"use client";

import Link from "next/link";
import { CheckIcon } from "@/components/icons/check-icon.comp";
import { EllipsisIcon } from "@/components/icons/ellipsis-icon.comp";
import { EyeIcon } from "@/components/icons/eye-icon.comp";
import { useSolveHistory, type SolveHistoryEntry, type SolveHistoryTone } from "./exercise-solve-history.store";
import "./exercise-session-history.comp.css";

interface ExerciseSessionHistoryProps {
  scope: string;
  /** The exercise on the board: a last pill, ringed, until it is over and recorded. */
  current: { title: string; open: boolean };
}

const TONE_LABEL: Record<SolveHistoryTone, string> = {
  clean: "a la primera",
  late: "resuelto tras fallar",
  shown: "con la solución",
};

/** The rating change, always written: «+12», «−9», and «0» when it did not count. */
function deltaOf(delta: number | null): string {
  if (delta === null || delta === 0) return "0";
  return delta > 0 ? `+${delta}` : `−${Math.abs(delta)}`;
}

function PillBody({ entry }: { entry: SolveHistoryEntry }) {
  return (
    <>
      {entry.tone === "clean" && <CheckIcon variant="classic-solid" className="exercise-session-history__icon" />}
      {entry.tone === "shown" && <EyeIcon variant="classic-solid" className="exercise-session-history__icon" />}
      <span className="exercise-session-history__name">{entry.title}</span>
      {entry.tone === "late" && <span className="exercise-session-history__after">· tras fallar</span>}
    </>
  );
}

/**
 * «Esta sesión» (the new design system's card, 2026-10-23): a pill per
 * exercise finished in this visit, named and coloured by how it went — green
 * right first time, amber solved after a wrong move, grey with the solution
 * seen — going back to its exercise, and the one on the board ringed at the
 * end; a line under them says what the colours mean. The rating change of
 * each is in its accessible name. It lives in memory
 * (exercise-solve-history.store.ts): leaving the page and coming back starts
 * it again.
 */
export function ExerciseSessionHistory({ scope, current }: ExerciseSessionHistoryProps) {
  const entries = useSolveHistory(scope);
  const last = entries.length - 1;

  return (
    <section className="exercise-session-history" aria-label="Esta sesión">
      <p className="exercise-session-history__title">Esta sesión</p>
      <ol className="exercise-session-history__pills">
        {entries.map((entry, index) => {
          const ringed = !current.open && index === last;
          const className = `exercise-session-history__pill exercise-session-history__pill_tone_${entry.tone}${ringed ? " exercise-session-history__pill_state_current" : ""}`;
          const label = `${entry.title}, ${TONE_LABEL[entry.tone]}, ${deltaOf(entry.delta)}`;
          return (
            <li key={entry.key}>
              {entry.href ? (
                <Link href={entry.href} className={className} aria-label={label}>
                  <PillBody entry={entry} />
                </Link>
              ) : (
                <span className={className} aria-label={label} role="img">
                  <PillBody entry={entry} />
                </span>
              )}
            </li>
          );
        })}
        {current.open && (
          <li>
            <span
              className="exercise-session-history__pill exercise-session-history__pill_tone_open exercise-session-history__pill_state_current"
              aria-label={`${current.title}, en curso`}
              role="img"
            >
              <EllipsisIcon variant="classic-solid" className="exercise-session-history__icon" />
            </span>
          </li>
        )}
      </ol>
      {entries.length > 0 && (
        <p className="exercise-session-history__legend">
          <span>Verde: a la primera</span>
          <span>Ámbar: resuelto tras fallar</span>
          <span>Gris: con la solución</span>
        </p>
      )}
    </section>
  );
}
