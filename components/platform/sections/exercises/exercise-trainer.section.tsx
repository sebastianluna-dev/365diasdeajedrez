import { ExerciseSolver } from "@/components/platform/shared/exercise-solver/exercise-solver.comp";
import { platformRoutes } from "@/lib/platform-routes";
import { submitExerciseAttempt } from "@/services/exercises/exercises.actions";
import type { PracticeServing, PracticeTopicOption } from "@/services/exercises/practice.types";

interface ExerciseTrainerSectionProps {
  serving: Extract<PracticeServing, { kind: "exercise" }>;
  /** The topic chosen in «Ejercicios por tema»; null on «Ejercicios» itself, any topic. */
  topic: PracticeTopicOption | null;
  /** The level kept when the topic changes. */
  levelSlug: string | null;
}

/**
 * A library exercise on the full solve page (the Lichess-like trainer):
 * «Ejercicios» itself, a topic of «Ejercicios por tema», or one exercise
 * again from a pill of «Esta sesión». They share one visit's history
 * (\`practice\`), and each pill goes back to its exercise.
 */
export function ExerciseTrainerSection({ serving, topic, levelSlug }: ExerciseTrainerSectionProps) {
  return (
    // A new exercise is a new board: «Siguiente» never carries the last one's state.
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
        ...(topic
          ? {
              topic: {
                code: topic.code,
                label: topic.label,
                changeHref: platformRoutes.exercisePractice(levelSlug ? { nivel: levelSlug } : {}),
                note: serving.exhausted ? "Ya resolviste todos los de este tema y nivel: ahora se repiten." : null,
              },
            }
          : {
              general: {
                topicsHref: platformRoutes.exercisePractice(),
                overviewHref: platformRoutes.exerciseOverview,
              },
            }),
      }}
    />
  );
}
