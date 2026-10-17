"use client";

import Link from "next/link";
import { CheckIcon } from "@/components/icons/check-icon.comp";
import { EllipsisIcon } from "@/components/icons/ellipsis-icon.comp";
import { XmarkIcon } from "@/components/icons/xmark-icon.comp";
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

function deltaOf(delta: number | null): string {
  if (delta === null || delta === 0) return "";
  return delta > 0 ? `+${delta}` : `−${Math.abs(delta)}`;
}

function PillBody({ entry }: { entry: SolveHistoryEntry }) {
  const Icon = entry.tone === "shown" ? XmarkIcon : CheckIcon;
  return (
    <>
      <Icon variant="classic-solid" className="exercise-session-history__icon" />
      {deltaOf(entry.delta)}
    </>
  );
}

/**
 * «Esta sesión»: a pill per exercise finished in this visit, coloured by how
 * it went and with its rating change, the one on the board ringed at the end.
 * It lives in memory (exercise-solve-history.store.ts): leaving the page and
 * coming back starts it again.
 */
export function ExerciseSessionHistory({ scope, current }: ExerciseSessionHistoryProps) {
  const entries = useSolveHistory(scope);
  const last = entries.length - 1;

  return (
    <section className="exercise-session-history" aria-label="Esta sesión">
      <div className="exercise-session-history__head">
        <p className="exercise-session-history__title">Esta sesión</p>
        <p className="exercise-session-history__note">Se reinicia al salir de la página</p>
      </div>
      <ol className="exercise-session-history__pills">
        {entries.map((entry, index) => {
          const ringed = !current.open && index === last;
          const className = `exercise-session-history__pill exercise-session-history__pill_tone_${entry.tone}${ringed ? " exercise-session-history__pill_state_current" : ""}`;
          const label = `${entry.title}, ${TONE_LABEL[entry.tone]}${entry.delta ? `, ${deltaOf(entry.delta)}` : ""}`;
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
      <ul className="exercise-session-history__legend" aria-label="Qué dice cada color">
        <li className="exercise-session-history__key exercise-session-history__key_tone_clean">A la primera</li>
        <li className="exercise-session-history__key exercise-session-history__key_tone_late">Resuelto tras fallar</li>
        <li className="exercise-session-history__key exercise-session-history__key_tone_shown">Con la solución</li>
      </ul>
    </section>
  );
}
