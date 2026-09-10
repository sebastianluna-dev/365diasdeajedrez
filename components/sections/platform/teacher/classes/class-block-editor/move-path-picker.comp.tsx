"use client";

import { useEffect, useState } from "react";
import { GameViewer } from "@/components/common/game-viewer/game-viewer.comp";
import { CLASS_BLOCK_KIND } from "@/constants/platform/class-codes.const";
import { fetchReferencePgn } from "@/services/teacher-classes/teacher-classes.actions";
import "./move-path-picker.comp.css";

interface MovePathPickerProps {
  kind: typeof CLASS_BLOCK_KIND.GAME_REF | typeof CLASS_BLOCK_KIND.LESSON_REF;
  referenceId: string;
  /** Dotted path already saved, if any. */
  value: string;
  onChange: (path: string) => void;
}

/**
 * Loaded PGN, together with the id it belongs to: that way a result that
 * arrives late is not painted over a reference the teacher already changed.
 */
interface LoadedPgn {
  referenceId: string;
  pgn: string | null;
}

/**
 * Picks the opening position of a game or lesson block: mounts the usual
 * viewer on the referenced PGN and captures the current node's path with
 * `onPathChange`. There is no second viewer nor a PGN editor — it is the same
 * component the student will see.
 */
export function MovePathPicker({ kind, referenceId, value, onChange }: MovePathPickerProps) {
  const [loaded, setLoaded] = useState<LoadedPgn | null>(null);
  const [currentPath, setCurrentPath] = useState(value);

  useEffect(() => {
    if (referenceId.length === 0) return;

    let cancelled = false;
    fetchReferencePgn(kind, referenceId)
      .then((pgn) => {
        if (!cancelled) setLoaded({ referenceId, pgn });
      })
      .catch(() => {
        if (!cancelled) setLoaded({ referenceId, pgn: null });
      });

    return () => {
      cancelled = true;
    };
  }, [kind, referenceId]);

  if (referenceId.length === 0) return null;

  const current = loaded?.referenceId === referenceId ? loaded : null;
  if (current === null) return <p className="move-path-picker__status">Cargando el contenido…</p>;
  if (current.pgn === null) {
    return <p className="move-path-picker__status">No se pudo cargar el contenido de esa referencia.</p>;
  }

  return (
    <div className="move-path-picker">
      <p className="move-path-picker__hint">
        Navega hasta la posición con la que quieras abrir el bloque y púlsala. Si no eliges ninguna, el bloque empieza
        desde el principio.
      </p>

      {/* key by reference: changing game resets the viewer instead of
          dragging along the previous one's path. */}
      <GameViewer key={referenceId} pgn={current.pgn} onPathChange={setCurrentPath} initialPath={value || undefined} />

      <div className="move-path-picker__actions">
        <button
          type="button"
          className="platform-button platform-button_variant_secondary"
          onClick={() => onChange(currentPath)}
        >
          Usar esta posición
        </button>
        {value.length > 0 && (
          <button
            type="button"
            className="platform-button platform-button_variant_secondary"
            onClick={() => onChange("")}
          >
            Quitar posición
          </button>
        )}
        <span className="move-path-picker__value">
          {value.length > 0 ? `Posición guardada: jugada ${value.split(".").length}` : "Sin posición marcada"}
        </span>
      </div>
    </div>
  );
}
