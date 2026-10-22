"use client";

import { useRef } from "react";
import { CircleMinusIcon } from "@/components/icons/circle-minus-icon.comp";
import {
  PlatformConfirmPopup,
  type PlatformConfirmPopupHandle,
} from "@/components/platform/shared/platform-confirm-popup/platform-confirm-popup.comp";
import { MOVE_TRAINER_ENABLED } from "@/constants/platform/features.const";
import { removeCourse } from "@/services/courses/courses.actions";
import "./remove-course.comp.css";

interface RemoveCourseProps {
  courseId: string;
  courseName: string;
  /** Lessons the student has finished in it: what going out costs, by its figure. */
  completedLessons: number;
  /** `link`, one of the options card's links; `side`, a row of the side column of the new design system. */
  look?: "link" | "side";
}

/**
 * «Quitar de mis cursos»: the last of the course's options and the
 * confirmation that asks before doing it. It is the heavier of the two red
 * entries — the other one erases the progress and leaves the course — so it
 * is the one at the bottom, and it says in words what it takes along.
 *
 * It shares the confirmation's shape with `ResetProgress` and not its
 * component: the copy is almost entirely different and what it does is not
 * the same thing at one more scope, it is leaving.
 */
export function RemoveCourse({ courseId, courseName, completedLessons, look = "link" }: RemoveCourseProps) {
  const confirmRef = useRef<PlatformConfirmPopupHandle>(null);
  const progress =
    completedLessons > 0
      ? ` con tu progreso (${completedLessons} ${completedLessons === 1 ? "lección aprendida" : "lecciones aprendidas"}) y`
      : "";

  return (
    <div className="remove-course">
      <button
        type="button"
        className={`remove-course__open${look === "side" ? " remove-course__open_look_side" : ""}`}
        onClick={(event) => confirmRef.current?.open(event)}
      >
        {look === "side" && <CircleMinusIcon variant="duotone-light" className="remove-course__icon" />}
        Quitar de mis cursos
      </button>

      {/* The box's `name`/`value` are what `RESET_SCHEMA` reads (`confirm=on`):
          the action asks for it again, because it is reachable by direct POST. */}
      <PlatformConfirmPopup
        ref={confirmRef}
        verb="Quitar"
        subject={courseName}
        title={`¿Quitar «${courseName}» de mis cursos?`}
        description={`El curso sale de tus cursos${progress} con tus ajustes del curso, como el filtro de prioridad.`}
        consequences={[
          MOVE_TRAINER_ENABLED
            ? "Tu racha, tu actividad y tus intentos en el Move Trainer no se tocan."
            : "Tu racha y tu actividad no se tocan.",
          "Puedes volver a agregarlo cuando quieras desde su página, pero empezará de cero.",
        ]}
        note="No se puede deshacer."
        acknowledgement={{ name: "confirm", value: "on", label: "Sí, quiero quitar este curso de los míos" }}
        action={removeCourse.bind(null, courseId)}
        confirmLabel="Quitar de mis cursos"
      />
    </div>
  );
}
