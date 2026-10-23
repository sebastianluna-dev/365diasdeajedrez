import { useSyncExternalStore } from "react";

// The student's exercise rating and the solve page's two switches, on the
// client alone while the rating has no table (sample data, to try the screen):
// kept in this browser's storage, an Elo-like change per exercise against its
// difficulty. Nothing of it reaches the server.

const STORAGE_KEY = "exercise-rating-sample";
const START_RATING = 1500;
/** How far one exercise moves the rating. */
const K_FACTOR = 24;

export interface TopicTally {
  attempts: number;
  passed: number;
}

export interface ExerciseRatingState {
  rating: number;
  /** The change the last exercise brought, shown beside the rating. */
  lastDelta: number | null;
  /** «Cuenta para tu puntuación». */
  rated: boolean;
  /** «Pasar al siguiente al resolver». */
  autoNext: boolean;
  /** By topic code: what was tried and passed under «Ejercicios por tema». */
  topics: Record<string, TopicTally>;
}

const DEFAULT_STATE: ExerciseRatingState = {
  rating: START_RATING,
  lastDelta: null,
  rated: true,
  autoNext: false,
  topics: {},
};

let cache: ExerciseRatingState | null = null;
const listeners = new Set<() => void>();

function read(): ExerciseRatingState {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<ExerciseRatingState>) : {};
    cache = { ...DEFAULT_STATE, ...parsed, topics: { ...parsed.topics } };
  } catch {
    cache = DEFAULT_STATE;
  }
  return cache;
}

function write(next: ExerciseRatingState) {
  cache = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage blocked (a private window): the change lives until the page closes.
  }
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useExerciseRating(): ExerciseRatingState {
  return useSyncExternalStore(subscribe, read, () => DEFAULT_STATE);
}

/** The change an exercise of this difficulty brings: `score` 1 solved clean, ½ with a hint, 0 failed. */
export function ratingDeltaOf(rating: number, difficulty: number, score: number): number {
  const expected = 1 / (1 + 10 ** ((difficulty - rating) / 400));
  return Math.round(K_FACTOR * (score - expected));
}

/**
 * Records a finished exercise: the rating moves when it counts, and the topic's
 * tally when it was served by topic. Returns the change, or null when it did not count.
 */
export function recordRatedExercise(input: {
  difficulty: number;
  score: number;
  counts: boolean;
  topicCode: string | null;
}): number | null {
  const current = read();
  const delta = input.counts && current.rated ? ratingDeltaOf(current.rating, input.difficulty, input.score) : null;
  const topics = { ...current.topics };
  if (input.topicCode) {
    const tally = topics[input.topicCode] ?? { attempts: 0, passed: 0 };
    topics[input.topicCode] = { attempts: tally.attempts + 1, passed: tally.passed + (input.score > 0 ? 1 : 0) };
  }
  write({
    ...current,
    rating: delta === null ? current.rating : current.rating + delta,
    lastDelta: delta ?? current.lastDelta,
    topics,
  });
  return delta;
}

export function setRatingSwitch(name: "rated" | "autoNext", on: boolean) {
  write({ ...read(), [name]: on });
}
