import { setOnlyPriorityLessons } from "@/services/courses/courses.actions";
import "./priority-filter.comp.css";

interface PriorityFilterProps {
  courseId: string;
  /** Si está encendido ahora mismo. */
  enabled: boolean;
  /** Cuántas lecciones esconde. Se dice: una ausencia sin explicar desconcierta. */
  hiddenLessons: number;
}

/**
 * El interruptor de «sólo lecciones imprescindibles» de un curso.
 *
 * Un `<form action>` con un botón y nada más: sin estado propio ni JavaScript,
 * porque lo único que hay que hacer es guardar una preferencia y volver a
 * pintar. El valor viaja como argumento ligado y no como campo, porque una
 * casilla no puede transmitir «false» y entonces no habría forma de apagarlo.
 *
 * Es un ajuste POR CURSO, así que el mismo interruptor sale en la ficha del
 * curso y en la del capítulo: son los dos sitios donde se nota.
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
