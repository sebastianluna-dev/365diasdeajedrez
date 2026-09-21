export type MoveQuality =
  "brilliant" | "great" | "best" | "excellent" | "good" | "book" | "inaccuracy" | "mistake" | "miss" | "blunder";

/**
 * Move-quality tags keyed by `${moveNumber}${"w" | "b"}`, e.g. `{ "12w": "blunder" }`.
 * Stored on the Payload teacher/mentor game records.
 */
export type MoveAnnotations = Partial<Record<string, MoveQuality>>;
