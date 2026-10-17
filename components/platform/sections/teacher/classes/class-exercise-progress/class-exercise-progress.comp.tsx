"use client";

import { useRef, useState } from "react";
import { ExerciseAttemptRow } from "@/components/platform/shared/exercise-attempt-row/exercise-attempt-row.comp";
import {
  PlatformPopup,
  type PlatformPopupHandle,
} from "@/components/platform/shared/platform-popup/platform-popup.comp";
import { joinSpanish } from "@/services/shared/class-rules";
import type { ClassExerciseProgressData, ClassExerciseProgressItem } from "./class-exercise-progress.types";
import "./class-exercise-progress.comp.css";

interface ClassExerciseProgressProps {
  progress: ClassExerciseProgressData;
}

/**
 * An EXERCISE block as its teacher reads it (D29): one row per exercise — its
 * number, title and facts — and «2 de 3 lo resolvieron», a button that opens
 * the popup with each seated student's attempts from this block
 * (`ExerciseAttemptRow`, the student as the row's title, with the mistake to
 * unfold) and who has not tried it. Counted on reading over the seats not
 * moved, never stored; the staff's sheet shows the same count, read-only. An
 * exercise the students no longer get wears «Ya no está disponible», as it
 * does on the staff's rows.
 */
export function ClassExerciseProgress({ progress }: ClassExerciseProgressProps) {
  const popup = useRef<PlatformPopupHandle>(null);
  const [open, setOpen] = useState<ClassExerciseProgressItem | null>(null);
  const [use, setUse] = useState(0);

  return (
    <div className="class-exercise-progress">
      <ol className="class-exercise-progress__list">
        {progress.exercises.map((item) => (
          <li key={item.exerciseId} className="class-exercise-progress__row">
            <span className="class-exercise-progress__body">
              <span className="class-exercise-progress__title">
                {item.n}. {item.title}
              </span>
              <span className="class-exercise-progress__facts">{item.facts}</span>
              {item.unavailable && (
                <span className="platform-tag platform-tag_variant_warning class-exercise-progress__tag">
                  Ya no está disponible
                </span>
              )}
            </span>
            <button
              type="button"
              className="platform-row-action"
              aria-haspopup="dialog"
              onClick={(event) => {
                setOpen(item);
                popup.current?.open(event);
              }}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ol>
      <PlatformPopup
        ref={popup}
        title={open ? `${open.n}. ${open.title}` : "Ejercicio"}
        size="md"
        phone="sheet"
        onClose={() => setUse((n) => n + 1)}
      >
        {/* Remounted per use: the rows' disclosures start folded on the next exercise. */}
        {open && <Attempts key={`${use}:${open.exerciseId}`} item={open} seatCount={progress.seatCount} />}
      </PlatformPopup>
    </div>
  );
}

function Attempts({ item, seatCount }: { item: ClassExerciseProgressItem; seatCount: number }) {
  return (
    <div className="class-exercise-progress__popup">
      <p className="class-exercise-progress__summary">
        <strong className="class-exercise-progress__figure">{item.label}</strong>
        {seatCount > 0 && (
          <span className="class-exercise-progress__note">
            {item.attempts.length === 0
              ? "Nadie lo ha intentado todavía desde la clase."
              : `${item.attempts.length} ${item.attempts.length === 1 ? "intento" : "intentos"} desde la clase.`}
          </span>
        )}
      </p>
      {item.attempts.length > 0 && (
        <ol className="class-exercise-progress__attempts" aria-label="Intentos, el último primero">
          {item.attempts.map((attempt) => (
            <ExerciseAttemptRow key={attempt.id} attempt={attempt} />
          ))}
        </ol>
      )}
      {item.untried.length > 0 && (
        <p className="class-exercise-progress__untried">Sin intentar: {joinSpanish(item.untried)}.</p>
      )}
    </div>
  );
}
