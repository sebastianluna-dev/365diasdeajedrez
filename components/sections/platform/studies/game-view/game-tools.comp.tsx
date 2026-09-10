"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { commentTextAt, parseEditableGame, serializeGame, setCommentText, setNags } from "@/lib/chess/pgn-edit";
import {
  MOVE_QUALITY_NAGS,
  MOVE_REMARK_NAGS,
  nagCodeFor,
  nagCodesOf,
  nagGlyph,
  nodeAtPath,
  parsePgnTree,
  POSITION_EVAL_NAGS,
  type NagOption,
} from "@/lib/chess/pgn-tree";
import { GameReview } from "@/components/common/game-viewer/game-review.comp";
import { sanToSpanish } from "@/lib/chess/notation";
import { plainMovetext } from "@/lib/chess/plain-movetext";
import "./game-tools.comp.css";

export type GameToolsTab = "comment" | "quality" | "review" | "share";

/**
 * The three groups, split into two columns: on the left what qualifies THE
 * MOVE — how it was and what happens in the game — and on the right how the
 * position stands. It is the time-honoured layout of chess programs, and it
 * fits whole without scrolling.
 *
 * Each group is exclusive inside: a move is not "!" and "?" at once, but it
 * can be "!" with "→" and "±".
 */
const NAG_COLUMNS: { title: string; options: NagOption[] }[][] = [
  [
    { title: "Jugada", options: MOVE_QUALITY_NAGS },
    { title: "Matices", options: MOVE_REMARK_NAGS },
  ],
  [{ title: "Posición", options: POSITION_EVAL_NAGS }],
];

interface GameToolsProps {
  pgn: string;
  /** Dotted path of the move selected in the viewer. */
  currentPath: string;
  /** Course databases are read-only: there only sharing remains. */
  canEdit: boolean;
  /**
   * How the autosave is going, which the section handles: here and in the
   * viewer the SAME PGN is written, so the notice has to be a single one.
   */
  saveLabel?: string;
  /**
   * The tab is controlled by the section because the move menu, which is in the
   * viewer, changes it too: "Comentar este movimiento" opens THIS panel.
   */
  tab: GameToolsTab;
  onTabChange: (tab: GameToolsTab) => void;
  /**
   * Counter that goes up every time someone asks to write here. When it
   * changes, the panel takes focus and scrolls into view; it is a counter and
   * not a boolean so two consecutive requests on the same tab can be told apart.
   */
  focusRequest: number;
  /** The names, for the evaluation's accuracy cards. */
  white: string;
  black: string;
  /** Take the board to a move, which is what the chart does when clicked. */
  onSelectPath: (path: string) => void;
  onPgnChange: (pgn: string) => void;
}

export function GameTools({
  pgn,
  currentPath,
  canEdit,
  saveLabel,
  tab,
  onTabChange,
  focusRequest,
  white,
  black,
  onSelectPath,
  onPgnChange,
}: GameToolsProps) {
  const [copied, setCopied] = useState<"fen" | "pgn" | "plain" | null>(null);
  // What is being generated, so it cannot be pressed twice meanwhile: a
  // sixty-frame GIF takes its time and gives no notice by itself.
  const [exporting, setExporting] = useState<"image" | "gif" | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const commentRef = useRef<HTMLTextAreaElement>(null);

  // Arriving here from the move menu has to leave the cursor ready to type:
  // otherwise the action would only switch a tab that is out of view and it
  // would look like it did nothing.
  useEffect(() => {
    if (focusRequest === 0) return;

    rootRef.current?.scrollIntoView({ block: "nearest" });
    const textarea = commentRef.current;
    if (tab !== "comment" || !textarea) return;
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
  }, [focusRequest, tab]);

  const tree = useMemo(() => parsePgnTree(pgn), [pgn]);
  const node = tree && currentPath ? nodeAtPath(tree, currentPath) : undefined;
  const fen = node?.fen ?? tree?.initialFen ?? "";
  const moveName = node ? sanToSpanish(node.san) : "la posición de partida";

  // The comment and the NAGs are read from the PGN, not from state of their
  // own: that way what is seen is always what is saved and there are no two truths to sync.
  const comment = useMemo(() => {
    const game = parseEditableGame(pgn);
    return game ? commentTextAt(game, currentPath) : "";
  }, [pgn, currentPath]);

  const nags = node?.nags ?? [];
  const plainPgn = useMemo(() => plainMovetext(pgn), [pgn]);
  const glyphs = nags.map(nagGlyph).join("");

  // The paired signs (white/black) are written according to whose move it is;
  // in the starting position there is none and the panel is off.
  const isWhiteMove = node ? node.ply % 2 === 1 : true;

  /**
   * The NAGs left after pressing an option: those of the OTHER groups are kept,
   * and within its own the chosen one replaces whatever was there — or is
   * removed, if it was itself.
   */
  const nextNags = (group: NagOption[], option: NagOption): number[] => {
    const code = nagCodeFor(option, isWhiteMove);
    const inGroup = new Set(group.flatMap(nagCodesOf));
    const others = nags.filter((nag) => !inGroup.has(nag));
    return nags.includes(code) ? others : [...others, code];
  };

  /** Applies a change to the PGN; saving it is the section's job. */
  const apply = (mutate: (game: NonNullable<ReturnType<typeof parseEditableGame>>) => boolean) => {
    const game = parseEditableGame(pgn);
    if (!game || !mutate(game)) return;

    onPgnChange(serializeGame(game));
  };

  const copy = async (text: string, what: "fen" | "pgn" | "plain") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      // Without clipboard permission the field is still there to select by hand.
    }
  };

  // The export (and with it `gifenc` and the board rasterising) loads when the
  // button is pressed: almost nobody exports, and before it travelled with every game.
  const exportImage = async () => {
    setExporting("image");
    setExportError(null);
    try {
      const { downloadPositionImage } = await import("@/components/common/game-viewer/board-export");
      await downloadPositionImage(fen, "posicion.png", { size: 720, lastMove: node?.lastMove });
    } catch {
      setExportError("No se pudo generar la imagen en este navegador.");
    } finally {
      setExporting(null);
    }
  };

  const exportGif = async () => {
    setExporting("gif");
    setExportError(null);
    try {
      const { downloadGameGif } = await import("@/components/common/game-viewer/board-export");
      await downloadGameGif(pgn, "partida.gif");
    } catch {
      setExportError("No se pudo generar el GIF en este navegador.");
    } finally {
      setExporting(null);
    }
  };

  const tabs: { key: GameToolsTab; label: string }[] = [
    ...(canEdit ? ([{ key: "comment", label: "Comentario" }, { key: "quality", label: "Calidad" }] as const) : []),
    { key: "review", label: "Evaluación" },
    { key: "share", label: "Compartir" },
  ];

  return (
    <div className="game-tools" ref={rootRef}>
      <div className="game-tools__tabs" role="tablist" aria-label="Herramientas de la partida">
        {tabs.map((option) => (
          <button
            key={option.key}
            type="button"
            role="tab"
            aria-selected={tab === option.key}
            onClick={() => onTabChange(option.key)}
            className={`game-tools__tab${tab === option.key ? " game-tools__tab_state_active" : ""}`}
          >
            {option.label}
            {/* What the move already carries, on the tab itself: a dot if it is
                commented and its signs if it is annotated. That way one knows what
                is inside without going in to look. */}
            {option.key === "comment" && comment.length > 0 && (
              <span className="game-tools__tab-dot" aria-hidden="true" />
            )}
            {option.key === "quality" && glyphs.length > 0 && (
              <span className="game-tools__tab-badge">{glyphs}</span>
            )}
          </button>
        ))}

        <span className="game-tools__target">
          {moveName}
          {saveLabel && ` · ${saveLabel}`}
        </span>
      </div>

      {tab === "comment" && (
        <div className="game-tools__panel">
          <textarea
            ref={commentRef}
            // Also remounted when the saved comment changes: the same move can be
            // commented from its right-click menu, and the field has to find out.
            key={`${currentPath}:${comment}`}
            defaultValue={comment}
            placeholder="Comentario de esta jugada"
            className="game-tools__textarea"
            onBlur={(event) => {
              if (event.target.value === comment) return;
              apply((game) => setCommentText(game, currentPath, event.target.value));
            }}
          />
          <p className="game-tools__hint">
            Se guarda al salir del campo. Las flechas del tablero se conservan junto al comentario.
          </p>
        </div>
      )}

      {tab === "quality" && (
        <>
          <div className="game-tools__nags">
            {NAG_COLUMNS.map((groups, column) => (
              <div key={column} className="game-tools__nag-column">
                {groups.map((group) => (
                  <div key={group.title} className="game-tools__nag-group">
                    <p className="game-tools__nag-title">{group.title}</p>

                    {group.options.map((option) => {
                      const code = nagCodeFor(option, isWhiteMove);
                      const active = nags.includes(code);
                      return (
                        <button
                          key={option.nag}
                          type="button"
                          disabled={!node}
                          title={option.label}
                          aria-pressed={active}
                          onClick={() =>
                            apply((game) => setNags(game, currentPath, nextNags(group.options, option)))
                          }
                          className={`game-tools__nag${active ? " game-tools__nag_state_active" : ""}`}
                        >
                          <span className="game-tools__nag-glyph">{option.glyph}</span>
                          <span className="game-tools__nag-label">{option.short}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <p className="game-tools__foot">
            {node
              ? "Un signo de jugada y uno de posición. Se guarda dentro del PGN."
              : "Elige una jugada de la lista para calificarla."}
          </p>
        </>
      )}

      {tab === "review" && (
        <GameReview
          pgn={pgn}
          canEdit={canEdit}
          white={white}
          black={black}
          currentPath={currentPath}
          onSelectPath={onSelectPath}
          onPgnChange={onPgnChange}
        />
      )}

      {tab === "share" && (
        <div className="game-tools__panel">
          <div className="game-tools__share">
            <div className="game-tools__share-text">
              <span className="game-tools__share-label">FEN de esta posición</span>
              <span className="game-tools__share-value game-tools__share-value_kind_code">{fen}</span>
            </div>
            <button type="button" className="game-tools__share-button" onClick={() => void copy(fen, "fen")}>
              {copied === "fen" ? "Copiado" : "Copiar"}
            </button>
          </div>

          <div className="game-tools__share">
            <div className="game-tools__share-text">
              <span className="game-tools__share-label">PGN completo</span>
              <span className="game-tools__share-value">Con cabeceras, comentarios y signos</span>
            </div>
            <button type="button" className="game-tools__share-button" onClick={() => void copy(pgn, "pgn")}>
              {copied === "pgn" ? "Copiado" : "Copiar"}
            </button>
          </div>

          {/* The bare moves, to paste elsewhere: no variations, no comments,
              no mention of whose game it is. */}
          <div className="game-tools__share">
            <div className="game-tools__share-text">
              <span className="game-tools__share-label">Sólo la línea principal</span>
              <span className="game-tools__share-value game-tools__share-value_kind_code">
                {plainPgn ?? "Esta partida no tiene jugadas."}
              </span>
            </div>
            <button
              type="button"
              disabled={plainPgn === null}
              className="game-tools__share-button"
              onClick={() => plainPgn && void copy(plainPgn, "plain")}
            >
              {copied === "plain" ? "Copiado" : "Copiar"}
            </button>
          </div>

          <div className="game-tools__export">
            <button
              type="button"
              disabled={exporting !== null}
              className="game-tools__export-button"
              onClick={() => void exportImage()}
            >
              {exporting === "image" ? "Generando…" : "Posición (PNG)"}
            </button>
            <button
              type="button"
              disabled={exporting !== null}
              className="game-tools__export-button"
              onClick={() => void exportGif()}
            >
              {exporting === "gif" ? "Generando…" : "Partida (GIF)"}
            </button>
          </div>

          {exportError && <p className="game-tools__hint game-tools__hint_state_error">{exportError}</p>}
        </div>
      )}
    </div>
  );
}
