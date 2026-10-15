// What a game block is made of: the game transcribed in it, or a game of a
// study it cites. The transcription rules when both come; neither is a block
// without a game. Pure module.

export type GameBlockSource =
  { kind: "pgn"; pgn: string } | { kind: "game"; gameId: string } | { error: "blockPgnEmpty" };

/** The source of a game block from what the form sent: the PGN wins over the cited game. */
export function gameBlockSource(input: { pgn?: string | null; gameId?: string | null }): GameBlockSource {
  const pgn = input.pgn?.trim() ?? "";
  if (pgn.length > 0) return { kind: "pgn", pgn };
  const gameId = input.gameId?.trim() ?? "";
  if (gameId.length > 0) return { kind: "game", gameId };
  return { error: "blockPgnEmpty" };
}
