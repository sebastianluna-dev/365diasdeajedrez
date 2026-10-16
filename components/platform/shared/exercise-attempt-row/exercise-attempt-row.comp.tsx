"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { StaticDiagram } from "@/components/chess/static-diagram.comp";
import { ChevronDownIcon } from "@/components/icons/chevron-down-icon.comp";
import { LocalDateTime } from "@/components/platform/shared/local-datetime/local-datetime.comp";
import type { ExerciseAttemptOutcome, ExerciseAttemptRowData } from "./exercise-attempt-row.types";
import "./exercise-attempt-row.comp.css";

interface ExerciseAttemptRowProps {
  attempt: ExerciseAttemptRowData;
}

/** The tag's tone by the outcome: a pass in the success green, one with a hint in the warning amber, the rest plain. */
const TAG_VARIANT: Record<ExerciseAttemptOutcome, string> = {
  solved: " platform-tag_variant_success",
  hinted: " platform-tag_variant_warning",
  failed: "",
  solutionShown: "",
};

/**
 * One attempt of a student at an exercise, as their teacher reads it (D24):
 * the exercise, where and when, how it went as a tag, and, for one failed at
 * a wrong move, «Ver el error», a disclosure that opens the position with the
 * move played and the one expected drawn over it and said in words. A list
 * item: the section lists them, the latest first.
 */
export function ExerciseAttemptRow({ attempt }: ExerciseAttemptRowProps) {
  const [open, setOpen] = useState(false);
  const detailId = useId();
  const { mistake } = attempt;

  return (
    <li className={`exercise-attempt-row${open ? " exercise-attempt-row_state_open" : ""}`}>
      <div className="exercise-attempt-row__main">
        <div className="exercise-attempt-row__body">
          <p className="exercise-attempt-row__title">
            {attempt.href ? (
              <Link href={attempt.href} className="exercise-attempt-row__link">
                {attempt.title}
              </Link>
            ) : (
              attempt.title
            )}
          </p>
          <p className="exercise-attempt-row__meta">
            <span>{attempt.whereLabel}</span>
            <span className="exercise-attempt-row__separator" aria-hidden="true">
              ·
            </span>
            <LocalDateTime iso={attempt.atIso} fallback={attempt.atLabel} />
            {attempt.durationLabel && (
              <>
                <span className="exercise-attempt-row__separator" aria-hidden="true">
                  ·
                </span>
                <span>{attempt.durationLabel}</span>
              </>
            )}
          </p>
        </div>
        <span className={`platform-tag${TAG_VARIANT[attempt.outcome]}`}>{attempt.outcomeLabel}</span>
        {mistake && (
          <button
            type="button"
            className="platform-button platform-button_size_sm"
            aria-expanded={open}
            aria-controls={detailId}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? "Ocultar el error" : "Ver el error"}
            <ChevronDownIcon variant="classic-solid" className="platform-button__icon exercise-attempt-row__chevron" />
          </button>
        )}
      </div>
      {mistake && (
        <div id={detailId} className="exercise-attempt-row__detail" hidden={!open}>
          <div className="exercise-attempt-row__diagram">
            <StaticDiagram fen={mistake.fen} orientation={mistake.orientation} arrows={mistake.arrows} />
          </div>
          <p className="exercise-attempt-row__mistake">
            Jugó{" "}
            <strong className="exercise-attempt-row__move exercise-attempt-row__move_tone_danger">
              {mistake.playedLabel}
            </strong>{" "}
            en vez de{" "}
            <strong className="exercise-attempt-row__move exercise-attempt-row__move_tone_success">
              {mistake.expectedLabel}
            </strong>
            .
          </p>
        </div>
      )}
    </li>
  );
}
