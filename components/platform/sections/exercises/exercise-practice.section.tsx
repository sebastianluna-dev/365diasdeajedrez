import { EmptyState } from "@/components/platform/shared/empty-state/empty-state.comp";
import type {
  PracticeChoice,
  PracticeFilters as PracticeFiltersData,
  PracticeServing,
} from "@/services/exercises/practice.types";
import { ExerciseTrainerSection } from "./exercise-trainer.section";
import { PracticeFilters } from "./practice-filters/practice-filters.comp";
import "./exercise-practice.section.css";

interface ExercisePracticeSectionProps {
  filters: PracticeFiltersData;
  choice: PracticeChoice;
  serving: PracticeServing;
}

/**
 * «Práctica libre» (D18, D32; PLAN.md §5.6): the two filters on top, and
 * under them why nothing is served yet; once an exercise is served, the solve
 * screen alone (context PRACTICE, «Siguiente» to the next), the note that
 * every one was solved already in its topic card.
 */
export function ExercisePracticeSection({ filters, choice, serving }: ExercisePracticeSectionProps) {
  const topic = filters.topics.find((candidate) => candidate.code === choice.topicCode);
  // Serving one, the page is the solve screen alone, the window's height: the
  // filters come back through the topic card's «Cambiar de tema».
  if (serving.kind === "exercise") {
    return <ExerciseTrainerSection serving={serving} topic={topic ?? null} levelSlug={choice.levelSlug} />;
  }
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
    </div>
  );
}
