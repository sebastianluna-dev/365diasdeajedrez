"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChessBoard } from "@/components/common/chess-board.comp";
import { ChevronIcon } from "@/components/icons/chevron-icon.comp";
import { FlipIcon } from "@/components/icons/flip-icon.comp";
import { SkipIcon } from "@/components/icons/skip-icon.comp";
import { endPathOf, nextPathOf, nodeAtPath, parentPathOf, parsePgnTree } from "@/lib/chess/pgn-tree";
import { MoveTree } from "./move-tree.comp";
import "./game-viewer.comp.css";

interface GameViewerProps {
  /** PGN completo: movimientos, variantes, comentarios y anotaciones. */
  pgn: string;
  orientation?: "white" | "black";
  /** Ruta punteada donde abrir el visor (TrainingExercise.path / ClassBlock.movePath). */
  initialPath?: string;
  title?: string;
  /**
   * Se avisa con la ruta punteada del nodo actual cada vez que cambia. Existe
   * para que el editor de bloques de clase pueda capturar «esta posición» sin
   * un segundo visor; el visor sigue siendo de sólo lectura y quien no pase
   * esta prop no nota ninguna diferencia.
   */
  onPathChange?: (path: string) => void;
}

/**
 * EL visor de partidas de la plataforma: lecciones, partidas de Mis estudios y
 * bloques de clase usan este mismo componente (tablero + árbol de jugadas con
 * variantes y comentarios + navegación). No crear visores paralelos.
 */
export function GameViewer({ pgn, orientation = "white", initialPath, title, onPathChange }: GameViewerProps) {
  const tree = useMemo(() => parsePgnTree(pgn), [pgn]);
  const [currentPath, setCurrentPath] = useState<string>(() =>
    initialPath && tree?.nodesByPath.has(initialPath) ? initialPath : "",
  );
  const [flipToggled, setFlipToggled] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const isInViewportRef = useRef(false);
  const hasBeenClickedRef = useRef(false);

  // Por referencia: así avisar del cambio de ruta no depende de que quien
  // consume el visor memorice el callback.
  const onPathChangeRef = useRef(onPathChange);
  useEffect(() => {
    onPathChangeRef.current = onPathChange;
  });
  useEffect(() => {
    onPathChangeRef.current?.(currentPath);
  }, [currentPath]);

  const goToStart = useCallback(() => setCurrentPath(""), []);
  const goToPrevious = useCallback(() => setCurrentPath((path) => parentPathOf(path)), []);
  const goToNext = useCallback(() => {
    if (!tree) return;
    setCurrentPath((path) => nextPathOf(tree, path) ?? path);
  }, [tree]);
  const goToEnd = useCallback(() => {
    if (!tree) return;
    setCurrentPath((path) => endPathOf(tree, path));
  }, [tree]);

  // Las flechas sólo actúan cuando el visor está a la vista o fue clickeado,
  // igual que ChessBoard: puede haber varios visores en una misma página.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isInViewportRef.current = entry.isIntersecting;
      },
      { threshold: 0.6 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isInViewportRef.current && !hasBeenClickedRef.current) return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goToNext();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToPrevious();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrevious]);

  if (!tree) {
    return <p className="game-viewer game-viewer_state_error">No se pudo leer el PGN de esta partida.</p>;
  }

  const node = nodeAtPath(tree, currentPath);
  const flipBoard = (orientation === "black") !== flipToggled;

  return (
    <div className="game-viewer" ref={rootRef} onClick={() => (hasBeenClickedRef.current = true)}>
      {title && <p className="game-viewer__title">{title}</p>}

      {/* Un PGN con jugadas ilegales se mostraría recortado sin avisar; en
          desarrollo se listan los problemas para que el autor los corrija. */}
      {process.env.NODE_ENV !== "production" && tree.warnings.length > 0 && (
        <ul className="game-viewer__warnings">
          {tree.warnings.map((warning) => (
            <li key={warning} className="game-viewer__warning">
              {warning}
            </li>
          ))}
        </ul>
      )}

      <div className="game-viewer__layout">
        <div className="game-viewer__board">
          <ChessBoard
            position={{
              fen: node?.fen ?? tree.initialFen,
              lastMove: node?.lastMove,
              check: node?.check ?? false,
              shapes: node ? node.shapes : tree.initialShapes,
            }}
            flipBoard={flipBoard}
          />
        </div>

        <div className="game-viewer__panel">
          <div className="game-viewer__moves">
            <MoveTree tree={tree} currentPath={currentPath} onSelect={setCurrentPath} />
          </div>

          <div className="game-viewer__toolbar">
            <button
              type="button"
              aria-label="Voltear tablero"
              onClick={() => setFlipToggled((current) => !current)}
              className="game-viewer__tool"
            >
              <FlipIcon />
            </button>
            <button type="button" aria-label="Ir al inicio" onClick={goToStart} className="game-viewer__tool">
              <span className="game-viewer__tool-icon_flipped">
                <SkipIcon />
              </span>
            </button>
            <button type="button" aria-label="Jugada anterior" onClick={goToPrevious} className="game-viewer__tool">
              <span className="game-viewer__tool-icon_flipped">
                <ChevronIcon />
              </span>
            </button>
            <button type="button" aria-label="Jugada siguiente" onClick={goToNext} className="game-viewer__tool">
              <ChevronIcon />
            </button>
            <button type="button" aria-label="Ir al final" onClick={goToEnd} className="game-viewer__tool">
              <SkipIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
