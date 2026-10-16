import Link from "next/link";
import { EmptyState } from "@/components/platform/shared/empty-state/empty-state.comp";
import { ExerciseAttemptRow } from "@/components/platform/shared/exercise-attempt-row/exercise-attempt-row.comp";
import { teacherRoutes } from "@/lib/platform-routes";
import type { StudentExerciseAttemptsView } from "@/services/teacher-exercises/teacher-exercises.types";
import "./student-exercise-attempts.section.css";

interface StudentExerciseAttemptsSectionProps {
  view: StudentExerciseAttemptsView;
}

/**
 * The «Ejercicios» tab of a student's page for their teacher (D24): over
 * every attempt the teacher may see, «Ejercicios superados», «Intentos» and
 * «Últimos 7 días»; then the attempts, the latest first, each an
 * `ExerciseAttemptRow` with its mistake behind «Ver el error», and «Ver más»
 * while there are more. Read-only, like the rest of the student's page.
 */
export function StudentExerciseAttemptsSection({ view }: StudentExerciseAttemptsSectionProps) {
  const { attempts, stats, total, page } = view;
  return (
    <div className="student-exercise-attempts">
      <dl className="student-exercise-attempts__stats">
        <div className="student-exercise-attempts__stat">
          <dt className="student-exercise-attempts__stat-label">Ejercicios superados</dt>
          <dd className="student-exercise-attempts__stat-value">{stats.solved}</dd>
        </div>
        <div className="student-exercise-attempts__stat">
          <dt className="student-exercise-attempts__stat-label">Intentos</dt>
          <dd className="student-exercise-attempts__stat-value">{stats.attempts}</dd>
        </div>
        <div className="student-exercise-attempts__stat">
          <dt className="student-exercise-attempts__stat-label">Últimos 7 días</dt>
          <dd className="student-exercise-attempts__stat-value">{stats.lastWeek}</dd>
        </div>
      </dl>

      {attempts.length === 0 ? (
        <EmptyState
          title="Este alumno todavía no ha intentado ningún ejercicio."
          description="Aquí verás cada intento en tus series, con el error de los fallados."
        />
      ) : (
        <ol className="student-exercise-attempts__list" aria-label="Intentos del alumno">
          {attempts.map((attempt) => (
            <ExerciseAttemptRow key={attempt.id} attempt={attempt} />
          ))}
        </ol>
      )}

      {attempts.length < total && (
        <p className="student-exercise-attempts__more">
          <Link
            href={teacherRoutes.studentExercises(view.student.id, { pagina: page + 1 })}
            className="platform-button"
          >
            Ver más
          </Link>
          <span className="student-exercise-attempts__count">
            {attempts.length} de {total}
          </span>
        </p>
      )}
    </div>
  );
}
