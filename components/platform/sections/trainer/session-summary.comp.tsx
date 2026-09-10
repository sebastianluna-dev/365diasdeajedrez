import Link from "next/link";
import { platformRoutes } from "@/lib/platform-routes";
import "./session-summary.comp.css";

export interface ExerciseResult {
  exerciseId: string;
  lessonName: string;
  passed: boolean;
  mistakes: number;
}

interface SessionSummaryProps {
  results: ExerciseResult[];
}

export function SessionSummary({ results }: SessionSummaryProps) {
  const passedCount = results.filter((result) => result.passed).length;
  const totalMistakes = results.reduce((sum, result) => sum + result.mistakes, 0);

  return (
    <div className="platform-card session-summary">
      <h2 className="platform-card__title">Sesión terminada</h2>

      <p className="session-summary__totals">
        {passedCount} de {results.length} ejercicios superados · {totalMistakes}{" "}
        {totalMistakes === 1 ? "error" : "errores"} en total
      </p>

      <ul className="session-summary__list">
        {results.map((result, position) => (
          <li key={`${result.exerciseId}-${position}`} className="session-summary__item">
            <span
              className={`session-summary__result session-summary__result_${result.passed ? "passed" : "failed"}`}
            >
              {result.passed ? "✓" : "✗"}
            </span>
            <span className="session-summary__lesson">{result.lessonName}</span>
            <span className="session-summary__mistakes">
              {result.mistakes} {result.mistakes === 1 ? "error" : "errores"}
            </span>
          </li>
        ))}
      </ul>

      <div className="session-summary__actions">
        <Link href={platformRoutes.trainer} className="platform-button">
          Volver al Move Trainer
        </Link>
        <Link href={platformRoutes.dashboard} className="platform-button platform-button_variant_secondary">
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
