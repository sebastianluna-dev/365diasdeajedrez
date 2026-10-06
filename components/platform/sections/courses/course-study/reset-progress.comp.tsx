"use client";

import { useRef } from "react";
import {
  PlatformConfirmPopup,
  type PlatformConfirmPopupHandle,
} from "@/components/platform/shared/platform-confirm-popup/platform-confirm-popup.comp";
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
 * «Eliminar mi progreso»: the link of the course's options and the
 * confirmation that asks before doing it. It cannot be undone, so it takes
 * two things to go through — opening the confirmation and ticking its box —
 * and the button that does it is the red one.
 *
 * The box is what the confirmation requires before its button works, and
 * the action asks for it again, because it is reachable by direct POST.
 *
 * One component for the two scopes — the whole course and one chapter — and
 * not two: it is the same confirmation, the same box and the same red
 * button; what changes is which action it posts to and three lines of copy.
 */
export function ResetProgress({ courseId, name, completedLessons, chapterId }: ResetProgressProps) {
  const confirmRef = useRef<PlatformConfirmPopupHandle>(null);
  const scope = chapterId ? "capítulo" : "curso";
  const label = chapterId ? "Eliminar mi progreso del capítulo" : "Eliminar mi progreso";
  const action = chapterId
    ? resetChapterProgress.bind(null, courseId, chapterId)
    : resetCourseProgress.bind(null, courseId);
  const progress =
    completedLessons > 0
      ? `: ${completedLessons} ${completedLessons === 1 ? "lección aprendida" : "lecciones aprendidas"}`
      : "";

  return (
    <div className="reset-progress">
      <button type="button" className="reset-progress__open" onClick={(event) => confirmRef.current?.open(event)}>
        {label}
      </button>

      {/* The box's `name`/`value` are what `RESET_SCHEMA` reads (`confirm=on`). */}
      <PlatformConfirmPopup
        ref={confirmRef}
        verb="Eliminar"
        subject={name}
        title={`¿${label}?`}
        description={`Vas a eliminar tu progreso en «${name}»${progress}.`}
        consequences={[
          chapterId
            ? "Sus lecciones vuelven a estar sin empezar; el resto del curso se queda como está."
            : "El curso vuelve a empezar desde la primera lección y sigue entre tus cursos.",
          MOVE_TRAINER_ENABLED
            ? "Tu racha, tu actividad y tus intentos en el Move Trainer no se tocan."
            : "Tu racha y tu actividad no se tocan.",
        ]}
        acknowledgement={{ name: "confirm", value: "on", label: `Sí, quiero eliminar mi progreso en este ${scope}` }}
        action={action}
        confirmLabel={label}
      />
    </div>
  );
}
