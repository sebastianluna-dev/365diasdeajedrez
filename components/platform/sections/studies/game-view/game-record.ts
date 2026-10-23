import type { GameViewerRecord } from "@/components/chess/game-viewer/game-viewer.comp";
import { openingOfEco } from "@/lib/chess/eco-openings";
import type { GameView } from "@/services/studies/studies.types";

/**
 * The record of a study's game as the viewer heads its moves' column with it
 * (2026-10-23; until then a card of its own, `GameRecord`, spanning the panel
 * above the board): the event as its title, the round, the date and the place
 * in one line, and what was played — the opening, by its code and its name,
 * and how many moves — as facts.
 *
 * Only what the game HAS is given: a fact that is missing takes no place, so
 * the card is as tall as its game is documented. The result is not here: the
 * list of games and the players' strips already say it. The pencil is the
 * section's to add, since the form it opens is.
 */
export function gameRecordOf(game: GameView): Omit<GameViewerRecord, "edit"> {
  const context = [game.round ? `Ronda ${game.round}` : undefined, game.playedAtLabel, game.site].filter(
    (part): part is string => Boolean(part),
  );
  // Read from the code and not stored: the name cannot disagree with it.
  const opening = game.eco ? openingOfEco(game.eco) : undefined;
  const facts: GameViewerRecord["facts"] = [];
  if (game.eco) facts.push({ kind: "opening", text: game.eco, detail: opening, srLabel: "Apertura, código ECO: " });
  if (game.moveCount > 0) {
    facts.push({ kind: "moves", text: `${game.moveCount} ${game.moveCount === 1 ? "jugada" : "jugadas"}` });
  }
  const isEmpty = !game.event && context.length === 0 && facts.length === 0;

  return {
    label: "Datos de la partida",
    title: game.event,
    context: context.length > 0 ? context.join(" · ") : undefined,
    facts,
    empty: isEmpty ? "Esta partida aún no tiene datos." : undefined,
  };
}
