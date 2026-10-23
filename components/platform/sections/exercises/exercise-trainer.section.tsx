import { EmptyState } from "@/components/platform/shared/empty-state/empty-state.comp";
import { ExerciseSolver } from "@/components/platform/shared/exercise-solver/exercise-solver.comp";
import { platformRoutes } from "@/lib/platform-routes";
import { submitExerciseAttempt } from "@/services/exercises/exercises.actions";
import type { PracticeFilters, PracticeServing } from "@/services/exercises/practice.types";
import "./exercise-trainer.section.css";

interface ExerciseTrainerSectionProps {
  /** The exercise dealt, or why none is. */
  serving: PracticeServing;
  /** The topics, to name the topic on screen. */
  filters: PracticeFilters;
  /** The topic in the address (`tema`); null on «Todos los temas». */
  topicCode: string | null;
  /**
   * One library exercise again, from a pill of «Esta sesión»
   * (`/ejercicios/biblioteca/[id]`): its title heads the trail, and there is
   * no level to deal from.
   */
  again?: boolean;
}

/**
 * The panel of «Ejercicios» (the Lichess-like trainer, in the new design
 * system, 2026-10-23): the solve page, with no toolbar over it — the topic
 * and the level are chosen in the side column, where they are lit —, a library exercise
 * of the topic (its subtopics included) at the level, the ones never solved
 * first (`getPracticeExercise`). Every exercise dealt here shares one visit's
 * history (`practice`), and each pill goes back to its exercise. When nothing
 * is dealt, the panel says why. Server: the solver is the one leaf with state.
 */
export function ExerciseTrainerSection({ serving, filters, topicCode, again = false }: ExerciseTrainerSectionProps) {
  const topic = filters.topics.find((candidate) => candidate.code === topicCode) ?? null;
  // The page's heading, read out and not drawn: the topic on screen is the
  // side column's lit link, and the panel has no toolbar (2026-10-23).
  const heading = again && serving.kind === "exercise" ? serving.exercise.title : (topic?.label ?? "Todos los temas");

  return (
    <section className="platform-workspace__panel exercise-trainer">
      <h1 className="exercise-trainer__heading">{heading}</h1>

      {serving.kind === "exercise" ? (
        <>
          {serving.exhausted && (
            <p className="exercise-trainer__note">Ya resolviste todos los de este tema y nivel: ahora se repiten.</p>
          )}
          {/* A new exercise is a new board: «Siguiente» never carries the last one's state. */}
          <ExerciseSolver
            key={serving.exercise.id}
            exercise={serving.exercise}
            mode={serving.mode}
            context={serving.context}
            next={serving.next}
            back={serving.back}
            submit={submitExerciseAttempt}
            aside={{
              scope: "practice",
              href: platformRoutes.exerciseLibraryItem(serving.exercise.id),
              ...(topic && { topic: { code: topic.code, label: topic.label } }),
            }}
          />
        </>
      ) : filters.libraryEmpty ? (
        <EmptyState
          title="La biblioteca aún no tiene ejercicios."
          description="Mientras tanto, resuelve las series que te preparan."
          actionLabel="Ver tus series"
          actionHref={platformRoutes.exerciseOverview}
        />
      ) : serving.kind === "empty" ? (
        <EmptyState
          title="No hay ejercicios de ese tema en ese nivel todavía."
          description="Prueba con otro nivel o con el tema general, que incluye los de sus subtemas."
        />
      ) : (
        <EmptyState
          title="Ese tema o ese nivel no están en la biblioteca."
          description="Elige otro tema en la columna, o todos los temas."
          actionLabel="Todos los temas"
          actionHref={platformRoutes.exercises}
        />
      )}
    </section>
  );
}
