export function parsePgnMoves(pgn: string): string[] {
  const movetext = pgn
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith("["))
    .join(" ");

  return movetext
    .replace(/\{[^}]*\}/g, " ")
    .replace(/\([^)]*\)/g, " ")
    .replace(/\d+\.(\.\.)?/g, " ")
    .replace(/1-0|0-1|1\/2-1\/2|\*/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}
