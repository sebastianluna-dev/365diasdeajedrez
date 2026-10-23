import { setOnlyPriorityLessons } from "@/services/courses/courses.actions";
import { CourseSettingsArt } from "./course-settings-art.comp";

interface LearnModeProps {
  courseId: string;
  /** The student asked to see only what the staff marked as priority in this course. */
  onlyPriority: boolean;
  /** How many lessons that hides. It is stated: an unexplained absence is unsettling. */
  hiddenLessons: number;
  /** The page the control sits on, where a failure is reported. */
  returnTo: string;
}

/**
 * What of the course is learned: everything, or only what the staff marked
 * as priority — a lesson, or a whole chapter. Since 2026-10-23 the options of
 * «Qué aprender» in the course's settings panel (`CourseSettings`): each a
 * row with a radio's ring, its words and the drawing of what it does.
 *
 * Each is a `<form action>` with its value bound, and not one form with two
 * radios: a preference is saved and the page is drawn again, so there is no
 * state to keep nor JavaScript to send. It is a PER-COURSE setting, which is
 * why it shows on every page of the course.
 */
export function LearnMode({ courseId, onlyPriority, hiddenLessons, returnTo }: LearnModeProps) {
  const option = (label: string, hint: string, value: boolean) => (
    <form action={setOnlyPriorityLessons.bind(null, courseId, value)}>
      <input type="hidden" name="returnTo" value={returnTo} />
      <button
        type="submit"
        aria-pressed={onlyPriority === value}
        className={`platform-settings__option${onlyPriority === value ? " platform-settings__option_state_on" : ""}`}
      >
        <span className="platform-settings__ring" aria-hidden="true" />
        <span className="platform-settings__option-text">
          <span className="platform-settings__option-label">{label}</span>
          <span className="platform-settings__option-hint">{hint}</span>
        </span>
        <span className="platform-settings__option-art">
          <CourseSettingsArt kind={value ? "priority-lessons" : "all-lessons"} />
        </span>
      </button>
    </form>
  );

  return (
    <>
      {option("Todas las lecciones", "Cada lección del curso, en orden", false)}
      {option("Sólo las prioritarias", "Las que el curso marca como prioritarias; las demás se ocultan", true)}

      {onlyPriority && hiddenLessons > 0 && (
        <p className="platform-settings__note">
          {/* What the filter hides, and what follows from it: with it on, the
              course's progress counts the priority lessons only. */}
          {hiddenLessons} {hiddenLessons === 1 ? "lección oculta" : "lecciones ocultas"}. El progreso cuenta sólo las de
          prioridad.
        </p>
      )}
    </>
  );
}
