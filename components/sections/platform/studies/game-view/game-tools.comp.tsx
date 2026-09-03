"use client";

import { useMemo, useState } from "react";
import { commentTextAt, parseEditableGame, serializeGame, setCommentText, setNags } from "@/lib/chess/pgn-edit";
import { MOVE_QUALITY_NAGS, nodeAtPath, parsePgnTree } from "@/lib/chess/pgn-tree";
import { sanToSpanish } from "@/lib/chess/notation";
import { autosaveGamePgn } from "@/services/studies/studies.actions";
import "./game-tools.comp.css";

type Tab = "comment" | "quality" | "share";

interface GameToolsProps {
  studyId: string;
  gameId: string;
  pgn: string;
  /** Ruta punteada de la jugada seleccionada en el visor. */
  currentPath: string;
  /** Las bases de curso son de sólo lectura: allí sólo queda compartir. */
  canEdit: boolean;
  onPgnChange: (pgn: string) => void;
}

type SaveState = "idle" | "saving" | "saved" | "error";

export function GameTools({ studyId, gameId, pgn, currentPath, canEdit, onPgnChange }: GameToolsProps) {
  const [tab, setTab] = useState<Tab>(canEdit ? "comment" : "share");
  const [save, setSave] = useState<SaveState>("idle");
  const [copied, setCopied] = useState<"fen" | "pgn" | null>(null);

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

  /** Aplica un cambio sobre el PGN y lo guarda. */
  const apply = async (mutate: (game: NonNullable<ReturnType<typeof parseEditableGame>>) => boolean) => {
    const game = parseEditableGame(pgn);
    if (!game || !mutate(game)) return;

    const next = serializeGame(game);
    onPgnChange(next);
    setSave("saving");
    const result = await autosaveGamePgn(studyId, gameId, next);
    setSave(result.ok ? "saved" : "error");
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

  const tabs: { key: Tab; label: string }[] = [
    ...(canEdit ? ([{ key: "comment", label: "Comentario" }, { key: "quality", label: "Calidad" }] as const) : []),
    { key: "share", label: "Compartir" },
  ];

  return (
    <div className="game-tools">
      <div className="game-tools__tabs" role="tablist" aria-label="Herramientas de la partida">
        {tabs.map((option) => (
          <button
            key={option.key}
            type="button"
            role="tab"
            aria-selected={tab === option.key}
            onClick={() => setTab(option.key)}
            className={`game-tools__tab${tab === option.key ? " game-tools__tab_state_active" : ""}`}
          >
            {option.label}
          </button>
        ))}

        <span className="game-tools__target">
          Sobre {moveName}
          {save === "saving" && " · guardando…"}
          {save === "saved" && " · guardado"}
          {save === "error" && " · no se pudo guardar"}
        </span>
      </div>

      {tab === "comment" && (
        <div className="game-tools__panel">
          <textarea
            key={currentPath}
            defaultValue={comment}
            placeholder="Comentario de esta jugada"
            className="game-tools__textarea"
            onBlur={(event) => {
              if (event.target.value === comment) return;
              void apply((game) => setCommentText(game, currentPath, event.target.value));
            }}
          />
          <p className="game-tools__hint">
            Se guarda al salir del campo. Las flechas que dibujes en el editor se conservan junto al
            comentario.
          </p>
        </div>
      )}

      {tab === "quality" && (
        <div className="game-tools__panel">
          <div className="game-tools__nags">
            {MOVE_QUALITY_NAGS.map((option) => {
              const active = nags.includes(option.nag);
              return (
                <button
                  key={option.nag}
                  type="button"
                  disabled={!node}
                  aria-pressed={active}
                  onClick={() =>
                    void apply((game) =>
                      // Pulsar la que ya está puesta la quita: es un interruptor,
                      // no una lista que sólo crece.
                      setNags(game, currentPath, active ? [] : [option.nag]),
                    )
                  }
                  className={`game-tools__nag${active ? " game-tools__nag_state_active" : ""}`}
                >
                  <span className="game-tools__nag-glyph">{option.glyph}</span>
                  {option.label}
                </button>
              );
            })}
          </div>
          <p className="game-tools__hint">
            {node
              ? "Se guarda como NAG dentro del PGN, así que viaja con la partida al exportarla."
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
