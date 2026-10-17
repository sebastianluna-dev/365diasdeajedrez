import { SAMPLE_EXERCISES } from "@/constants/platform/exercise-samples.const";
import type { ExerciseHistoryRow, ExerciseHistorySource } from "./exercise-history.types";

// The sample history of the front-only phase 6 (EXERCISES_PERSISTENCE_ENABLED
// off): a dozen attempts of the last two months over the sample exercises,
// one of each outcome and source, so the filters have something to narrow.
// Dated from `now`, so the «últimos 7 días» pill always has rows.

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

interface SampleAttempt {
  exercise: number;
  daysAgo: number;
  outcome: ExerciseHistoryRow["outcome"];
  source: ExerciseHistorySource;
  whereLabel: string;
  durationLabel: string | null;
  /** The first wrong move, for a failed one: as the diagram draws it. */
  mistake?: { playedLabel: string; expectedLabel: string; from: string; playedTo: string; expectedTo: string };
}

const ATTEMPTS: SampleAttempt[] = [
  {
    exercise: 0,
    daysAgo: 0.2,
    outcome: "solved",
    source: "series",
    whereLabel: "Serie: Táctica de la semana",
    durationLabel: "18 s",
  },
  {
    exercise: 1,
    daysAgo: 0.3,
    outcome: "failed",
    source: "series",
    whereLabel: "Serie: Táctica de la semana",
    durationLabel: "41 s",
    mistake: { playedLabel: "Ta2", expectedLabel: "Ta1#", from: "a8", playedTo: "a2", expectedTo: "a1" },
  },
  {
    exercise: 11,
    daysAgo: 1.1,
    outcome: "hinted",
    source: "practice",
    whereLabel: "Práctica libre",
    durationLabel: "1 min 5 s",
  },
  {
    exercise: 5,
    daysAgo: 2.4,
    outcome: "solutionShown",
    source: "practice",
    whereLabel: "Práctica libre",
    durationLabel: "2 min 10 s",
  },
  {
    exercise: 3,
    daysAgo: 3.6,
    outcome: "solved",
    source: "class",
    whereLabel: "Clase: Taller de finales de torre",
    durationLabel: "25 s",
  },
  {
    exercise: 6,
    daysAgo: 5.2,
    outcome: "failed",
    source: "class",
    whereLabel: "Clase del mié 14 oct",
    durationLabel: "33 s",
    mistake: { playedLabel: "Dc7", expectedLabel: "Dxc8#", from: "c1", playedTo: "c7", expectedTo: "c8" },
  },
  {
    exercise: 12,
    daysAgo: 9,
    outcome: "solved",
    source: "course",
    whereLabel: "Lección: La defensa Philidor",
    durationLabel: "52 s",
  },
  {
    exercise: 13,
    daysAgo: 12,
    outcome: "hinted",
    source: "course",
    whereLabel: "Lección: El puente de Lucena",
    durationLabel: "1 min 40 s",
  },
  {
    exercise: 16,
    daysAgo: 18,
    outcome: "solved",
    source: "series",
    whereLabel: "Serie: Mates y golpes tácticos",
    durationLabel: "29 s",
  },
  {
    exercise: 17,
    daysAgo: 26,
    outcome: "failed",
    source: "practice",
    whereLabel: "Práctica libre",
    durationLabel: "47 s",
    mistake: { playedLabel: "Tb7", expectedLabel: "Ta7", from: "b1", playedTo: "b7", expectedTo: "a7" },
  },
  {
    exercise: 8,
    daysAgo: 38,
    outcome: "solved",
    source: "practice",
    whereLabel: "Práctica libre",
    durationLabel: "15 s",
  },
  {
    exercise: 19,
    daysAgo: 55,
    outcome: "solutionShown",
    source: "series",
    whereLabel: "Serie: Táctica de la semana",
    durationLabel: null,
  },
];

const OUTCOME_LABELS: Record<ExerciseHistoryRow["outcome"], string> = {
  solved: "Resuelto",
  hinted: "Resuelto con pista",
  failed: "Fallado",
  solutionShown: "Vio la solución",
};

/** The sample rows, the latest first, dated from `now`. */
export function sampleExerciseHistory(now: Date): ExerciseHistoryRow[] {
  return ATTEMPTS.map((attempt, index) => {
    const exercise = SAMPLE_EXERCISES[attempt.exercise] ?? SAMPLE_EXERCISES[0]!;
    const at = new Date(now.getTime() - attempt.daysAgo * DAY);
    const fen = /\[FEN "([^"]+)"\]/.exec(exercise.solutionPgn)?.[1] ?? "";
    return {
      id: `muestra-intento-${index + 1}`,
      title: exercise.title,
      href: null,
      atIso: at.toISOString(),
      atLabel: at.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" }),
      outcome: attempt.outcome,
      outcomeLabel: OUTCOME_LABELS[attempt.outcome],
      whereLabel: attempt.whereLabel,
      durationLabel: attempt.durationLabel,
      mistake: attempt.mistake
        ? {
            fen,
            orientation: fen.split(" ")[1] === "b" ? "black" : "white",
            playedLabel: attempt.mistake.playedLabel,
            expectedLabel: attempt.mistake.expectedLabel,
            arrows: [
              { from: attempt.mistake.from, to: attempt.mistake.expectedTo, tone: "success" },
              { from: attempt.mistake.from, to: attempt.mistake.playedTo, tone: "danger" },
            ],
          }
        : null,
      source: attempt.source,
      retryHref: null,
    };
  });
}
