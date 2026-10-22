import { setOnlyPriorityLessons } from "@/services/courses/courses.actions";
import "./learn-mode.comp.css";

interface LearnModeProps {
  courseId: string;
  /** The student asked to see only what the staff marked as priority in this course. */
  onlyPriority: boolean;
  /** How many lessons that hides. It is stated: an unexplained absence is unsettling. */
  hiddenLessons: number;
  /** The page the control sits on, where a failure is reported. */
  returnTo: string;
  /**
   * `segmented`, two buttons on a sunken track (the chapter's page); `side`,
   * two rows of the side column of the new design system, each with a radio's
   * ring, «Todas las lecciones» and «Sólo las prioritarias» (the course's
   * page, 2026-10-22).
   */
  look?: "segmented" | "side";
}

/**
 * What of the course is learned: everything, or only what the staff marked
 * as priority — a lesson, or a whole chapter. Two buttons, one pressed.
 *
 * Each is a `<form action>` with its value bound, and not one form with two
 * radios: a preference is saved and the page is drawn again, so there is no
 * state to keep nor JavaScript to send. It is a PER-COURSE setting, which is
 * why it shows on every page of the course.
 */
export function LearnMode({ courseId, onlyPriority, hiddenLessons, returnTo, look = "segmented" }: LearnModeProps) {
  const side = look === "side";
  const option = (label: string, value: boolean) => (
    <form action={setOnlyPriorityLessons.bind(null, courseId, value)} className="learn-mode__form">
      <input type="hidden" name="returnTo" value={returnTo} />
      <button
        type="submit"
        aria-pressed={onlyPriority === value}
        className={`learn-mode__option${onlyPriority === value ? " learn-mode__option_state_on" : ""}${side ? " learn-mode__option_look_side" : ""}`}
      >
        {side && <span className="learn-mode__ring" aria-hidden="true" />}
        {label}
      </button>
    </form>
  );

  return (
    <div className={`learn-mode${side ? " learn-mode_look_side" : ""}`}>
      <p className="learn-mode__label" id="learn-mode-label">
        {side ? "Qué aprender" : "Aprender"}
      </p>

      <div className="learn-mode__options" role="group" aria-labelledby="learn-mode-label">
        {option(side ? "Todas las lecciones" : "Todo", false)}
        {option(side ? "Sólo las prioritarias" : "Prioridad", true)}
      </div>

      {onlyPriority && hiddenLessons > 0 && (
        <p className="learn-mode__note">
          {/* What the filter hides, and what follows from it: with it on, the
              course's progress counts the priority lessons only. */}
          {hiddenLessons} {hiddenLessons === 1 ? "lección oculta" : "lecciones ocultas"}. El progreso cuenta sólo las de
          prioridad.
        </p>
      )}
    </div>
  );
}
