"use client";

import type { DrawShape } from "@lichess-org/chessground/draw";
import type { Game, PgnNodeData } from "chessops/pgn";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChessBoard } from "@/components/common/chess-board.comp";
import { MoveTree } from "@/components/common/game-viewer/move-tree.comp";
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
} from "@/lib/chess/pgn-edit";
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
import { MoveContextMenu, type MoveContextMenuTarget } from "./move-context-menu.comp";
import "./analysis-board.comp.css";

// Tablero de análisis EDITABLE: se juega sobre el tablero y las jugadas se
// escriben en la lista; volver atrás y jugar otra cosa abre una variante.
//
// No sustituye a `GameViewer`, que sigue siendo el visor de sólo lectura del
// alumno. Este componente se monta dentro de un <form> y publica el PGN
// resultante en un input oculto, así que guardar es un envío normal y la acción
// del servidor no tiene que saber nada de él.
//
// Toda la lógica de ajedrez vive en lib/chess/pgn-edit.ts; aquí sólo hay estado
// de interfaz.

interface AnalysisBoardProps {
  /** Nombre del input oculto donde viaja el PGN. */
  name: string;
  defaultPgn?: string;
  /** Posición de partida cuando no hay PGN previo. */
  initialFen?: string;
  orientation?: "white" | "black";
}

type EditorTab = "comment" | "quality";

function buildInitialGame(defaultPgn: string | undefined, initialFen: string | undefined): Game<PgnNodeData> {
  const parsed = defaultPgn && defaultPgn.trim().length > 0 ? parseEditableGame(defaultPgn) : null;
  return parsed ?? emptyGame(initialFen);
}

export function AnalysisBoard({ name, defaultPgn, initialFen, orientation = "white" }: AnalysisBoardProps) {
  // El juego mutable es la fuente de verdad; el PGN serializado es lo que se
  // pinta y lo que se envía. Se reserializa tras cada cambio en vez de mantener
  // dos representaciones que se puedan desincronizar.
  // El juego de partida y su PGN se calculan UNA vez y viven en estado, no en
  // una ref: `baseline` es lo que decide si hay cambios sin guardar, y leerlo
  // durante el render tiene que ser legítimo.
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

  const tree = useMemo(() => parsePgnTree(pgn), [pgn]);
  const node = tree ? nodeAtPath(tree, currentPath) : undefined;
  const isDirty = pgn !== baseline.pgn;

  const sync = useCallback(() => {
    setPgn(serializeGame(gameRef.current));
  }, []);

  // El comentario se edita con borrador propio: al guardarlo se recorta, y sin
  // borrador no se podría ni teclear un espacio —el valor volvería recortado y
  // el cursor saltaría—.
  useEffect(() => {
    setCommentDraft(commentTextAt(gameRef.current, currentPath));
  }, [currentPath, pgn]);

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
      // Las flechas navegan salvo mientras se escribe.
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

  /** Elegir dentro de un grupo sustituye lo que hubiera de ESE grupo. */
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
   * Muta y se queda donde toca.
   *
   * Promover y borrar reindexan a los hermanos, así que la ruta actual puede
   * dejar de señalar la misma jugada. Por eso se guarda la REFERENCIA al nodo
   * antes de mutar y se le vuelve a preguntar dónde ha quedado.
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

  const flipBoard = (orientation === "black") !== flipToggled;
  const activeNags = node?.nags ?? [];

  return (
    <div className="analysis-board">
      {/* Lo que se envía. Todo lo demás son controles para componerlo. */}
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
                onContextMenu={(path, event) =>
                  setMenu({
                    path,
                    x: event.clientX,
                    y: event.clientY,
                    // Los segmentos de la ruta SON los índices de hijo: todo
                    // ceros significa que la jugada ya es la línea principal.
                    canPromote: !path.split(".").every((segment) => segment === "0"),
                    // Y el último segmento, su puesto entre las hermanas.
                    canPromoteOneStep: path.split(".").at(-1) !== "0",
                  })
                }
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
        <button type="button" className="platform-button" onClick={() => setPasteOpen((open) => !open)}>
          {pasteOpen ? "Cerrar" : "Pegar un PGN"}
        </button>
        {isDirty && (
          <>
            <span className="analysis-board__dirty">Hay cambios sin guardar.</span>
            <button type="button" className="platform-button" onClick={discardChanges}>
              Descartar cambios
            </button>
          </>
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
          onClose={() => setMenu(null)}
        />
      )}
    </div>
  );
}
