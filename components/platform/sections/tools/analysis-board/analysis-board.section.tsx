"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useEngineClient } from "@/components/chess/engine/use-engine-client.hook";
import { GameViewer, type GameViewerPlay } from "@/components/chess/game-viewer/game-viewer.comp";
import { ArrowRightArrowLeftIcon } from "@/components/icons/arrow-right-arrow-left-icon.comp";
import { BookOpenIcon } from "@/components/icons/book-open-icon.comp";
import { BooksIcon } from "@/components/icons/books-icon.comp";
import { CaretDownIcon } from "@/components/icons/caret-down-icon.comp";
import { CheckIcon } from "@/components/icons/check-icon.comp";
import { ShareNodesIcon } from "@/components/icons/share-nodes-icon.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import type { PlatformPopupHandle } from "@/components/platform/shared/platform-popup/platform-popup.comp";
import { SaveToStudyPopup } from "@/components/platform/shared/save-to-study-popup/save-to-study-popup.comp";
import { usePgnHistory } from "@/components/platform/shared/use-pgn-history.hook";
import { mdFab, mdIconButton } from "@/lib/material/material-classes";
import { numberedMoveLabel } from "@/lib/chess/notation";
import { emptyGame, serializeGame } from "@/lib/chess/pgn-edit";
import { nodeAtPath, parsePgnTree, type PgnTree } from "@/lib/chess/pgn-tree";
import { turnColor } from "@/lib/chess/replay";
import { platformRoutes } from "@/lib/platform-routes";
import { PlayVsEngine } from "./play-vs-engine/play-vs-engine.comp";
import { PositionInput } from "./position-input/position-input.comp";
import { useEngineSparring, type Sparring } from "./use-engine-sparring.hook";
import "./analysis-board.section.css";

/** Where the board keeps its work for the tab: it survives a reload and dies with the tab (A3). */
const STORAGE_KEY = "365:herramientas:tablero";

/** How long «Enlace copiado» stays after the share button copied the link. */
const COPIED_MS = 2000;

interface StoredBoard {
  pgn: string;
  path: string;
}

/** What the tab kept, read once per visit: the board's first state, never a live value. */
let firstReading: StoredBoard | null | undefined;

function readStored(): StoredBoard | null {
  if (firstReading !== undefined) return firstReading;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const value = raw ? (JSON.parse(raw) as Partial<StoredBoard>) : null;
    firstReading = typeof value?.pgn === "string" ? { pgn: value.pgn, path: String(value.path ?? "") } : null;
  } catch {
    firstReading = null;
  }
  return firstReading;
}

const subscribeNever = () => () => {};

interface AnalysisBoardSectionProps {
  /** Where the board opens: a game or a position the URL named; null for an empty board, or what the tab kept. */
  source: { pgn: string; label: string } | null;
  /** The person's own studies, for «Guardar en un estudio». */
  studies: { id: string; name: string }[];
  /** `saveAnalysisToStudy`. */
  saveAction: (formData: FormData) => Promise<void>;
  /** What an action bounced back with (`?error=`), already in words. */
  errorMessage?: string;
}

/**
 * The analysis board (T3) in the new design system (2026-10-23, «M4» of the
 * owner's canvas): a workspace whose side column holds «Guardar en un
 * estudio» as Material's extended FAB, «Cargar» (a FEN or a PGN, K1) and
 * «Jugar contra el módulo» (B), and whose panel holds, under a toolbar with
 * where the board came from, turning it and sharing it, the study's viewer
 * in its material look — the evaluation bar, the board and its tools, the
 * engine's card and the notation. It persists nothing: the tab keeps the
 * work in `sessionStorage` until it is closed.
 *
 * What the tab kept is read in the browser only, so the server draws the
 * starting position and the first browser render takes the kept one; the
 * board is keyed by which of the two it opened with.
 */
export function AnalysisBoardSection({ source, studies, saveAction, errorMessage }: AnalysisBoardSectionProps) {
  const stored = useSyncExternalStore(subscribeNever, readStored, () => null);
  // The next visit reads the tab again.
  useEffect(
    () => () => {
      firstReading = undefined;
    },
    [],
  );
  const start = source ? { pgn: source.pgn, path: "" } : (stored ?? { pgn: serializeGame(emptyGame()), path: "" });
  return (
    <AnalysisBoard
      key={source ? "source" : stored ? "stored" : "empty"}
      initialPgn={start.pgn}
      initialPath={start.path}
      label={source?.label ?? null}
      studies={studies}
      saveAction={saveAction}
      errorMessage={errorMessage}
    />
  );
}

/**
 * What the panel says in the engine's place while the line is played: whose
 * turn it is, and the move that came before — the module's, or the person's
 * while the module thinks.
 */
function headlineOf(tree: PgnTree | null, sparring: Sparring): GameViewerPlay["headline"] {
  const last = tree && sparring.leafPath !== sparring.fromPath ? nodeAtPath(tree, sparring.leafPath) : null;
  const move = last ? numberedMoveLabel(last.ply, last.san) : null;
  if (sparring.status === "your-turn") {
    return { title: "Te toca mover.", detail: move ? `El módulo jugó ${move}.` : undefined };
  }
  return { title: "El módulo piensa…", detail: move ? `Jugaste ${move}.` : undefined };
}

function AnalysisBoard({
  initialPgn,
  initialPath,
  label,
  studies,
  saveAction,
  errorMessage,
}: {
  initialPgn: string;
  initialPath: string;
  label: string | null;
  studies: { id: string; name: string }[];
  saveAction: (formData: FormData) => Promise<void>;
  errorMessage?: string;
}) {
  const { pgn, applyPgn } = usePgnHistory(initialPgn, { undo: true });
  const [path, setPath] = useState(initialPath);
  // A loaded position starts the viewer again from its first move.
  const [loads, setLoads] = useState(0);
  // The side the board is seen from: turned from the toolbar, and to the
  // person's colour when a line against the module starts.
  const [orientation, setOrientation] = useState<"white" | "black">("white");
  const [copied, setCopied] = useState(false);
  // One engine for the analysis and the module (planning §7): the WASM is
  // compiled once, on arrival, and never again on this page.
  const engine = useEngineClient(true);
  const { sparring, start, stop, move } = useEngineSparring({ pgn, applyPgn, shared: engine });
  const savePopup = useRef<PlatformPopupHandle>(null);

  // The work, kept for the tab — once there is work: writing the untouched
  // start would make the next reading of the tab flip the board it opened with.
  useEffect(() => {
    if (pgn === initialPgn && path === initialPath) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ pgn, path }));
    } catch {
      // A tab without storage keeps the board for as long as it is open.
    }
  }, [pgn, path, initialPgn, initialPath]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), COPIED_MS);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const tree = useMemo(() => parsePgnTree(pgn), [pgn]);
  const fen = (tree && (path ? nodeAtPath(tree, path)?.fen : tree.initialFen)) ?? tree?.initialFen ?? "";
  const toMove = fen ? turnColor(fen) : "white";
  const playingOn = sparring !== null && sparring.status !== "over";

  /** «Compartir»: the link to the position on the board, which opens it on anyone's board. */
  const share = async () => {
    if (!fen) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${platformRoutes.analysisBoard({ fen })}`);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="platform-workspace analysis-board">
      <div className="platform-workspace__side">
        <div className="analysis-board__side">
          <button
            type="button"
            className={`${mdFab("primary-container")} analysis-board__save`}
            onClick={(event) => savePopup.current?.open(event)}
          >
            <BooksIcon variant="classic-solid" className="platform-md-icon" />
            Guardar en un estudio
          </button>

          <details className="analysis-board__group" open>
            <summary className="analysis-board__group-title">
              <CaretDownIcon variant="classic-solid" className="analysis-board__caret" />
              Cargar
            </summary>
            <PositionInput
              onLoad={(next) => {
                stop();
                applyPgn(next);
                setPath("");
                setLoads((count) => count + 1);
              }}
            />
          </details>

          <details className="analysis-board__group" open>
            <summary className="analysis-board__group-title">
              <CaretDownIcon variant="classic-solid" className="analysis-board__caret" />
              Jugar contra el módulo
            </summary>
            <PlayVsEngine
              sideToMove={toMove}
              playing={sparring}
              onStart={(color) => {
                setOrientation(color);
                start(color, path);
              }}
              onStop={stop}
            />
          </details>
        </div>
      </div>

      <section className="platform-workspace__panel analysis-board__panel" aria-labelledby="analysis-board-title">
        {/* The page's name is the bar's, drawn beside its drawing; here it is
            said to a screen reader, as the page's heading. */}
        <h1 id="analysis-board-title" className="analysis-board__title">
          Tablero de análisis
        </h1>
        <div className="analysis-board__toolbar">
          {label && (
            <span className="analysis-board__source">
              <BookOpenIcon className="analysis-board__source-icon" />
              {label}
            </span>
          )}
          <span className="analysis-board__actions">
            <button
              type="button"
              className={mdIconButton("standard", "sm")}
              aria-label="Girar el tablero"
              title="Girar el tablero"
              onClick={() => setOrientation((side) => (side === "white" ? "black" : "white"))}
            >
              <ArrowRightArrowLeftIcon className="platform-md-icon analysis-board__flip-icon" />
            </button>
            <button
              type="button"
              className={mdIconButton("standard", "sm")}
              aria-label="Copiar el enlace de esta posición"
              title="Copiar el enlace de esta posición"
              onClick={share}
            >
              {copied ? (
                <CheckIcon variant="classic-solid" className="platform-md-icon analysis-board__copied" />
              ) : (
                <ShareNodesIcon className="platform-md-icon" />
              )}
            </button>
            <span className="analysis-board__status" role="status" aria-live="polite">
              {copied ? "Enlace copiado" : ""}
            </span>
          </span>
        </div>

        {errorMessage && <PlatformNotice message={errorMessage} />}

        <GameViewer
          key={loads}
          pgn={pgn}
          initialPath={loads === 0 ? initialPath : ""}
          orientation={orientation}
          // Turned from the toolbar above, not from the keys.
          flipKey={false}
          look="material"
          controls="panel"
          engine
          engineClient={engine}
          editable
          onPgnChange={applyPgn}
          tools={{}}
          onPathChange={setPath}
          interaction={playingOn ? "play" : "edit"}
          play={
            sparring && playingOn
              ? {
                  color: sparring.color,
                  status: sparring.status === "your-turn" ? "your-turn" : "thinking",
                  onMove: move,
                  fromPath: sparring.fromPath,
                  leafPath: sparring.leafPath,
                  headline: headlineOf(tree, sparring),
                }
              : undefined
          }
        />
      </section>

      <SaveToStudyPopup
        ref={savePopup}
        studies={studies}
        defaultTitle="Análisis"
        action={saveAction}
        pgn={pgn}
        onCancel={() => savePopup.current?.close()}
      />
    </div>
  );
}
