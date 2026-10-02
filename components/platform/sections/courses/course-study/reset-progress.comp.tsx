"use client";

import { useRef } from "react";
import { SubmitButton } from "@/components/platform/shared/submit-button/submit-button.comp";
import { MOVE_TRAINER_ENABLED } from "@/constants/platform/features.const";
import { resetChapterProgress, resetCourseProgress } from "@/services/courses/courses.actions";
import "./reset-progress.comp.css";

interface ResetProgressProps {
  courseId: string;
  /** The course's name, or the chapter's: whichever is about to be erased. */
  name: string;
  /** Lessons the student has finished in it: what is about to be lost, by its figure. */
  completedLessons: number;
  /**
   * The chapter whose progress is erased. Absent = the whole course, which is
   * what the course's own page offers.
   */
  chapterId?: string;
}

/**
 * «Eliminar mi progreso»: the link of the course's options and the dialog that
 * asks before doing it. It cannot be undone, so it takes two things to go
 * through — opening the dialog and ticking its box — and the button that
 * does it is the red one.
 *
 * The box is `required`: the browser stops the form without it, and the
 * action asks for it again, because it is reachable by direct POST.
 *
 * One component for the two scopes — the whole course and one chapter — and
 * not two: it is the same dialog, the same confirmation and the same red
 * button; what changes is which action it posts to and three lines of copy.
 */
export function ResetProgress({ courseId, name, completedLessons, chapterId }: ResetProgressProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const scope = chapterId ? "capítulo" : "curso";
  const label = chapterId ? "Eliminar mi progreso del capítulo" : "Eliminar mi progreso";
  const action = chapterId
    ? resetChapterProgress.bind(null, courseId, chapterId)
    : resetCourseProgress.bind(null, courseId);

  return (
    <div className="reset-progress">
      <button type="button" className="reset-progress__open" onClick={() => dialogRef.current?.showModal()}>
        {label}
      </button>

      {/* Native `<dialog>`: it brings focus trapping, closing with Escape and the
          modal backdrop without writing any of that by hand. */}
      <dialog ref={dialogRef} className="platform-dialog reset-progress__dialog" aria-labelledby="reset-progress-title">
        <form action={action} className="reset-progress__form">
          <h2 id="reset-progress-title" className="reset-progress__title">
            {label}
          </h2>

          <p className="reset-progress__text">
            Vas a eliminar tu progreso en «{name}»
            {completedLessons > 0 &&
              `: ${completedLessons} ${completedLessons === 1 ? "lección aprendida" : "lecciones aprendidas"}`}
            .{" "}
            {chapterId
              ? "Sus lecciones vuelven a estar sin empezar; el resto del curso se queda como está."
              : "El curso vuelve a empezar desde la primera lección y sigue entre tus cursos."}
          </p>
          <p className="reset-progress__text">
            {MOVE_TRAINER_ENABLED
              ? "Tu racha, tu actividad y tus intentos en el Move Trainer no se tocan."
              : "Tu racha y tu actividad no se tocan."}{" "}
            No se puede deshacer.
          </p>

          <label className="reset-progress__confirm">
            <input type="checkbox" name="confirm" required />
            <span>Sí, quiero eliminar mi progreso en este {scope}</span>
          </label>

          <div className="reset-progress__actions">
            <button type="button" className="platform-button" onClick={() => dialogRef.current?.close()}>
              Cancelar
            </button>
            <SubmitButton className="platform-button platform-button_variant_danger" pendingLabel="Eliminando…">
              {label}
            </SubmitButton>
          </div>
        </form>
      </dialog>
    </div>
  );
}
