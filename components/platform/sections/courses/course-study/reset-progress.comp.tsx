"use client";

import { useRef } from "react";
import { ArrowRotateLeftIcon } from "@/components/icons/arrow-rotate-left-icon.comp";
import {
  PlatformConfirmPopup,
  type PlatformConfirmPopupHandle,
} from "@/components/platform/shared/platform-confirm-popup/platform-confirm-popup.comp";
import { MOVE_TRAINER_ENABLED } from "@/constants/platform/features.const";
import { resetChapterProgress, resetCourseProgress } from "@/services/courses/courses.actions";
import { CourseSettingsArt } from "./course-settings-art.comp";

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
 * «Eliminar mi progreso»: an option of the course's settings panel
 * (`CourseSettings`, 2026-10-23: a row with its words and the drawing of the
 * bars emptying) and the
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
    <>
      <button type="button" className="platform-settings__option" onClick={(event) => confirmRef.current?.open(event)}>
        <span className="platform-settings__lead">
          <ArrowRotateLeftIcon variant="duotone-light" className="platform-settings__lead-icon" />
        </span>
        <span className="platform-settings__option-text">
          <span className="platform-settings__option-label">{label}</span>
          <span className="platform-settings__option-hint">
            {chapterId
              ? "Las lecciones de este capítulo vuelven a «Por empezar»"
              : "Las lecciones vuelven a «Por empezar»; tu racha no cambia"}
          </span>
        </span>
        <span className="platform-settings__option-art">
          <CourseSettingsArt kind={chapterId ? "reset-chapter" : "reset-course"} />
        </span>
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
    </>
  );
}
