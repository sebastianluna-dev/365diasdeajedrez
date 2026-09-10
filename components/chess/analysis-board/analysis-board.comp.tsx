"use client";

import type { DrawShape } from "@lichess-org/chessground/draw";
import type { Game, PgnNodeData } from "chessops/pgn";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChessBoard } from "@/components/chess/chess-board.comp";
import { MoveTree } from "@/components/chess/game-viewer/move-tree.comp";
import { ChevronIcon } from "@/components/icons/chevron-icon.comp";
import { FlipIcon } from "@/components/icons/flip-icon.comp";
import { SkipIcon } from "@/components/icons/skip-icon.comp";
import { PGN_MAX_LENGTH } from "@/constants/platform/content-limits.const";
import {
  addMove,
  commentTextAt,
  deleteFrom,
  emptyGame,
  parseEditableGame,
  pathOfNode,
  nodeAtPathIn,
  promoteOneStep,
  promoteToMainLine,
  serializeGame,
  setCommentText,
  setNags,
  setShapes,
  variationPgn,
} from "@/lib/chess/pgn-edit";
import { numberedMoveLabel } from "@/lib/chess/notation";
import {
  endPathOf,
  MOVE_QUALITY_NAGS,
  nextPathOf,
  nodeAtPath,
  parentPathOf,
  parsePgnTree,
  POSITION_EVAL_NAGS,
  type NagOption,
} from "@/lib/chess/pgn-tree";
import {
  MoveContextMenu,
  type MoveContextMenuTarget,
} from "@/components/chess/game-viewer/move-context-menu.comp";
import "./analysis-board.comp.css";

// EDITABLE analysis board: moves are played on the board and written into
// the list; going back and playing something else opens a variation.
//
// It does not replace `GameViewer`, which remains the student's read-only
// viewer. This component mounts inside a <form> and publishes the resulting
// PGN in a hidden input, so saving is an ordinary submit and the server
// action does not need to know anything about it.
//
// All the chess logic lives in lib/chess/pgn-edit.ts; here there is only
// interface state.

interface AnalysisBoardProps {
  /** Name of the hidden input the PGN travels in. */
  name: string;
  defaultPgn?: string;
  /** Starting position when there is no previous PGN. */
  initialFen?: string;
  orientation?: "white" | "black";
  /**
   * Saves on its own, without a button. Returns whether the write succeeded.
   *
   * Optional on purpose: without it the component behaves as always — hidden
   * input and the form's button — which is what the staff lesson editor still
   * needs, where every save marks the frozen exercises as stale and autosaving
   * would invalidate them non-stop while typing.
   */
  onAutoSave?: (pgn: string) => Promise<boolean>;
}

/** Wait after the last change before saving. */
const AUTOSAVE_DELAY_MS = 1500;

type SaveStatus = "idle" | "saving" | "saved" | "error";

type EditorTab = "comment" | "quality";

function buildInitialGame(defaultPgn: string | undefined, initialFen: string | undefined): Game<PgnNodeData> {
  const parsed = defaultPgn && defaultPgn.trim().length > 0 ? parseEditableGame(defaultPgn) : null;
  return parsed ?? emptyGame(initialFen);
}

export function AnalysisBoard({
  name,
  defaultPgn,
  initialFen,
  orientation = "white",
  onAutoSave,
}: AnalysisBoardProps) {
  // The mutable game is the source of truth; the serialised PGN is what is
  // rendered and what is sent. It is reserialised after every change instead of
  // keeping two representations that could drift apart.
  // The starting game and its PGN are computed ONCE and live in state, not in
  // a ref: `baseline` is what decides whether there are unsaved changes, and
  // reading it during render has to be legitimate.
  const [baseline] = useState(() => {
    const game = buildInitialGame(defaultPgn, initialFen);
    return { game, pgn: serializeGame(game) };
  });
  const gameRef = useRef<Game<PgnNodeData>>(baseline.game);
  const [pgn, setPgn] = useState(baseline.pgn);

  const [currentPath, setCurrentPath] = useState("");
  const [flipToggled, setFlipToggled] = useState(false);
  const [tab, setTab] = useState<EditorTab>("comment");
  const [menu, setMenu] = useState<MoveContextMenuTarget | null>(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteDraft, setPasteDraft] = useState("");
  const [pasteError, setPasteError] = useState<string | null>(null);
  const commentRef = useRef<HTMLTextAreaElement>(null);

  const tree = useMemo(() => parsePgnTree(pgn), [pgn]);
  const node = tree ? nodeAtPath(tree, currentPath) : undefined;
  const isDirty = pgn !== baseline.pgn;

  // The last thing the server confirmed. "There are unsaved changes" is DERIVED
  // by comparing it with the current PGN, instead of being stored as one more
  // piece of state: that way there are no two truths that could drift apart.
  const [lastSaved, setLastSaved] = useState(baseline.pgn);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  // By reference so the timer does not depend on the consumer of the
  // component memoising the callback.
  const onAutoSaveRef = useRef(onAutoSave);
  useEffect(() => {
    onAutoSaveRef.current = onAutoSave;
  }, [onAutoSave]);

  const sync = useCallback(() => {
    setPgn(serializeGame(gameRef.current));
  }, []);

  // The comment is edited with its own draft: on save it is trimmed, and
  // without a draft one could not even type a space — the value would come
  // back trimmed and the cursor would jump.
  useEffect(() => {
    setCommentDraft(commentTextAt(gameRef.current, currentPath));
  }, [currentPath, pgn]);

  // Autosave: wait until typing stops and save the LATEST. If something else
  // changes during the wait, the timer restarts and the intermediate version
  // is never sent.
  useEffect(() => {
    if (!onAutoSave || pgn === lastSaved) return;

    const timer = setTimeout(async () => {
      setSaveStatus("saving");
      try {
        if (await onAutoSaveRef.current?.(pgn)) {
          setLastSaved(pgn);
          setSaveStatus("saved");
        } else {
          setSaveStatus("error");
        }
      } catch {
        setSaveStatus("error");
      }
    }, AUTOSAVE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [pgn, lastSaved, onAutoSave]);

  // Warns when the tab is closed with something still unsaved. No request can
  // be awaited here, so the only honest thing to do is ask.
  useEffect(() => {
    if (!onAutoSave) return;
    const handler = (event: BeforeUnloadEvent) => {
      if (pgn !== lastSaved) event.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [onAutoSave, pgn, lastSaved]);

  const goToStart = useCallback(() => setCurrentPath(""), []);
  const goToPrevious = useCallback(() => setCurrentPath((path) => parentPathOf(path)), []);
  const goToNext = useCallback(() => {
    if (!tree) return;
    setCurrentPath((path) => nextPathOf(tree, path) ?? path);
  }, [tree]);
  const goToEnd = useCallback(() => {
    if (!tree) return;
    setCurrentPath((path) => endPathOf(tree, path));
  }, [tree]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // The arrow keys navigate except while typing.
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "TEXTAREA" || target.tagName === "INPUT")) return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goToNext();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToPrevious();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrevious]);

  const handleMove = useCallback(
    (san: string) => {
      const result = addMove(gameRef.current, currentPath, san);
      if (!result) return;
      setCurrentPath(result.path);
      sync();
    },
    [currentPath, sync],
  );

  const handleShapes = useCallback(
    (shapes: DrawShape[]) => {
      setShapes(gameRef.current, currentPath, shapes);
      sync();
    },
    [currentPath, sync],
  );

  const handleComment = useCallback(
    (text: string) => {
      setCommentDraft(text);
      setCommentText(gameRef.current, currentPath, text);
      sync();
    },
    [currentPath, sync],
  );

  /** Choosing within a group replaces whatever THAT group had. */
  const toggleNag = useCallback(
    (option: NagOption, group: NagOption[]) => {
      if (currentPath.length === 0) return;
      const currentNags = nodeAtPathIn(gameRef.current, currentPath)?.data.nags ?? [];
      const groupNags = new Set(group.map((entry) => entry.nag));
      const others = currentNags.filter((nag) => !groupNags.has(nag));
      const next = currentNags.includes(option.nag) ? others : [...others, option.nag];

      setNags(gameRef.current, currentPath, next);
      sync();
    },
    [currentPath, sync],
  );

  /**
   * Mutates and stays where it belongs.
   *
   * Promoting and deleting reindex the siblings, so the current path may stop
   * pointing at the same move. That is why the REFERENCE to the node is kept
   * before mutating and the node is asked again where it ended up.
   */
  const mutateKeepingPlace = useCallback(
    (path: string, mutate: () => void, fallbackToParent = false) => {
      const node = nodeAtPathIn(gameRef.current, path);
      mutate();

      const stillThere = node ? pathOfNode(gameRef.current, node) : null;
      setCurrentPath(fallbackToParent || stillThere === null ? parentPathOf(path) : stillThere);
      sync();
      setMenu(null);
    },
    [sync],
  );

  const handlePaste = () => {
    const parsed = parseEditableGame(pasteDraft);
    if (!parsed || pasteDraft.trim().length === 0) {
      setPasteError("No se puede leer ese PGN. Revísalo antes de cargarlo.");
      return;
    }
    gameRef.current = parsed;
    setCurrentPath("");
    setPasteError(null);
    setPasteOpen(false);
    setPasteDraft("");
    sync();
  };

  const discardChanges = () => {
    gameRef.current = buildInitialGame(defaultPgn, initialFen);
    setCurrentPath("");
    setPgn(baseline.pgn);
  };

  // The notice comes from comparing, not from parallel state. The error wins
  // over everything else: if the last write failed it has to be said even if
  // something was written again afterwards.
  const saveTone: SaveStatus | "unsaved" =
    saveStatus === "error" ? "error" : saveStatus === "saving" ? "saving" : pgn !== lastSaved ? "unsaved" : saveStatus;
  const saveLabel =
    saveTone === "error"
      ? "No se pudo guardar. Sigue intentándolo o copia el PGN antes de salir."
      : saveTone === "saving"
        ? "Guardando…"
        : saveTone === "unsaved"
          ? "Cambios sin guardar…"
          : saveTone === "saved"
            ? "Guardado"
            : null;

  const flipBoard = (orientation === "black") !== flipToggled;
  const activeNags = node?.nags ?? [];

  return (
    <div className="analysis-board">
      {/* What gets sent. Everything else is controls to compose it. */}
      <input type="hidden" name={name} value={pgn} readOnly />

      {tree && tree.warnings.length > 0 && (
        <ul className="analysis-board__warnings">
          {tree.warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      )}

      <div className="analysis-board__layout">
        <div className="analysis-board__board">
          <ChessBoard
            position={{
              fen: node?.fen ?? tree?.initialFen ?? initialFen ?? "",
              lastMove: node?.lastMove,
              check: node?.check ?? false,
              shapes: node ? node.shapes : (tree?.initialShapes ?? []),
            }}
            flipBoard={flipBoard}
            interactive
            onMove={handleMove}
            editableShapes
            onShapesChange={handleShapes}
          />
          <p className="analysis-board__hint">
            Mueve sobre el tablero para añadir jugadas. Vuelve atrás y juega otra cosa para abrir una variante.
            Clic derecho arrastrando dibuja flechas; clic derecho sobre una jugada abre su menú.
          </p>
        </div>

        <div className="analysis-board__panel">
          <div className="analysis-board__moves">
            {tree && tree.children.length > 0 ? (
              <MoveTree
                tree={tree}
                currentPath={currentPath}
                onSelect={setCurrentPath}
                onContextMenu={(path, event) => {
                  const target = nodeAtPath(tree, path);
                  setMenu({
                    path,
                    x: event.clientX,
                    y: event.clientY,
                    label: target ? numberedMoveLabel(target.ply, target.san) : "esta jugada",
                    // The path segments ARE the child indexes: all zeros means the move
                    // is already the main line.
                    canPromote: !path.split(".").every((segment) => segment === "0"),
                    // And the last segment, its place among its siblings.
                    canPromoteOneStep: path.split(".").at(-1) !== "0",
                  });
                }}
              />
            ) : (
              <p className="analysis-board__empty">Todavía no hay jugadas.</p>
            )}
          </div>

          <div className="analysis-board__toolbar">
            <button
              type="button"
              aria-label="Voltear tablero"
              onClick={() => setFlipToggled((current) => !current)}
              className="analysis-board__tool"
            >
              <FlipIcon />
            </button>
            <button type="button" aria-label="Ir al inicio" onClick={goToStart} className="analysis-board__tool">
              <span className="analysis-board__tool-icon_flipped">
                <SkipIcon />
              </span>
            </button>
            <button type="button" aria-label="Jugada anterior" onClick={goToPrevious} className="analysis-board__tool">
              <span className="analysis-board__tool-icon_flipped">
                <ChevronIcon />
              </span>
            </button>
            <button type="button" aria-label="Jugada siguiente" onClick={goToNext} className="analysis-board__tool">
              <ChevronIcon />
            </button>
            <button type="button" aria-label="Ir al final" onClick={goToEnd} className="analysis-board__tool">
              <SkipIcon />
            </button>
          </div>

          <div className="analysis-board__tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={tab === "comment"}
              className="analysis-board__tab"
              onClick={() => setTab("comment")}
            >
              Comentario
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "quality"}
              className="analysis-board__tab"
              onClick={() => setTab("quality")}
            >
              Calidad
            </button>
          </div>

          {tab === "comment" ? (
            <div className="analysis-board__tabpanel">
              <textarea
                ref={commentRef}
                className="analysis-board__comment"
                value={commentDraft}
                rows={4}
                placeholder={
                  currentPath.length === 0
                    ? "Comentario de la posición inicial"
                    : "Comentario de la jugada seleccionada"
                }
                onChange={(event) => handleComment(event.target.value)}
              />
              <p className="analysis-board__note">
                Las flechas que dibujes se guardan junto a este comentario, y editarlo no las borra.
              </p>
            </div>
          ) : (
            <div className="analysis-board__tabpanel">
              {currentPath.length === 0 ? (
                <p className="analysis-board__note">Elige una jugada para anotarla.</p>
              ) : (
                <>
                  <p className="analysis-board__group-title">Calidad de la jugada</p>
                  <div className="analysis-board__glyphs">
                    {MOVE_QUALITY_NAGS.map((option) => (
                      <button
                        key={option.nag}
                        type="button"
                        title={option.label}
                        aria-label={option.label}
                        aria-pressed={activeNags.includes(option.nag)}
                        className={`analysis-board__glyph${activeNags.includes(option.nag) ? " analysis-board__glyph_active" : ""}`}
                        onClick={() => toggleNag(option, MOVE_QUALITY_NAGS)}
                      >
                        {option.glyph}
                      </button>
                    ))}
                  </div>

                  <p className="analysis-board__group-title">Evaluación de la posición</p>
                  <div className="analysis-board__glyphs">
                    {POSITION_EVAL_NAGS.map((option) => (
                      <button
                        key={option.nag}
                        type="button"
                        title={option.label}
                        aria-label={option.label}
                        aria-pressed={activeNags.includes(option.nag)}
                        className={`analysis-board__glyph${activeNags.includes(option.nag) ? " analysis-board__glyph_active" : ""}`}
                        onClick={() => toggleNag(option, POSITION_EVAL_NAGS)}
                      >
                        {option.glyph}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="analysis-board__footer">
        <button type="button" className="platform-button platform-button_variant_secondary" onClick={() => setPasteOpen((open) => !open)}>
          {pasteOpen ? "Cerrar" : "Pegar un PGN"}
        </button>
        {onAutoSave ? (
          saveLabel && (
            <span
              className={`analysis-board__save analysis-board__save_state_${saveTone}`}
              role="status"
              aria-live="polite"
            >
              {saveLabel}
            </span>
          )
        ) : (
          isDirty && (
            <>
              <span className="analysis-board__dirty">Hay cambios sin guardar.</span>
              <button type="button" className="platform-button platform-button_variant_secondary" onClick={discardChanges}>
                Descartar cambios
              </button>
            </>
          )
        )}
      </div>

      {pasteOpen && (
        <div className="analysis-board__paste">
          <textarea
            className="analysis-board__paste-input"
            value={pasteDraft}
            rows={8}
            maxLength={PGN_MAX_LENGTH}
            placeholder="Pega aquí un PGN completo para reemplazar el análisis."
            onChange={(event) => setPasteDraft(event.target.value)}
          />
          {pasteError && (
            <p className="analysis-board__paste-error" role="alert">
              {pasteError}
            </p>
          )}
          <button type="button" className="platform-button" onClick={handlePaste}>
            Cargar este PGN
          </button>
        </div>
      )}

      {menu && (
        <MoveContextMenu
          target={menu}
          onPromoteToMainLine={() => mutateKeepingPlace(menu.path, () => promoteToMainLine(gameRef.current, menu.path))}
          onPromoteOneStep={() => mutateKeepingPlace(menu.path, () => promoteOneStep(gameRef.current, menu.path))}
          onDelete={() => mutateKeepingPlace(menu.path, () => deleteFrom(gameRef.current, menu.path), true)}
          // Here commenting and annotating already have a fixed place under the
          // list: the menu only leads to it with the move already selected.
          onComment={() => {
            setCurrentPath(menu.path);
            setTab("comment");
            setMenu(null);
            // Focus on the next frame: the tab has just changed and the field is
            // not in the tree yet.
            requestAnimationFrame(() => commentRef.current?.focus());
          }}
          onAnnotate={() => {
            setCurrentPath(menu.path);
            setTab("quality");
            setMenu(null);
          }}
          onCopyVariation={async () => {
            const text = variationPgn(gameRef.current, menu.path);
            if (!text) return;
            try {
              await navigator.clipboard.writeText(text);
            } catch {
              // Without clipboard permission the full PGN is still in the "Paste a
              // PGN" field to copy it by hand.
            }
          }}
          onClose={() => setMenu(null)}
        />
      )}
    </div>
  );
}
