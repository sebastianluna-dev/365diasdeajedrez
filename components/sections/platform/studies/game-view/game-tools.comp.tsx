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
import { downloadGameGif, downloadPositionImage } from "@/components/common/game-viewer/board-export";
import { GameReview } from "@/components/common/game-viewer/game-review.comp";
import { mainlinePositions } from "@/components/common/game-viewer/mainline-positions";
import { reviewGame } from "@/lib/chess/game-review";
import { sanToSpanish } from "@/lib/chess/notation";
import { plainMovetext } from "@/lib/chess/plain-movetext";
import "./game-tools.comp.css";

export type GameToolsTab = "comment" | "quality" | "review" | "share";

/**
 * Los tres grupos, repartidos en dos columnas: a la izquierda lo que califica
 * LA JUGADA —cómo fue y qué pasa en la partida— y a la derecha cómo queda la
 * posición. Es la disposición de toda la vida en los programas de ajedrez, y
 * cabe entera sin desplazarse.
 *
 * Cada grupo es excluyente por dentro: una jugada no es «!» y «?» a la vez,
 * pero sí puede ser «!» con «→» y «±».
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
  /** Ruta punteada de la jugada seleccionada en el visor. */
  currentPath: string;
  /** Las bases de curso son de sólo lectura: allí sólo queda compartir. */
  canEdit: boolean;
  /**
   * Cómo va el autoguardado, que lo lleva la sección: aquí y en el visor se
   * escribe sobre el MISMO PGN, así que el aviso tiene que ser uno solo.
   */
  saveLabel?: string;
  /**
   * La pestaña la manda la sección porque el menú de la jugada, que está en el
   * visor, también la cambia: «Comentar este movimiento» abre ESTE panel.
   */
  tab: GameToolsTab;
  onTabChange: (tab: GameToolsTab) => void;
  /**
   * Contador que sube cada vez que alguien pide escribir aquí. Al cambiar, el
   * panel se trae el foco y se pone a la vista; es un contador y no un booleano
   * para que dos peticiones seguidas sobre la misma pestaña se distingan.
   */
  focusRequest: number;
  /** Los nombres, para las tarjetas de precisión de la evaluación. */
  white: string;
  black: string;
  /** Llevar el tablero a una jugada, que es lo que hace la gráfica al pulsarla. */
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
  // Qué se está generando, para no dejar pulsar dos veces mientras tanto: un
  // GIF de sesenta cuadros tarda lo suyo y no avisa por sí solo.
  const [exporting, setExporting] = useState<"image" | "gif" | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const commentRef = useRef<HTMLTextAreaElement>(null);

  // Llegar aquí desde el menú de la jugada tiene que dejar el cursor listo para
  // escribir: si no, la acción sólo cambiaría una pestaña que está fuera de la
  // vista y parecería que no ha hecho nada.
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

  // El comentario y los NAG se leen del PGN, no de un estado propio: así lo que
  // se ve es siempre lo guardado y no hay dos verdades que sincronizar.
  const comment = useMemo(() => {
    const game = parseEditableGame(pgn);
    return game ? commentTextAt(game, currentPath) : "";
  }, [pgn, currentPath]);

  const nags = node?.nags ?? [];
  const plainPgn = useMemo(() => plainMovetext(pgn), [pgn]);
  const glyphs = nags.map(nagGlyph).join("");
  // Para la insignia de la pestaña: si la partida ya está evaluada, su precisión
  // se lee del propio PGN sin volver a analizar nada.
  const review = useMemo(() => (tree ? reviewGame(mainlinePositions(tree)) : null), [tree]);

  // Los signos con pareja (blancas/negras) se escriben según de quién sea la
  // jugada; en la posición de partida no hay ninguna y el panel está apagado.
  const isWhiteMove = node ? node.ply % 2 === 1 : true;

  /**
   * Los NAGs que quedan tras pulsar una opción: se conserva lo de los OTROS
   * grupos, y dentro del suyo la elegida sustituye a la que hubiera —o se quita,
   * si era ella misma—.
   */
  const nextNags = (group: NagOption[], option: NagOption): number[] => {
    const code = nagCodeFor(option, isWhiteMove);
    const inGroup = new Set(group.flatMap(nagCodesOf));
    const others = nags.filter((nag) => !inGroup.has(nag));
    return nags.includes(code) ? others : [...others, code];
  };

  /** Aplica un cambio sobre el PGN; guardarlo es cosa de la sección. */
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
      // Sin permiso de portapapeles el campo sigue ahí para seleccionarlo a mano.
    }
  };

  const exportImage = async () => {
    setExporting("image");
    setExportError(null);
    try {
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
            {/* Lo que ya lleva la jugada, en la propia pestaña: un punto si está
                comentada y sus signos si está anotada. Así se sabe qué hay
                dentro sin entrar a mirar. */}
            {option.key === "comment" && comment.length > 0 && (
              <span className="game-tools__tab-dot" aria-hidden="true" />
            )}
            {option.key === "quality" && glyphs.length > 0 && (
              <span className="game-tools__tab-badge">{glyphs}</span>
            )}
            {/* Las dos precisiones, blancas primero: cuál es «la tuya» sólo lo
                sabe quien mira, así que se enseñan las dos. */}
            {option.key === "review" && review && (
              <span className="game-tools__tab-badge">
                {review.white.accuracy} · {review.black.accuracy}
              </span>
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
            // Se remonta también cuando cambia el comentario guardado: la misma
            // jugada se puede comentar desde su menú del clic derecho, y el
            // campo tiene que enterarse.
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

          {/* Las jugadas a secas, para pegarlas en otro sitio: ni variantes, ni
              comentarios, ni de quién es la partida. */}
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
