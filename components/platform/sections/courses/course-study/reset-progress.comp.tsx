"use client";

import { useRef } from "react";
import { SubmitButton } from "@/components/platform/shared/submit-button.comp";
import { MOVE_TRAINER_ENABLED } from "@/constants/platform/features.const";
import { resetCourseProgress } from "@/services/courses/courses.actions";
import "./reset-progress.comp.css";

interface ResetProgressProps {
  courseId: string;
  courseName: string;
  /** Lessons the student has finished: what is about to be lost, by its figure. */
  completedLessons: number;
}

/**
 * «Borrar mi progreso»: the link of the course's options and the dialog that
 * asks before doing it. It cannot be undone, so it takes two things to go
 * through — opening the dialog and ticking its box — and the button that
 * does it is the red one.
 *
 * The box is `required`: the browser stops the form without it, and the
 * action asks for it again, because it is reachable by direct POST.
 */
export function ResetProgress({ courseId, courseName, completedLessons }: ResetProgressProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <div className="reset-progress">
      <button type="button" className="reset-progress__open" onClick={() => dialogRef.current?.showModal()}>
        Borrar mi progreso
      </button>

      {/* Native `<dialog>`: it brings focus trapping, closing with Escape and the
          modal backdrop without writing any of that by hand. */}
      <dialog ref={dialogRef} className="platform-dialog reset-progress__dialog" aria-labelledby="reset-progress-title">
        <form action={resetCourseProgress.bind(null, courseId)} className="reset-progress__form">
          <h2 id="reset-progress-title" className="reset-progress__title">
            Borrar mi progreso
          </h2>

          <p className="reset-progress__text">
            Vas a borrar tu progreso en «{courseName}»
            {completedLessons > 0 &&
              `: ${completedLessons} ${completedLessons === 1 ? "lección aprendida" : "lecciones aprendidas"}`}
            . El curso vuelve a empezar desde la primera lección y sigue entre tus cursos.
          </p>
          <p className="reset-progress__text">
            {MOVE_TRAINER_ENABLED
              ? "Tu racha, tu actividad y tus intentos en el Move Trainer no se tocan."
              : "Tu racha y tu actividad no se tocan."}{" "}
            No se puede deshacer.
          </p>

          <label className="reset-progress__confirm">
            <input type="checkbox" name="confirm" required />
            <span>Sí, quiero borrar mi progreso en este curso</span>
          </label>

          <div className="reset-progress__actions">
            <button
              type="button"
              className="platform-button"
              onClick={() => dialogRef.current?.close()}
            >
              Cancelar
            </button>
            <SubmitButton className="platform-button platform-button_variant_danger" pendingLabel="Borrando…">
              Borrar mi progreso
            </SubmitButton>
          </div>
        </form>
      </dialog>
    </div>
  );
}
