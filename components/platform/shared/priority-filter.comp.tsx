import { setOnlyPriorityLessons } from "@/services/courses/courses.actions";
import "./priority-filter.comp.css";

interface PriorityFilterProps {
  courseId: string;
  /** Whether it is on right now. */
  enabled: boolean;
  /** How many lessons it hides. It is stated: an unexplained absence is unsettling. */
  hiddenLessons: number;
}

/**
 * The "only essential lessons" switch of a course.
 *
 * A `<form action>` with a button and nothing else: no state of its own and
 * no JavaScript, because all there is to do is save a preference and render
 * again. The value travels as a bound argument and not as a field, because
 * a checkbox cannot transmit "false" and then there would be no way to switch it off.
 *
 * It is a PER-COURSE setting, so the same switch appears on the course page
 * and on the chapter page: those are the two places where it shows.
 */
export function PriorityFilter({ courseId, enabled, hiddenLessons }: PriorityFilterProps) {
  return (
    <form
      className="priority-filter"
      action={setOnlyPriorityLessons.bind(null, courseId, !enabled)}
    >
      <button
        type="submit"
        aria-pressed={enabled}
        className={`priority-filter__button${enabled ? " priority-filter__button_state_on" : ""}`}
      >
        <span className="priority-filter__mark" aria-hidden="true" />
        Sólo lecciones imprescindibles
      </button>

      {enabled && hiddenLessons > 0 && (
        <span className="priority-filter__note">
          {hiddenLessons} {hiddenLessons === 1 ? "lección oculta" : "lecciones ocultas"}
        </span>
      )}
    </form>
  );
}
