import Link from "next/link";
import { ArrowDownIcon } from "@/components/icons/arrow-down-icon.comp";
import { ArrowUpIcon } from "@/components/icons/arrow-up-icon.comp";
import { ExerciseCard } from "@/components/platform/shared/exercise-card/exercise-card.comp";
import { staffRoutes } from "@/lib/platform-routes";
import {
  archiveLessonExercise,
  deleteLessonExercise,
  moveLessonExercise,
} from "@/services/staff-courses/lesson-exercises.actions";
import type { LessonExerciseAdminRow } from "@/services/staff-courses/staff-courses.types";
import "./lesson-exercises.comp.css";

interface LessonExercisesProps {
  courseId: string;
  chapterId: string;
  lessonId: string;
  /** In their order, the archived ones last. */
  exercises: LessonExerciseAdminRow[];
}

/** What «Eliminar»'s confirmation says of a lesson's exercise: it is nobody's but the lesson's. */
const DELETE_DESCRIPTION = "Se elimina el ejercicio con su solución. Los alumnos ya no lo verán en la lección.";

/**
 * The lesson's exercises (D04, D05): each one the bank's card, whose title
 * opens the staff editor, with «Subir»/«Bajar» beside it and the row's words
 * — «Eliminar» for one nobody has tried, «Archivar» for one with attempts —;
 * the archived ones apart, with nothing to do to them. The actions are
 * imported here and handed to the cards, which import none.
 */
export function LessonExercises({ courseId, chapterId, lessonId, exercises }: LessonExercisesProps) {
  const active = exercises.filter((exercise) => exercise.lessonOrder !== null);
  const archived = exercises.filter((exercise) => exercise.lessonOrder === null);
  const move = moveLessonExercise.bind(null, courseId, chapterId, lessonId);
  const actions = {
    archive: archiveLessonExercise.bind(null, courseId, chapterId, lessonId),
    delete: deleteLessonExercise.bind(null, courseId, chapterId, lessonId),
  };

  return (
    <div className="lesson-exercises">
      {active.length === 0 ? (
        <p className="lesson-exercises__empty">
          Esta lección todavía no tiene ejercicios. Agrega uno con el editor: colocas la posición, juegas la solución y
          lo publicas; los alumnos lo practican después de la partida, o en lugar de ella si la lección no tiene.
        </p>
      ) : (
        <ol className="lesson-exercises__list">
          {active.map((exercise, index) => (
            <li key={exercise.id} className="lesson-exercises__item">
              {/* The arrows are controls, drawn as keys; what is DONE to the exercise are the card's words. */}
              <div className="lesson-exercises__order">
                <form action={move}>
                  <input type="hidden" name="exerciseId" value={exercise.id} />
                  <input type="hidden" name="direction" value="up" />
                  <button
                    type="submit"
                    className="platform-button platform-button_size_sm platform-button_shape_square"
                    aria-label={`Subir «${exercise.title}»`}
                    disabled={index === 0}
                  >
                    <ArrowUpIcon variant="classic-solid" className="platform-button__icon" />
                  </button>
                </form>
                <form action={move}>
                  <input type="hidden" name="exerciseId" value={exercise.id} />
                  <input type="hidden" name="direction" value="down" />
                  <button
                    type="submit"
                    className="platform-button platform-button_size_sm platform-button_shape_square"
                    aria-label={`Bajar «${exercise.title}»`}
                    disabled={index === active.length - 1}
                  >
                    <ArrowDownIcon variant="classic-solid" className="platform-button__icon" />
                  </button>
                </form>
              </div>
              <div className="lesson-exercises__card">
                <ExerciseCard exercise={exercise} actions={actions} deleteDescription={DELETE_DESCRIPTION} />
              </div>
            </li>
          ))}
        </ol>
      )}

      <div className="lesson-exercises__add">
        <Link href={staffRoutes.lessonExerciseNew(courseId, chapterId, lessonId)} className="platform-button">
          Agregar ejercicio
        </Link>
      </div>

      {archived.length > 0 && (
        <section className="lesson-exercises__archived" aria-labelledby={`lesson-exercises-archived-${lessonId}`}>
          <h3 id={`lesson-exercises-archived-${lessonId}`} className="lesson-exercises__archived-title">
            Archivados
          </h3>
          <p className="lesson-exercises__archived-note">
            Los alumnos ya no los ven; se conservan por los intentos que hicieron.
          </p>
          <ul className="lesson-exercises__list">
            {archived.map((exercise) => (
              <li key={exercise.id} className="lesson-exercises__item lesson-exercises__item_state_archived">
                <div className="lesson-exercises__card">
                  <ExerciseCard exercise={exercise} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
