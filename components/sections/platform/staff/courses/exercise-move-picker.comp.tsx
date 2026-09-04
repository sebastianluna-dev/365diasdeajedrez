"use client";

import { useMemo, useState } from "react";
import { GameViewer } from "@/components/common/game-viewer/game-viewer.comp";
import { parsePgnTree, sansAlongPath } from "@/lib/chess/pgn-tree";
import "./exercise-move-picker.comp.css";

interface ExerciseMovePickerProps {
  /** El PGN de la lección: el ejercicio siempre sale de él. */
  pgn: string;
  /** Rellena los dos campos del formulario con lo elegido en el tablero. */
  onPick: (values: { afterSans?: string; lineSans?: string }) => void;
}

/**
 * Elige sobre el tablero las jugadas de un ejercicio, en vez de teclearlas.
 *
 * Escribir SAN a mano funciona —el servidor valida la legalidad jugada a
 * jugada— pero una errata sólo se descubre al guardar. Aquí se marcan dos
 * posiciones del PGN de la lección y de ahí salen los dos campos: lo que se
 * juega ANTES de empezar y la línea que hay que entrenar.
 *
 * No sustituye a los campos de texto: los rellena. Quien prefiera escribirlos
 * —o corregir uno a mano— sigue pudiendo, y la acción del servidor no se entera
 * de que este componente existe.
 */
export function ExerciseMovePicker({ pgn, onPick }: ExerciseMovePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState("");
  const [startPath, setStartPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const tree = useMemo(() => parsePgnTree(pgn), [pgn]);

  if (!isOpen) {
    return (
      <button
        type="button"
        className="platform-button platform-button_variant_secondary exercise-move-picker__open"
        onClick={() => setIsOpen(true)}
      >
        Elegir las jugadas sobre el tablero
      </button>
    );
  }

  if (!tree) {
    return <p className="exercise-move-picker__status">No se pudo leer el PGN de la lección.</p>;
  }

  const markStart = () => {
    setStartPath(currentPath);
    setError(null);
    // La línea guardada colgaba de OTRO inicio: se borra en vez de quedarse
    // apuntando a un tramo que ya no existe.
    onPick({ afterSans: sansAlongPath(tree, currentPath).join(" "), lineSans: "" });
  };

  const markEnd = () => {
    const start = startPath ?? "";
    // El final tiene que colgar del inicio: si no, no hay una línea que los
    // una y lo que se guardaría serían dos ramas distintas.
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
