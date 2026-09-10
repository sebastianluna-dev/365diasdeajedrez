"use client";

import { type ReactNode, useCallback, useEffect, useReducer, useState } from "react";
import { GameViewer } from "@/components/chess/game-viewer/game-viewer.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice.comp";
import { federationFlag } from "@/lib/chess/federations";
import { autosaveGamePgn } from "@/services/studies/studies.actions";
import type { GameView, StudyGameItem } from "@/services/studies/studies.types";
import { GameAside } from "./game-aside.comp";
import { GameTools, type GameToolsTab } from "./game-tools.comp";
import "./game-view.section.css";

interface GameViewSectionProps {
  game: GameView;
  /** All of the study's games, the current one included: they feed the aside. */
  siblings: StudyGameItem[];
  /** New-game modal; absent in course databases. */
  newGame?: ReactNode;
  /** Game data modal; absent in course databases. */
  editGame?: ReactNode;
  /** What bounced back from a server action (delete without confirming). */
  errorCode?: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  gameInClasses:
    "Esta partida está usada en el contenido de alguna clase. Si la borras, esos bloques se quedarán vacíos. Marca la casilla para confirmarlo.",
};

/** Wait after the last change before saving. */
const AUTOSAVE_DELAY_MS = 1200;

/**
 * How many steps back are remembered. The whole PGN of each one is stored — a
 * game takes a few kilobytes — which is infinitely simpler than keeping a log
 * of inverse operations and cannot drift out of sync.
 */
const HISTORY_LIMIT = 50;

type SaveState = "idle" | "saving" | "saved" | "error";

interface PgnHistory {
  pgn: string;
  /** The previous states, oldest to most recent. */
  past: string[];
}

type PgnAction = { type: "edit"; pgn: string } | { type: "undo" };

/**
 * The PGN and where it has been, in a reducer and not in two loose states:
 * undo has to move both at once, and with `useState` there would be a moment
 * when the history and the PGN do not correspond.
 */
function pgnReducer(state: PgnHistory, action: PgnAction): PgnHistory {
  if (action.type === "undo") {
    const previous = state.past.at(-1);
    return previous === undefined ? state : { pgn: previous, past: state.past.slice(0, -1) };
  }

  // Storing the same PGN twice would spend an undo step that undoes nothing,
  // and that shows: the first Ctrl+Z would seem not to work.
  if (action.pgn === state.pgn) return state;
  return { pgn: action.pgn, past: [...state.past, state.pgn].slice(-HISTORY_LIMIT) };
}

interface PlayerProps {
  name: string;
  elo?: number;
  title?: string;
  country?: string;
  side: "white" | "black";
}

function Player({ name, elo, title, country, side }: PlayerProps) {
  const flag = federationFlag(country);

  return (
    <>
      <span className={`game-view__chip game-view__chip_side_${side}`} aria-hidden="true" />

      {country && <span className="game-view__player-country">{country}</span>}
      {/* The flag decorates the code next to it: if the code is not in the
          table nothing is painted, instead of making one up. */}
      {flag && (
        <span className="game-view__player-flag" aria-hidden="true">
          {flag}
        </span>
      )}
      {title && <span className="game-view__player-title">{title}</span>}

      <span className="game-view__player-name">{name}</span>
      {elo !== undefined && <span className="game-view__player-elo">{elo}</span>}
    </>
  );
}

/**
 * The screen of a Mis estudios game: it is read and annotated in the SAME
 * place.
 *
 * There is no separate editing screen. Whoever owns the game plays on the
 * board to add moves and uses the list's right click to comment, annotate,
 * promote or delete them; all of that saves by itself.
 */
export function GameViewSection({ game, siblings, newGame, editGame, errorCode }: GameViewSectionProps) {
  // The PGN lives here because it is shared by the viewer — which reads and
  // edits it — and the tools panel — which also writes it. If each kept its
  // own, commenting a move would not show in the list until reload.
  const [history, dispatch] = useReducer(pgnReducer, { pgn: game.pgn, past: [] });
  const pgn = history.pgn;
  const applyPgn = useCallback((next: string) => dispatch({ type: "edit", pgn: next }), []);
  const [currentPath, setCurrentPath] = useState("");

  // Ctrl+Z (⌘Z on Mac) undoes the last change to the game. While a comment is
  // being typed the field's own undo rules, which is what anyone expects with
  // the cursor inside a text.
  useEffect(() => {
    if (!game.canEdit) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "z" || event.shiftKey) return;
      if (!event.metaKey && !event.ctrlKey) return;

      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "TEXTAREA" || target.tagName === "INPUT" || target.isContentEditable)) {
        return;
      }

      event.preventDefault();
      dispatch({ type: "undo" });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [game.canEdit]);

  // Which tools tab is open and when to take the focus to it: "Comentar este
  // movimiento" from the move menu opens nothing of its own, it goes down to
  // this panel, which is where one always writes. The counter is what tells
  // apart two consecutive requests on the SAME tab, which in a boolean would
  // be indistinguishable.
  const [toolsTab, setToolsTab] = useState<GameToolsTab>(game.canEdit ? "comment" : "share");
  const [focusRequest, setFocusRequest] = useState(0);

  // The last thing the server confirmed. "There are unsaved changes" is DERIVED
  // by comparing it with the current PGN, instead of being one more state to maintain.
  const [lastSaved, setLastSaved] = useState(game.pgn);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  // Wait until work stops and save the LATEST: if something else changes
  // during the wait, the timer restarts and the intermediate version is never sent.
  useEffect(() => {
    if (!game.canEdit || pgn === lastSaved) return;

    const timer = setTimeout(async () => {
      setSaveState("saving");
      try {
        const result = await autosaveGamePgn(game.studyId, game.id, pgn);
        if (result.ok) {
          setLastSaved(pgn);
          setSaveState("saved");
        } else {
          setSaveState("error");
        }
      } catch {
        setSaveState("error");
      }
    }, AUTOSAVE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [pgn, lastSaved, game.canEdit, game.studyId, game.id]);

  // Warns when the tab is closed with something still unsaved. No request can
  // be awaited here, so the only honest thing to do is ask.
  useEffect(() => {
    if (!game.canEdit) return;
    const handler = (event: BeforeUnloadEvent) => {
      if (pgn !== lastSaved) event.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [game.canEdit, pgn, lastSaved]);

  // The error wins over everything else: if the last write failed it has to
  // be said even if something was written again afterwards.
  const saveLabel =
    !game.canEdit || (saveState === "idle" && pgn === lastSaved)
      ? undefined
      : saveState === "error"
        ? "no se pudo guardar"
        : saveState === "saving"
          ? "guardando…"
          : pgn !== lastSaved
            ? "sin guardar"
            : "guardado";

  return (
    <section className="game-view">
      <GameAside game={game} siblings={siblings} newGame={newGame} editGame={editGame} />

      <div className="game-view__board">
        {errorCode && <PlatformNotice message={ERROR_MESSAGES[errorCode] ?? "No se pudo completar la acción."} />}

        <GameViewer
          pgn={pgn}
          // No header in the panel: the players are already in the board strips
          // and in the aside's record, and repeating them here stole height from
          // the moves, which is what one comes to look at.
          // In Mis estudios the game is traversed: the controls go next to the
          // moves, not under the board.
          controls="panel"
          engine
          editable={game.canEdit}
          onPgnChange={applyPgn}
          // The path goes back and forth: the viewer reports the move and the section
          // feeds it back, which is what lets the evaluation chart take the board to
          // the move being pointed at.
          path={currentPath}
          onPathChange={setCurrentPath}
          onRequestEdit={(mode) => {
            setToolsTab(mode === "comment" ? "comment" : "quality");
            setFocusRequest((count) => count + 1);
          }}
          players={{
            white: (
              <Player
                name={game.white}
                elo={game.whiteElo}
                title={game.whiteTitle}
                country={game.whiteCountry}
                side="white"
              />
            ),
            black: (
              <Player
                name={game.black}
                elo={game.blackElo}
                title={game.blackTitle}
                country={game.blackCountry}
                side="black"
              />
            ),
          }}
          boardFooter={
            <GameTools
              pgn={pgn}
              currentPath={currentPath}
              canEdit={game.canEdit}
              saveLabel={saveLabel}
              tab={toolsTab}
              onTabChange={setToolsTab}
              focusRequest={focusRequest}
              white={game.white}
              black={game.black}
              onSelectPath={setCurrentPath}
              onPgnChange={applyPgn}
            />
          }
        />
      </div>
    </section>
  );
}
