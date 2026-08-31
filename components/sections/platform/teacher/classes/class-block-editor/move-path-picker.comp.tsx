"use client";

import { useEffect, useState } from "react";
import { GameViewer } from "@/components/common/game-viewer/game-viewer.comp";
import { CLASS_BLOCK_KIND } from "@/constants/platform/class-codes.const";
import { fetchReferencePgn } from "@/services/teacher-classes/teacher-classes.actions";
import "./move-path-picker.comp.css";

interface MovePathPickerProps {
  kind: typeof CLASS_BLOCK_KIND.GAME_REF | typeof CLASS_BLOCK_KIND.LESSON_REF;
  referenceId: string;
  /** Ruta punteada ya guardada, si la hay. */
  value: string;
  onChange: (path: string) => void;
}

/** PGN cargado, junto al id al que pertenece: así un resultado que llega tarde
 *  no se pinta sobre una referencia que el profesor ya cambió. */
interface LoadedPgn {
  referenceId: string;
  pgn: string | null;
}

/**
 * Elige la posición de apertura de un bloque de partida o lección: monta el
 * visor de siempre sobre el PGN referenciado y captura la ruta del nodo actual
 * con `onPathChange`. No hay un segundo visor ni un editor de PGN — es el mismo
 * componente que verá el alumno.
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

      {/* key por referencia: cambiar de partida reinicia el visor en vez de
          arrastrar la ruta de la anterior. */}
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
