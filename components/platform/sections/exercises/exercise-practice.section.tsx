import { EmptyState } from "@/components/platform/shared/empty-state/empty-state.comp";
import { ExerciseSolver } from "@/components/platform/shared/exercise-solver/exercise-solver.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import { platformRoutes } from "@/lib/platform-routes";
import { submitExerciseAttempt } from "@/services/exercises/exercises.actions";
import type {
  PracticeChoice,
  PracticeFilters as PracticeFiltersData,
  PracticeServing,
} from "@/services/exercises/practice.types";
import { PracticeFilters } from "./practice-filters/practice-filters.comp";
import "./exercise-practice.section.css";

interface ExercisePracticeSectionProps {
  filters: PracticeFiltersData;
  choice: PracticeChoice;
  serving: PracticeServing;
}

/**
 * «Práctica libre» (D18, D32; PLAN.md §5.6): the two filters on top, and
 * under them what the choice serves — a random library exercise on the solve
 * screen with the context PRACTICE and «Siguiente» to the next, the note
 * that every one was solved already when so, or why nothing is served.
 */
export function ExercisePracticeSection({ filters, choice, serving }: ExercisePracticeSectionProps) {
  const topic = filters.topics.find((candidate) => candidate.code === choice.topicCode);
  return (
    <div className="exercise-practice">
      <PracticeFilters filters={filters} choice={choice} variant="page" />

      {serving.kind === "choose" && !filters.libraryEmpty && (
        <p className="exercise-practice__hint">
          Elige un tema y un nivel: te damos un ejercicio de la biblioteca al azar.
        </p>
      )}
      {serving.kind === "empty" && (
        <EmptyState
          title="No hay ejercicios de ese tema en ese nivel todavía."
          description="Prueba con otro nivel o con el tema general, que incluye los de sus subtemas."
        />
      )}
      {serving.kind === "exercise" && (
        <>
          {serving.exhausted && (
            <PlatformNotice
              message="Ya resolviste todos los ejercicios de este tema y nivel: los que salgan ahora se repiten."
              variant="info"
            />
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
              href: null,
              ...(topic && {
                topic: {
                  code: topic.code,
                  label: topic.label,
                  changeHref: platformRoutes.exercisePractice(choice.levelSlug ? { nivel: choice.levelSlug } : {}),
                },
              }),
            }}
          />
        </>
      )}
    </div>
  );
}
