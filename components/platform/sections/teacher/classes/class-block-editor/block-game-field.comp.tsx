"use client";

import { useId, useState } from "react";
import { GameViewer } from "@/components/chess/game-viewer/game-viewer.comp";
import { usePgnHistory } from "@/components/platform/shared/use-pgn-history.hook";
import { PGN_MAX_LENGTH } from "@/constants/platform/content-limits.const";
import { emptyGame, parseEditableGame, serializeGame } from "@/lib/chess/pgn-edit";
import "./block-game-field.comp.css";

interface BlockGameFieldProps {
  /** Name of the hidden input the PGN travels in when the block's form is sent. */
  name: string;
  /** The block's game; none for a new block, which starts from the initial position. */
  defaultPgn?: string;
}

/** The block's game rewritten as the editor writes it, or an empty one when there is none to read. */
function startingPgn(defaultPgn: string | undefined): string {
  const game = defaultPgn && defaultPgn.trim().length > 0 ? parseEditableGame(defaultPgn) : null;
  return serializeGame(game ?? emptyGame());
}

/**
 * The game a class block carries, transcribed on the platform's one viewer
 * in its editing mode, the same one the studies and the chapter games use:
 * moves are played on the board, the move list's right click comments,
 * promotes or deletes, the tools under the board annotate, and Ctrl+Z undoes.
 * The PGN is published in a hidden input, so saving is the block form's
 * submit, as with any other field; nothing saves on its own.
 *
 * The viewer is not inside a `<label>`: there, a click on a square would
 * also press the first button of the viewer. The field is a group named by
 * its own label instead.
 */
export function BlockGameField({ name, defaultPgn }: BlockGameFieldProps) {
  const [initialPgn] = useState(() => startingPgn(defaultPgn));
  const { pgn, applyPgn } = usePgnHistory(initialPgn, { undo: true });
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const labelId = useId();
  const hintId = useId();

  // A pasted PGN replaces the game, as one more step of its history: Ctrl+Z
  // brings back what was there.
  const loadDraft = () => {
    const game = draft.trim().length > 0 ? parseEditableGame(draft) : null;
    if (!game) {
      setError("No se puede leer ese PGN. Revísalo antes de cargarlo.");
      return;
    }
    applyPgn(serializeGame(game));
    setDraft("");
    setError(null);
  };

  return (
    <div className="block-game-field" role="group" aria-labelledby={labelId} aria-describedby={hintId}>
      <p id={labelId} className="block-game-field__label">
        Partida de la clase
      </p>
      <p id={hintId} className="block-game-field__hint">
        Juega las jugadas sobre el tablero; clic derecho sobre una jugada la comenta, la promociona o la elimina. Si ya
        tienes el PGN, pégalo desde «Pegar un PGN».
      </p>

      <input type="hidden" name={name} value={pgn} />
      <GameViewer pgn={pgn} controls="panel" engine editable onPgnChange={applyPgn} tools={{}} />

      <details className="block-game-field__paste">
        <summary>Pegar un PGN</summary>
        <textarea
          className="block-game-field__paste-input"
          aria-label="PGN que reemplaza la partida"
          value={draft}
          rows={8}
          maxLength={PGN_MAX_LENGTH}
          spellCheck={false}
          placeholder={'[Event "…"]\n1. e4 e5 2. Nf3 …'}
          onChange={(event) => setDraft(event.target.value)}
        />
        {error && (
          <p className="block-game-field__paste-error" role="alert">
            {error}
          </p>
        )}
        <button type="button" className="platform-button" onClick={loadDraft}>
          Cargar este PGN
        </button>
      </details>
    </div>
  );
}
