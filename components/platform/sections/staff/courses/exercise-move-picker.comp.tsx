"use client";

import { useMemo, useState } from "react";
import { GameViewer } from "@/components/chess/game-viewer/game-viewer.comp";
import { parsePgnTree, sansAlongPath } from "@/lib/chess/pgn-tree";
import "./exercise-move-picker.comp.css";

interface ExerciseMovePickerProps {
  /** The lesson's PGN: the exercise always comes out of it. */
  pgn: string;
  /** Fills the form's two fields with what was chosen on the board. */
  onPick: (values: { afterSans?: string; lineSans?: string }) => void;
}

/**
 * Picks an exercise's moves on the board instead of typing them.
 *
 * Writing SAN by hand works — the server validates legality move by move —
 * but a typo is only discovered on save. Here two positions of the lesson's
 * PGN are marked and the two fields come out of that: what is played BEFORE
 * starting and the line to be trained.
 *
 * It does not replace the text fields: it fills them. Whoever prefers to
 * type them — or to fix one by hand — still can, and the server action does
 * not know this component exists.
 */
export function ExerciseMovePicker({ pgn, onPick }: ExerciseMovePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState("");
  const [startPath, setStartPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const tree = useMemo(() => parsePgnTree(pgn), [pgn]);

  // Closed (or without a readable PGN) the block is the same, without a box:
  // that way the button and the notice hang from the root and are not left as loose nodes.
  if (!isOpen) {
    return (
      <div className="exercise-move-picker exercise-move-picker_state_closed">
        <button
          type="button"
          className="platform-button platform-button_variant_secondary exercise-move-picker__open"
          onClick={() => setIsOpen(true)}
        >
          Elegir las jugadas sobre el tablero
        </button>
      </div>
    );
  }

  if (!tree) {
    return (
      <div className="exercise-move-picker exercise-move-picker_state_closed">
        <p className="exercise-move-picker__status">No se pudo leer el PGN de la lección.</p>
      </div>
    );
  }

  const markStart = () => {
    setStartPath(currentPath);
    setError(null);
    // The saved line hung from ANOTHER start: it is cleared instead of being
    // left pointing at a segment that no longer exists.
    onPick({ afterSans: sansAlongPath(tree, currentPath).join(" "), lineSans: "" });
  };

  const markEnd = () => {
    const start = startPath ?? "";
    // The end has to hang from the start: otherwise there is no line joining
    // them and what would be saved is two different branches.
    const descends = start.length === 0 || currentPath === start || currentPath.startsWith(`${start}.`);
    if (!descends || currentPath === start) {
      setError("El final tiene que ser una jugada posterior al inicio marcado, dentro de la misma línea.");
      return;
    }

    const depth = start.length === 0 ? 0 : start.split(".").length;
    setError(null);
    onPick({ lineSans: sansAlongPath(tree, currentPath).slice(depth).join(" ") });
  };

  return (
    <div className="exercise-move-picker">
      <p className="exercise-move-picker__hint">
        Recorre la lección hasta donde arranca el ejercicio y marca el inicio; sigue hasta la última jugada de la
        línea y marca el final. Sin inicio marcado, el ejercicio empieza desde el principio de la lección.
      </p>

      <GameViewer pgn={pgn} onPathChange={setCurrentPath} moveList="flow" />

      <div className="exercise-move-picker__actions">
        <button type="button" className="platform-button platform-button_variant_secondary" onClick={markStart}>
          Marcar el inicio aquí
        </button>
        <button type="button" className="platform-button platform-button_variant_secondary" onClick={markEnd}>
          Marcar el final aquí
        </button>
        <button type="button" className="exercise-move-picker__close" onClick={() => setIsOpen(false)}>
          Cerrar el tablero
        </button>
      </div>

      {error && (
        <p className="exercise-move-picker__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
