import { setOnlyPriorityLessons } from "@/services/courses/courses.actions";
import "./learn-mode.comp.css";

interface LearnModeProps {
  courseId: string;
  /** The student asked to see only the essential lessons of this course. */
  onlyPriority: boolean;
  /** How many lessons that hides. It is stated: an unexplained absence is unsettling. */
  hiddenLessons: number;
  /** The page the control sits on, where a failure is reported. */
  returnTo: string;
}

/**
 * What of the course is learned: everything, or only the lessons the staff
 * marked as essential. Two buttons, one pressed.
 *
 * Each is a `<form action>` with its value bound, and not one form with two
 * radios: a preference is saved and the page is drawn again, so there is no
 * state to keep nor JavaScript to send. It is a PER-COURSE setting, which is
 * why it shows on every page of the course.
 */
export function LearnMode({ courseId, onlyPriority, hiddenLessons, returnTo }: LearnModeProps) {
  const option = (label: string, value: boolean) => (
    <form action={setOnlyPriorityLessons.bind(null, courseId, value)} className="learn-mode__form">
      <input type="hidden" name="returnTo" value={returnTo} />
      <button
        type="submit"
        aria-pressed={onlyPriority === value}
        className={`learn-mode__option${onlyPriority === value ? " learn-mode__option_state_on" : ""}`}
      >
        {label}
      </button>
    </form>
  );

  return (
    <div className="learn-mode">
      <p className="learn-mode__label" id="learn-mode-label">
        Aprender
      </p>

      <div className="learn-mode__options" role="group" aria-labelledby="learn-mode-label">
        {option("Todo", false)}
        {option("Imprescindibles", true)}
      </div>

      {onlyPriority && hiddenLessons > 0 && (
        <p className="learn-mode__note">
          {hiddenLessons} {hiddenLessons === 1 ? "lección oculta" : "lecciones ocultas"}. Las que ya empezaste siguen a
          la vista.
        </p>
      )}
    </div>
  );
}
