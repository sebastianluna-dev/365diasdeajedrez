"use client";

import { useState } from "react";
import { ExerciseAttemptRow } from "@/components/platform/shared/exercise-attempt-row/exercise-attempt-row.comp";
import { EmptyState } from "@/components/platform/shared/empty-state/empty-state.comp";
import { PlatformSelect } from "@/components/platform/shared/platform-select/platform-select.comp";
import { mdButton } from "@/lib/material/material-classes";
import {
  EXERCISE_HISTORY_DEFAULT_FILTERS,
  EXERCISE_HISTORY_PAGE_SIZE,
  filterExerciseHistory,
  type ExerciseHistoryFilters,
  type ExerciseHistoryRow,
} from "@/services/exercises/exercise-history.types";
import "./exercise-history.comp.css";

interface ExerciseHistoryProps {
  /** Every scored attempt of the student, as the server (or the sample) hands them. */
  rows: ExerciseHistoryRow[];
  /** The instant the periods are counted from, the server's, so the client agrees with it. */
  nowIso: string;
  /** While nothing persists, the rows are a sample and the page says so. */
  sample?: boolean;
}

const RESULT_OPTIONS = [
  { value: "all", label: "Todos los resultados" },
  { value: "solved", label: "Resueltos" },
  { value: "failed", label: "Fallados" },
];

const SOURCE_OPTIONS = [
  { value: "all", label: "De todas partes" },
  { value: "series", label: "Series" },
  { value: "course", label: "Cursos" },
  { value: "class", label: "Clases" },
  { value: "practice", label: "Práctica libre" },
];

const PERIOD_OPTIONS = [
  { value: "7", label: "Últimos 7 días" },
  { value: "30", label: "Últimos 30 días" },
  { value: "all", label: "Todo" },
];

/**
 * «Historial» (D51; PLAN.md §9, phase 6): every scored attempt of the
 * student, the latest first, each as the row their teacher reads
 * (`ExerciseAttemptRow`: where, when, how it went, the mistake to unfold),
 * narrowed by three filters that are not a form — the result, where it came
 * from and the period —, and shown a page at a time («Ver más»). The
 * filtering runs here, over the rows the page handed over. In the new design
 * system (2026-10-23) the rows run across the panel as Gmail lists mail and
 * the filters are small outlined triggers.
 */
export function ExerciseHistory({ rows, nowIso, sample = false }: ExerciseHistoryProps) {
  const [filters, setFilters] = useState<ExerciseHistoryFilters>(EXERCISE_HISTORY_DEFAULT_FILTERS);
  const [pages, setPages] = useState(1);
  const now = new Date(nowIso);
  const matching = filterExerciseHistory(rows, filters, now);
  const shown = matching.slice(0, pages * EXERCISE_HISTORY_PAGE_SIZE);
  const change = (patch: Partial<ExerciseHistoryFilters>) => {
    setFilters((current) => ({ ...current, ...patch }));
    setPages(1);
  };

  return (
    <div className="exercise-history">
      {sample && (
        <p className="exercise-history__sample">
          Datos de muestra: los intentos reales aparecerán aquí cuando la persistencia esté activa.
        </p>
      )}
      <div className="exercise-history__filters" role="group" aria-label="Filtros del historial">
        <PlatformSelect
          tone="accent"
          aria-label="Resultado"
          className="exercise-history__filter"
          options={RESULT_OPTIONS}
          value={filters.result}
          onValueChange={(value) => change({ result: value as ExerciseHistoryFilters["result"] })}
        />
        <PlatformSelect
          tone="accent"
          aria-label="De dónde"
          className="exercise-history__filter"
          options={SOURCE_OPTIONS}
          value={filters.source}
          onValueChange={(value) => change({ source: value as ExerciseHistoryFilters["source"] })}
        />
        <PlatformSelect
          tone="accent"
          aria-label="Periodo"
          className="exercise-history__filter"
          options={PERIOD_OPTIONS}
          value={filters.period}
          onValueChange={(value) => change({ period: value as ExerciseHistoryFilters["period"] })}
        />
      </div>

      <p className="exercise-history__count" aria-live="polite">
        {matching.length === 0
          ? "Ningún intento con esos filtros."
          : matching.length === 1
            ? "1 intento"
            : `${matching.length} intentos`}
      </p>

      {rows.length === 0 ? (
        <EmptyState
          title="Todavía no has intentado ningún ejercicio."
          description="Cuando resuelvas uno, aparecerá aquí con su resultado."
        />
      ) : shown.length === 0 ? null : (
        <ul className="exercise-history__list">
          {shown.map((row) => (
            <ExerciseAttemptRow key={row.id} attempt={row} look="material" />
          ))}
        </ul>
      )}

      {shown.length < matching.length && (
        <div className="exercise-history__more">
          <button type="button" className={mdButton("outlined", "sm")} onClick={() => setPages((count) => count + 1)}>
            Ver más
          </button>
          <span className="exercise-history__more-count">
            {shown.length} de {matching.length}
          </span>
        </div>
      )}
    </div>
  );
}
