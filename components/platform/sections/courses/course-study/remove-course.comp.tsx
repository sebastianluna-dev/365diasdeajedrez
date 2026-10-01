"use client";

import { useRef } from "react";
import { SubmitButton } from "@/components/platform/shared/submit-button.comp";
import { MOVE_TRAINER_ENABLED } from "@/constants/platform/features.const";
import { removeCourse } from "@/services/courses/courses.actions";
import "./remove-course.comp.css";

interface RemoveCourseProps {
  courseId: string;
  courseName: string;
  /** Lessons the student has finished in it: what going out costs, by its figure. */
  completedLessons: number;
}

/**
 * «Quitar de mis cursos»: the last of the course's options and the dialog that
 * asks before doing it. It is the heavier of the two red entries — the other
 * one erases the progress and leaves the course — so it is the one at the
 * bottom, and it says in words what it takes along.
 *
 * It shares the dialog's shape with `ResetProgress` and not its component: the
 * copy is almost entirely different and what it does is not the same thing at
 * one more scope, it is leaving.
 */
export function RemoveCourse({ courseId, courseName, completedLessons }: RemoveCourseProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <div className="remove-course">
      <button type="button" className="remove-course__open" onClick={() => dialogRef.current?.showModal()}>
        Quitar de mis cursos
      </button>

      {/* Native `<dialog>`, like every other of the platform: focus trapping,
          Escape and the backdrop come with it. */}
      <dialog ref={dialogRef} className="platform-dialog remove-course__dialog" aria-labelledby="remove-course-title">
        <form action={removeCourse.bind(null, courseId)} className="remove-course__form">
          <h2 id="remove-course-title" className="remove-course__title">
            Quitar de mis cursos
          </h2>

          <p className="remove-course__text">
            «{courseName}» sale de tus cursos
            {completedLessons > 0 &&
              ` con tu progreso: ${completedLessons} ${
                completedLessons === 1 ? "lección aprendida" : "lecciones aprendidas"
              }`}
            . También se van tus ajustes del curso, como el filtro de prioridad.
          </p>
          <p className="remove-course__text">
            {MOVE_TRAINER_ENABLED
              ? "Tu racha, tu actividad y tus intentos en el Move Trainer no se tocan."
              : "Tu racha y tu actividad no se tocan."}{" "}
            Puedes volver a agregarlo cuando quieras desde su página, pero empezará de cero. No se puede deshacer.
          </p>

          <label className="remove-course__confirm">
            <input type="checkbox" name="confirm" required />
            <span>Sí, quiero quitar este curso de los míos</span>
          </label>

          <div className="remove-course__actions">
            <button type="button" className="platform-button" onClick={() => dialogRef.current?.close()}>
              Cancelar
            </button>
            <SubmitButton className="platform-button platform-button_variant_danger" pendingLabel="Quitando…">
              Quitar de mis cursos
            </SubmitButton>
          </div>
        </form>
      </dialog>
    </div>
  );
}
