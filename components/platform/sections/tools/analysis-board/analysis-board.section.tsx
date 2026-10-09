"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useEngineClient } from "@/components/chess/engine/use-engine-client.hook";
import { GameViewer } from "@/components/chess/game-viewer/game-viewer.comp";
import { FloppyDiskIcon } from "@/components/icons/floppy-disk-icon.comp";
import type { PlatformPopupHandle } from "@/components/platform/shared/platform-popup/platform-popup.comp";
import { SaveToStudyPopup } from "@/components/platform/shared/save-to-study-popup/save-to-study-popup.comp";
import { usePgnHistory } from "@/components/platform/shared/use-pgn-history.hook";
import { emptyGame, serializeGame } from "@/lib/chess/pgn-edit";
import { nodeAtPath, parsePgnTree } from "@/lib/chess/pgn-tree";
import { turnColor } from "@/lib/chess/replay";
import { PlayVsEngine } from "./play-vs-engine/play-vs-engine.comp";
import { PositionInput } from "./position-input/position-input.comp";
import { useEngineSparring } from "./use-engine-sparring.hook";
import "./analysis-board.section.css";

/** Where the board keeps its work for the tab: it survives a reload and dies with the tab (A3). */
const STORAGE_KEY = "365:herramientas:tablero";

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
}

/**
 * The analysis board (T3): the study's viewer — the notation with its
 * variations, the engine, the tools under the board — with nothing beside it
 * but the game, a FEN or PGN to load under it (K1), the module to play the
 * position against (B), and «Guardar en un estudio». It persists nothing: the
 * tab keeps the work in `sessionStorage` until it is closed.
 *
 * What the tab kept is read in the browser only, so the server draws the
 * starting position and the first browser render takes the kept one; the
 * board is keyed by which of the two it opened with.
 */
export function AnalysisBoardSection({ source, studies, saveAction }: AnalysisBoardSectionProps) {
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
    />
  );
}

function AnalysisBoard({
  initialPgn,
  initialPath,
  label,
  studies,
  saveAction,
}: {
  initialPgn: string;
  initialPath: string;
  label: string | null;
  studies: { id: string; name: string }[];
  saveAction: (formData: FormData) => Promise<void>;
}) {
  const { pgn, applyPgn } = usePgnHistory(initialPgn, { undo: true });
  const [path, setPath] = useState(initialPath);
  // A loaded position starts the viewer again from its first move.
  const [loads, setLoads] = useState(0);
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

  const tree = useMemo(() => parsePgnTree(pgn), [pgn]);
  const fen = (tree && (path ? nodeAtPath(tree, path)?.fen : tree.initialFen)) ?? tree?.initialFen ?? "";
  const toMove = fen ? turnColor(fen) : "white";

  return (
    <div className="analysis-board">
      {label && <p className="analysis-board__source">{label}</p>}

      {sparring && <PlayVsEngine sideToMove={toMove} playing={sparring} onStart={() => undefined} onStop={stop} />}

      <GameViewer
        key={loads}
        pgn={pgn}
        initialPath={loads === 0 ? initialPath : ""}
        controls="panel"
        engine
        engineClient={engine}
        editable
        onPgnChange={applyPgn}
        tools={{}}
        onPathChange={setPath}
        interaction={sparring && sparring.status !== "over" ? "play" : "edit"}
        play={
          sparring && sparring.status !== "over"
            ? {
                color: sparring.color,
                status: sparring.status === "your-turn" ? "your-turn" : "thinking",
                onMove: move,
                fromPath: sparring.fromPath,
                leafPath: sparring.leafPath,
              }
            : undefined
        }
      />

      <div className="analysis-board__below">
        <PositionInput
          onLoad={(next) => {
            stop();
            applyPgn(next);
            setPath("");
            setLoads((count) => count + 1);
          }}
        />
        <div className="analysis-board__side">
          {!sparring && (
            <PlayVsEngine sideToMove={toMove} playing={null} onStart={(color) => start(color, path)} onStop={stop} />
          )}
          <button
            type="button"
            className="platform-button analysis-board__save"
            onClick={(event) => savePopup.current?.open(event)}
          >
            <FloppyDiskIcon variant="classic-solid" className="platform-button__icon" />
            Guardar en un estudio
          </button>
        </div>
      </div>

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
