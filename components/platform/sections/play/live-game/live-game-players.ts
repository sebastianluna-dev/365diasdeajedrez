import type { PlayerEnding, PlayerInfo } from "@/components/chess/game-viewer/player-strip.comp";
import type { GameEnd, GameEndKind } from "@/lib/chess/game-end";
import { sideToMove } from "@/lib/chess/live-game";
import type { LiveGameState } from "@/lib/play/live-game-machine";
import type { PlayedGameView, PlayedSeat } from "@/services/play/play.types";

// What each strip of a played game says, as a pure function of the game, the
// live state and who is looking: the portraits, whose turn it is, «Pensando…»,
// and once it is over who won and why (G6).

/** The line under the name once the game is over. */
const REASONS: Record<GameEndKind, string> = {
  checkmate: "por jaque mate",
  stalemate: "por ahogado",
  "insufficient-material": "por material insuficiente",
  threefold: "por triple repetición",
  "fifty-moves": "por cincuenta jugadas",
  resignation: "por abandono",
  abandoned: "por abandono",
  aborted: "partida anulada",
  timeout: "por tiempo",
  "draw-agreed": "por acuerdo",
};

/** The ending of one seat; none for a cancelled game, which nobody won or lost. */
export function endingOf(end: GameEnd, color: "white" | "black", isViewer: boolean): PlayerEnding | undefined {
  const reason = REASONS[end.kind];
  if (end.kind === "aborted") return undefined;
  if (end.winner === null) return { kind: "draw", label: "Tablas", reason };
  if (end.winner === color) return { kind: "win", label: isViewer ? "Ganaste" : "Ganó", reason };
  return { kind: "loss", label: "Perdió", reason };
}

/** The strips of a played game, by colour, as the viewer draws them. */
export function liveGamePlayers(
  game: Pick<PlayedGameView, "white" | "black" | "viewerSeat">,
  state: Pick<LiveGameState, "status" | "initialFen" | "sans" | "end">,
): { white: PlayerInfo; black: PlayerInfo } {
  const mover = sideToMove(state);
  const live = state.end === null && state.status !== "stale" && state.status !== "engine-failed";

  const seatInfo = (seat: PlayedSeat, color: "white" | "black"): PlayerInfo => {
    const isViewer = game.viewerSeat === color;
    const toMove = live && mover === color;
    const thinking = seat.kind === "bot" && toMove && state.status !== "human-turn";
    return {
      name: seat.name,
      elo: seat.kind === "bot" && seat.elo !== null ? seat.elo : undefined,
      title: seat.title ?? undefined,
      avatar: { ...seat.avatar, busy: thinking },
      turn: live ? toMove : undefined,
      status: !live
        ? undefined
        : thinking
          ? state.status === "booting"
            ? "Preparándose…"
            : "Pensando…"
          : isViewer && toMove && state.status === "human-turn"
            ? "Te toca mover"
            : undefined,
      clock: null,
      ending: state.end ? endingOf(state.end, color, isViewer) : undefined,
    };
  };

  return { white: seatInfo(game.white, "white"), black: seatInfo(game.black, "black") };
}
