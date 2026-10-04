/** How a game ended for one of its players. */
export type PlayerOutcome = "win" | "loss" | "draw";

const OUTCOMES: Record<string, { white: PlayerOutcome; black: PlayerOutcome }> = {
  "1-0": { white: "win", black: "loss" },
  "0-1": { white: "loss", black: "win" },
  "1/2-1/2": { white: "draw", black: "draw" },
  // The draw as the platform writes it for reading.
  "½-½": { white: "draw", black: "draw" },
};

/**
 * What a PGN result token means for each colour: "1-0" is White's win and
 * Black's loss. `null` for a game that has not ended ("*") or a token that is
 * not a result, so nothing is made up.
 */
export function playerOutcomes(
  result: string | null | undefined,
): { white: PlayerOutcome; black: PlayerOutcome } | null {
  return OUTCOMES[result?.trim() ?? ""] ?? null;
}
