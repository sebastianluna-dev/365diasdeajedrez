import Link from "next/link";
import { PlayerAvatar } from "@/components/chess/player-avatar/player-avatar.comp";
import { StaticDiagram } from "@/components/chess/static-diagram.comp";
import { formatRelativeSpanish } from "@/lib/format-relative-spanish";
import { platformRoutes } from "@/lib/platform-routes";
import type { PlayedGameCard as PlayedGameCardData } from "@/services/play/play.types";
import "./played-game-card.comp.css";
import "./result-badge.comp.css";

/** «17 jugadas», «1 jugada», «sin jugadas». */
export function movesText(moves: number): string {
  if (moves === 0) return "sin jugadas";
  return `${moves} ${moves === 1 ? "jugada" : "jugadas"}`;
}

/**
 * A played game as a card (L2), like a study's card: the final position from
 * the person's side with the result in a corner, the rival, and a line of
 * facts. The whole card opens the game — to go on with it while it is open.
 */
export function PlayedGameCard({ game, now }: { game: PlayedGameCardData; now?: Date }) {
  const facts = [
    game.isOpen ? "En curso" : game.terminationLabel,
    movesText(game.moves),
    formatRelativeSpanish(game.at, now),
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <Link href={platformRoutes.playedGame(game.id)} className="played-game-card">
      <span className="played-game-card__board">
        <StaticDiagram fen={game.finalFen} orientation={game.color} />
        <span className="played-game-card__result">
          <ResultBadge game={game} />
        </span>
      </span>
      <span className="played-game-card__who">
        <PlayerAvatar {...game.rival.avatar} size="sm" />
        <span className="played-game-card__name">{game.rival.name}</span>
        {game.rival.elo !== null && <span className="played-game-card__elo">{game.rival.elo}</span>}
      </span>
      <span className="played-game-card__facts">{facts}</span>
    </Link>
  );
}

/** How a game went from the person's side, in one letter or word. */
export function resultOf(
  game: Pick<PlayedGameCardData, "outcome" | "isOpen">,
): "win" | "loss" | "draw" | "open" | "aborted" {
  if (game.outcome) return game.outcome;
  return game.isOpen ? "open" : "aborted";
}

const BADGES = {
  win: { text: "G", label: "Ganada" },
  loss: { text: "P", label: "Perdida" },
  draw: { text: "T", label: "Tablas" },
  open: { text: "En curso", label: "En curso" },
  aborted: { text: "Anulada", label: "Anulada" },
} as const;

/** «G», «P», «T» in the result's colour, or «En curso» and «Anulada» as words: a played game's corner (L2, L4). */
export function ResultBadge({ game }: { game: Pick<PlayedGameCardData, "outcome" | "isOpen"> }) {
  const result = resultOf(game);
  const badge = BADGES[result];
  return (
    <span className={`result-badge result-badge_result_${result}`} aria-label={badge.label} title={badge.label}>
      <span aria-hidden="true">{badge.text}</span>
    </span>
  );
}
