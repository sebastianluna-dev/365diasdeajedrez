import { EmptyState } from "@/components/platform/shared/empty-state/empty-state.comp";
import { ExerciseCard } from "@/components/platform/shared/exercise-card/exercise-card.comp";
import { FilterPills } from "@/components/platform/shared/filter-pills/filter-pills.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import { staffRoutes } from "@/lib/platform-routes";
import type { StaffExercisesView } from "@/services/staff-exercises/staff-exercises.types";
import "./staff-exercises.section.css";

interface StaffExercisesSectionProps {
  view: StaffExercisesView;
  notice?: string;
  errorMessage?: string;
}

/**
 * The academy's exercise bank (PLAN.md §8): its views as pills — «Biblioteca»,
 * every exercise approved or published, the last first; «En revisión», the
 * teachers' proposals, the oldest first, each with who proposed it and when —
 * and the cards, whose title opens the staff editor with its review bar. The
 * cards carry no row words: every decision is taken on the exercise's page.
 */
export function StaffExercisesSection({ view, notice, errorMessage }: StaffExercisesSectionProps) {
  const review = view.tab === "revision";
  return (
    <section className="staff-exercises">
      {notice && <PlatformNotice message={notice} variant="success" />}
      {errorMessage && <PlatformNotice message={errorMessage} />}

      <FilterPills
        label="Vista"
        pills={[
          { label: "Biblioteca", href: staffRoutes.exercises, count: view.counts.library, active: !review },
          { label: "En revisión", href: staffRoutes.exercisesReview, count: view.counts.review, active: review },
        ]}
      />

      {review ? (
        view.review.length === 0 ? (
          <EmptyState
            title="No hay propuestas pendientes."
            description="Cuando un profesor proponga un ejercicio a la biblioteca aparecerá aquí, el más antiguo primero."
          />
        ) : (
          <ul className="staff-exercises__list">
            {view.review.map((item) => (
              <li key={item.card.id} className="staff-exercises__item">
                <p className="staff-exercises__submitted">{item.submittedLabel}</p>
                <ExerciseCard exercise={item.card} />
              </li>
            ))}
          </ul>
        )
      ) : view.library.length === 0 ? (
        <EmptyState
          title="La biblioteca todavía está vacía."
          description="Entra en ella lo que apruebes de los profesores en «En revisión» y lo que publique la academia. Es lo que los alumnos practican por su cuenta."
        />
      ) : (
        <ul className="staff-exercises__list">
          {view.library.map((card) => (
            <li key={card.id}>
              <ExerciseCard exercise={card} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
