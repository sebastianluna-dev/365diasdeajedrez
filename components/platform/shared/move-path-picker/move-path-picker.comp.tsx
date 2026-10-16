"use client";

import { useEffect, useState } from "react";
import { GameViewer } from "@/components/chess/game-viewer/game-viewer.comp";
import "./move-path-picker.comp.css";

/** Reads the PGN of what `referenceId` names, or null when it cannot; a server action, a stub in Storybook. */
export type FetchPgn = (id: string) => Promise<string | null>;

interface MovePathPickerProps {
  /** The game or lesson whose PGN is read. Empty renders nothing. */
  referenceId: string;
  /** What the line above the viewer asks for. */
  hint: string;
  /** The dotted path already chosen, if any: the viewer opens on it. */
  value: string;
  /** «Usar esta posición»: the path the viewer is on, with the PGN it was read from. */
  onChange: (path: string, pgn: string) => void;
  /**
   * «Quitar posición», and the line that says which move is kept: for a
   * choice that is saved (a class block's opening move). Without it, neither
   * is drawn: the position is used at once (an exercise's start).
   */
  onClear?: () => void;
  /** The read behind an action, handed down so the piece imports none. */
  fetchPgn: FetchPgn;
}

/**
 * Loaded PGN, together with the id it belongs to: that way a result that
 * arrives late is not painted over a reference the author already changed.
 */
interface LoadedPgn {
  referenceId: string;
  pgn: string | null;
}

/**
 * Picks a position of a game or a lesson: mounts the usual viewer on the
 * referenced PGN and captures the current node's path with `onPathChange`.
 * There is no second viewer nor a PGN editor — it is the same component the
 * student will see. A class block opens at the move it keeps; an exercise
 * starts at the one it takes («Desde una partida»).
 */
export function MovePathPicker({ referenceId, hint, value, onChange, onClear, fetchPgn }: MovePathPickerProps) {
  const [loaded, setLoaded] = useState<LoadedPgn | null>(null);
  const [currentPath, setCurrentPath] = useState(value);

  useEffect(() => {
    if (referenceId.length === 0) return;

    let cancelled = false;
    fetchPgn(referenceId)
      .then((pgn) => {
        if (!cancelled) setLoaded({ referenceId, pgn });
      })
      .catch(() => {
        if (!cancelled) setLoaded({ referenceId, pgn: null });
      });

    return () => {
      cancelled = true;
    };
  }, [referenceId, fetchPgn]);

  if (referenceId.length === 0) return null;

  const current = loaded?.referenceId === referenceId ? loaded : null;
  if (current === null) return <p className="move-path-picker__status">Cargando el contenido…</p>;
  const pgn = current.pgn;
  if (pgn === null) {
    return <p className="move-path-picker__status">No se pudo cargar ese contenido.</p>;
  }

  return (
    <div className="move-path-picker">
      <p className="move-path-picker__hint">{hint}</p>

      {/* key by reference: changing game resets the viewer instead of
          dragging along the previous one's path. */}
      <GameViewer key={referenceId} pgn={pgn} onPathChange={setCurrentPath} initialPath={value || undefined} />

      <div className="move-path-picker__actions">
        <button type="button" className="platform-button" onClick={() => onChange(currentPath, pgn)}>
          Usar esta posición
        </button>
        {onClear && value.length > 0 && (
          <button type="button" className="platform-button" onClick={onClear}>
            Quitar posición
          </button>
        )}
        {onClear && (
          <span className="move-path-picker__value">
            {value.length > 0 ? `Posición guardada: jugada ${value.split(".").length}` : "Sin posición marcada"}
          </span>
        )}
      </div>
    </div>
  );
}
