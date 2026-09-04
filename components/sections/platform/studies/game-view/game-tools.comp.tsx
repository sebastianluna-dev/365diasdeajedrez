"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { commentTextAt, parseEditableGame, serializeGame, setCommentText, setNags } from "@/lib/chess/pgn-edit";
import {
  MOVE_QUALITY_NAGS,
  MOVE_REMARK_NAGS,
  nagCodeFor,
  nagCodesOf,
  nodeAtPath,
  parsePgnTree,
  POSITION_EVAL_NAGS,
  type NagOption,
} from "@/lib/chess/pgn-tree";
import { sanToSpanish } from "@/lib/chess/notation";
import "./game-tools.comp.css";

export type GameToolsTab = "comment" | "quality" | "share";

/**
 * Los tres grupos de signos, cada uno excluyente por dentro: una jugada no es
 * «!» y «?» a la vez, pero sí puede ser «!» con «→» y «±».
 */
const NAG_GROUPS: { title: string; options: NagOption[] }[] = [
  { title: "Calidad de la jugada", options: MOVE_QUALITY_NAGS },
  { title: "Qué pasa en la partida", options: MOVE_REMARK_NAGS },
  { title: "Evaluación de la posición", options: POSITION_EVAL_NAGS },
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
  onPgnChange,
}: GameToolsProps) {
  const [copied, setCopied] = useState<"fen" | "pgn" | null>(null);
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

  const copy = async (text: string, what: "fen" | "pgn") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      // Sin permiso de portapapeles el campo sigue ahí para seleccionarlo a mano.
    }
  };

  const tabs: { key: GameToolsTab; label: string }[] = [
    ...(canEdit ? ([{ key: "comment", label: "Comentario" }, { key: "quality", label: "Calidad" }] as const) : []),
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
          </button>
        ))}

        <span className="game-tools__target">
          Sobre {moveName}
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
            Se guarda al salir del campo. También se llega aquí con «Comentar este movimiento», en el menú
            del clic derecho de cada jugada. Las flechas que dibujes sobre el tablero se conservan junto al
            comentario.
          </p>
        </div>
      )}

      {tab === "quality" && (
        <div className="game-tools__panel">
          {NAG_GROUPS.map((group) => (
            <div key={group.title} className="game-tools__nag-group">
              <p className="game-tools__nag-title">{group.title}</p>
              <div className="game-tools__nags">
                {group.options.map((option) => {
                  const code = nagCodeFor(option, isWhiteMove);
                  const active = nags.includes(code);
                  return (
                    <button
                      key={option.nag}
                      type="button"
                      disabled={!node}
                      aria-pressed={active}
                      onClick={() => apply((game) => setNags(game, currentPath, nextNags(group.options, option)))}
                      className={`game-tools__nag${active ? " game-tools__nag_state_active" : ""}`}
                    >
                      <span className="game-tools__nag-glyph">{option.glyph}</span>
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <p className="game-tools__hint">
            {node
              ? "Se guarda como NAG dentro del PGN, así que viaja con la partida al exportarla. Una jugada puede llevar un signo de cada grupo."
              : "Elige una jugada en la lista para calificarla."}
          </p>
        </div>
      )}

      {tab === "share" && (
        <div className="game-tools__panel">
          <div className="game-tools__share">
            <span className="game-tools__share-label">FEN de esta posición</span>
            <div className="game-tools__share-row">
              <input readOnly value={fen} className="game-tools__share-input" />
              <button type="button" className="game-tools__share-button" onClick={() => void copy(fen, "fen")}>
                {copied === "fen" ? "Copiado" : "Copiar"}
              </button>
            </div>
          </div>

          <div className="game-tools__share">
            <span className="game-tools__share-label">PGN completo</span>
            <div className="game-tools__share-row">
              <input readOnly value={pgn.replace(/\s+/g, " ").trim()} className="game-tools__share-input" />
              <button type="button" className="game-tools__share-button" onClick={() => void copy(pgn, "pgn")}>
                {copied === "pgn" ? "Copiado" : "Copiar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
