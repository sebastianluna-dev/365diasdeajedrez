"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { BotScoreboardProps } from "@/components/chess/bot-scoreboard/bot-scoreboard.comp";
import { GameViewer } from "@/components/chess/game-viewer/game-viewer.comp";
import type { PlatformPopupHandle } from "@/components/platform/shared/platform-popup/platform-popup.comp";
import { SaveToStudyPopup } from "@/components/platform/shared/save-to-study-popup/save-to-study-popup.comp";
import type { BotStrength } from "@/lib/chess/bots/bot-strength";
import { toPgn } from "@/lib/chess/live-game";
import { sanToSpanish } from "@/lib/chess/notation";
import { playStatusOf } from "@/lib/play/play-status";
import { platformRoutes } from "@/lib/platform-routes";
import { storePlayedGameReview } from "@/services/play/play.actions";
import type { PlayedGameView } from "@/services/play/play.types";
import { AbandonPopup } from "./abandon-popup/abandon-popup.comp";
import { LiveGameBanner } from "./live-game-banner/live-game-banner.comp";
import { liveGamePlayers } from "./live-game-players";
import { useLiveGame } from "./use-live-game.hook";
import "./live-game.section.css";

/** The PGN token of a result. */
const RESULT_TOKEN = { WHITE_WINS: "1-0", BLACK_WINS: "0-1", DRAW: "1/2-1/2", ONGOING: "*" } as const;

/** The main line's path at `ply`: one `0` per move. */
const leafPath = (ply: number) => Array.from({ length: ply }, () => "0").join(".");

interface LiveGameSectionProps {
  game: PlayedGameView;
  /** How the bot plays; null when the viewer holds no seat or the game is over. */
  strength: BotStrength | null;
  /** The record against this bot, for under the board once it is over. */
  scoreboard: BotScoreboardProps | null;
  studies: { id: string; name: string }[];
  /** `rematchPlayedGame`, bound to this game; null for whoever only reads it. */
  rematch: (() => Promise<void>) | null;
  /** `copyPlayedGameToStudy`, bound to this game. */
  copyToStudy: (formData: FormData) => Promise<void>;
  /** The game on the analysis board; null while that board is switched off. */
  analysisBoardHref: string | null;
}

/**
 * A game against a bot (P2, G6), the leaf with state: the live game
 * (`useLiveGame`) on the one viewer, the popups it opens, and what is said
 * when the board stops. Over, the viewer reads the game with its tools — the
 * review is «Analizar» — and the actions go under the board. Whoever only
 * reads it (their teacher, the staff) gets the board and the moves.
 */
export function LiveGameSection({
  game,
  strength,
  scoreboard,
  studies,
  rematch,
  copyToStudy,
  analysisBoardHref,
}: LiveGameSectionProps) {
  const router = useRouter();
  const seated = game.viewerSeat !== null;
  const snapshot = useMemo(
    () => ({ initialFen: game.initialFen, sans: game.sans, humanColor: game.viewerSeat ?? "white", end: game.end }),
    // The page's first answer is where the game resumes; a later refresh only brings the scoreboard.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the snapshot is read once, on mount
    [],
  );
  const { state, move, abandon } = useLiveGame({ gameId: game.id, snapshot, strength, seated });
  const over = state.status === "over";
  const status = playStatusOf(state);

  // Once the game ends here, the server's record of it (the scoreboard) is read again.
  const endedHere = useRef(false);
  useEffect(() => {
    if (!over || game.end || endedHere.current) return;
    endedHere.current = true;
    router.refresh();
  }, [over, game.end, router]);

  const livePgn = useMemo(
    () =>
      toPgn(
        { initialFen: state.initialFen, sans: state.sans },
        {
          White: game.white.name,
          Black: game.black.name,
          Result: state.end ? RESULT_TOKEN[state.end.resultCode] : "*",
        },
      ) ?? game.pgn,
    [state.initialFen, state.sans, state.end, game.white.name, game.black.name, game.pgn],
  );
  // A game finished before this visit is read from the server, with its review's evaluations.
  const [annotated, setAnnotated] = useState<string | null>(game.end ? game.pgn : null);
  const pgn = annotated ?? livePgn;

  const storeReview = (next: string) => {
    setAnnotated(next);
    void storePlayedGameReview(game.id, next);
  };

  const abandonPopup = useRef<PlatformPopupHandle>(null);
  const savePopup = useRef<PlatformPopupHandle>(null);
  // Whoever only reads the game sees who is to move and how it ended, nothing live.
  const players = liveGamePlayers(game, seated ? state : { ...state, status: "over", end: game.end });
  const bot = game.white.kind === "bot" ? game.white : game.black;
  const announcement = announce(state, bot.name, game.viewerSeat);

  return (
    <div className="live-game">
      {(state.status === "stale" || state.status === "engine-failed") && (
        <LiveGameBanner kind={state.status} onReload={() => window.location.reload()} />
      )}

      <GameViewer
        pgn={pgn}
        initialPath={leafPath(state.sans.length)}
        orientation={game.viewerSeat ?? "white"}
        controls="panel"
        players={players}
        interaction={seated && !over ? "play" : "read"}
        tools={over ? {} : undefined}
        onPgnChange={over && seated ? storeReview : undefined}
        play={
          seated
            ? {
                color: game.viewerSeat ?? "white",
                status,
                onMove: move,
                onAbandon: (event) => abandonPopup.current?.open(event),
                over:
                  over && rematch && state.end?.kind !== "aborted"
                    ? {
                        scoreboard,
                        rematch,
                        otherOpponentHref: platformRoutes.play,
                        analysisBoardHref,
                        onSave: (event) => savePopup.current?.open(event),
                      }
                    : undefined,
              }
            : undefined
        }
      />

      <p className="live-game__announcer" aria-live="polite">
        {announcement}
      </p>

      {seated && (
        <>
          <AbandonPopup
            ref={abandonPopup}
            onAbandon={async () => {
              await abandon();
              abandonPopup.current?.close();
            }}
            onCancel={() => abandonPopup.current?.close()}
          />
          <SaveToStudyPopup
            ref={savePopup}
            studies={studies}
            defaultTitle={`${game.white.name} – ${game.black.name}`}
            action={copyToStudy}
            onCancel={() => savePopup.current?.close()}
          />
        </>
      )}
    </div>
  );
}

/** What a screen reader is told after each step: the bot's move and whose turn it is, or how it ended. */
function announce(
  state: ReturnType<typeof useLiveGame>["state"],
  botName: string,
  seat: "white" | "black" | null,
): string {
  if (state.status === "over" && state.end) {
    if (state.end.kind === "aborted") return "Partida anulada.";
    if (state.end.winner === null) return "Tablas.";
    return state.end.winner === seat ? "Ganaste." : `${botName} ganó.`;
  }
  const last = state.sans.at(-1);
  if (state.status === "human-turn" && last && state.sans.length > 0)
    return `${botName} jugó ${sanToSpanish(last)}. Tu turno.`;
  if (state.status === "human-turn") return "Tu turno.";
  return "";
}
