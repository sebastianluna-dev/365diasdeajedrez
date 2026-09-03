"use client";

import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { ChessBoard } from "@/components/common/chess-board.comp";
import { ArrowLeftIcon } from "@/components/icons/arrow-left-icon.comp";
import { ArrowRightIcon } from "@/components/icons/arrow-right-icon.comp";
import { BoardFlipIcon } from "@/components/icons/board-flip-icon.comp";
import { FullscreenIcon } from "@/components/icons/fullscreen-icon.comp";
import { JumpEndIcon } from "@/components/icons/jump-end-icon.comp";
import { JumpStartIcon } from "@/components/icons/jump-start-icon.comp";
import { SoundOffIcon } from "@/components/icons/sound-off-icon.comp";
import { SoundOnIcon } from "@/components/icons/sound-on-icon.comp";
import { endPathOf, nextPathOf, nodeAtPath, parentPathOf, parsePgnTree } from "@/lib/chess/pgn-tree";
import { EnginePanel } from "./engine-panel.comp";
import { useEngine } from "./use-engine";
import { evaluationBarFill } from "@/lib/chess/engine-protocol";
import { MoveTable } from "./move-table.comp";
import { MoveTree } from "./move-tree.comp";
import { playMoveSound } from "./move-sound";
import {
  getServerViewerPreferences,
  getViewerPreferences,
  setViewerPreferences,
  subscribeToViewerPreferences,
  type ViewerPreferences,
} from "./viewer-preferences";
import "./game-viewer.comp.css";

interface GameViewerProps {
  /** PGN completo: movimientos, variantes, comentarios y anotaciones. */
  pgn: string;
  orientation?: "white" | "black";
  /** Ruta punteada donde abrir el visor (TrainingExercise.path / ClassBlock.movePath). */
  initialPath?: string;
  title?: string;
  /** Segunda línea de la cabecera: capítulo, evento, lo que sitúe la partida. */
  subtitle?: string;
  /** Texto de la partida o la lección, bajo el subtítulo. */
  description?: string;
  /** Distintivo a la derecha del título («Prioridad»). */
  badge?: string;
  /**
   * Botones extra de la cabecera del panel (abrir en el libro, guardar…). Van
   * aquí y no dentro porque dependen de cada pantalla; el visor sólo reserva
   * el sitio que el diseño les da.
   */
  headerActions?: ReactNode;
  /** Botón que cierra la barra inferior, alineado a la derecha (las notas). */
  footerActions?: ReactNode;
  /** Acción de la barra inferior que trabaja sobre la posición actual. */
  positionActions?: (fen: string) => ReactNode;
  /** Botón «Saltar» bajo el tablero. Sin destino no se pinta. */
  skip?: ReactNode;
  /**
   * Tiras de jugador alrededor del tablero. Se dan por bando, no por posición,
   * porque el visor puede girarse: quien está arriba depende de la orientación
   * y sólo el visor la conoce.
   */
  players?: { white: ReactNode; black: ReactNode };
  /**
   * `table` (por defecto): rejilla nº · blancas · negras, como Lichess.
   * `flow`: el texto corrido de siempre, que es como se leen las lecciones —
   * ahí la partida se sigue leyendo, no consultando jugada a jugada.
   */
  moveList?: "table" | "flow";
  /**
   * Dónde van los cuatro botones de navegación. Bajo el tablero en las
   * lecciones; dentro del panel de jugadas en Mis estudios, que es donde se
   * recorre la partida.
   */
  controls?: "board" | "panel";
  /** Contenido bajo el tablero: comentario, calidad y compartir. */
  boardFooter?: ReactNode;
  /**
   * Ofrece el módulo de análisis. Apagado por defecto: son 7 MB de WebAssembly
   * que sólo se descargan cuando alguien lo enciende, y ni eso hasta entonces.
   */
  engine?: boolean;
  /**
   * Se avisa con la ruta punteada del nodo actual cada vez que cambia. Existe
   * para que el editor de bloques de clase pueda capturar «esta posición» sin
   * un segundo visor; el visor sigue siendo de sólo lectura y quien no pase
   * esta prop no nota ninguna diferencia.
   */
  onPathChange?: (path: string) => void;
}

/** Piezas sobre el tablero, para distinguir una captura de una jugada normal. */
function pieceCount(fen: string): number {
  return (fen.split(" ")[0] ?? "").replace(/[^a-zA-Z]/g, "").length;
}

/**
 * EL visor de partidas de la plataforma: lecciones, partidas de Mis estudios y
 * bloques de clase usan este mismo componente (tablero + árbol de jugadas con
 * variantes y comentarios + navegación). No crear visores paralelos.
 */
export function GameViewer({
  pgn,
  orientation = "white",
  initialPath,
  title,
  subtitle,
  description,
  badge,
  headerActions,
  footerActions,
  positionActions,
  skip,
  players,
  moveList = "table",
  controls = "board",
  boardFooter,
  engine = false,
  onPathChange,
}: GameViewerProps) {
  const tree = useMemo(() => parsePgnTree(pgn), [pgn]);
  const [currentPath, setCurrentPath] = useState<string>(() =>
    initialPath && tree?.nodesByPath.has(initialPath) ? initialPath : "",
  );
  const [flipToggled, setFlipToggled] = useState(false);
  const [engineOn, setEngineOn] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Almacén externo: la primera pintada usa los valores por defecto (que es lo
  // único que el servidor puede saber) y React se pone al día con lo guardado
  // en cuanto hidrata, sin un efecto que llame a setState.
  const preferences = useSyncExternalStore<ViewerPreferences>(
    subscribeToViewerPreferences,
    getViewerPreferences,
    getServerViewerPreferences,
  );
  const updatePreferences = useCallback((next: ViewerPreferences) => setViewerPreferences(next), []);

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

  // La pantalla completa puede salirse por Escape sin pasar por el botón, así
  // que el estado se lee del documento y no de quien pulsó.
  useEffect(() => {
    const sync = () => setIsFullscreen(document.fullscreenElement === rootRef.current);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void rootRef.current?.requestFullscreen().catch(() => undefined);
  }, []);

  const node = tree ? nodeAtPath(tree, currentPath) : null;
  const fen = node?.fen ?? tree?.initialFen ?? "";

  // El motor vive aquí y no en su panel porque su evaluación la usan DOS sitios
  // muy separados de la pantalla: la barra pegada al tablero y la línea de la
  // notación. Con `engine` apagado el hook no crea worker ni descarga nada.
  const engineState = useEngine(fen, engine && engineOn);

  // Suena al cambiar de posición, nunca al montar: quien abre una lección no
  // espera un golpe de salida.
  const previousFenRef = useRef<string | null>(null);
  useEffect(() => {
    const previous = previousFenRef.current;
    previousFenRef.current = fen;
    if (previous === null || previous === fen || !fen) return;
    if (!preferences.sound) return;
    playMoveSound(pieceCount(fen) < pieceCount(previous) ? "capture" : "move");
  }, [fen, preferences.sound]);

  if (!tree) {
    return <p className="game-viewer game-viewer_state_error">No se pudo leer el PGN de esta partida.</p>;
  }

  const flipBoard = (orientation === "black") !== flipToggled;

  const nav = (
    <div className="game-viewer__nav">
      <button type="button" title="Primera jugada" onClick={goToStart} className="game-viewer__nav-button">
        <JumpStartIcon className="game-viewer__nav-icon" />
      </button>
      <button type="button" title="Jugada anterior" onClick={goToPrevious} className="game-viewer__nav-button">
        <ArrowLeftIcon className="game-viewer__nav-icon" />
      </button>
      <button
        type="button"
        title="Jugada siguiente"
        onClick={goToNext}
        className="game-viewer__nav-button game-viewer__nav-button_emphasis_strong"
      >
        <ArrowRightIcon className="game-viewer__nav-icon" />
      </button>
      <button type="button" title="Última jugada" onClick={goToEnd} className="game-viewer__nav-button">
        <JumpEndIcon className="game-viewer__nav-icon" />
      </button>

      {skip && <div className="game-viewer__skip">{skip}</div>}
    </div>
  );
  const hasHead = Boolean(title || subtitle || description || badge || headerActions);

  return (
    <div
      className={`game-viewer${isFullscreen ? " game-viewer_state_fullscreen" : ""}`}
      ref={rootRef}
      onClick={() => (hasBeenClickedRef.current = true)}
    >
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
        <div className="game-viewer__board-card">
          {players && (
            <div className="game-viewer__player game-viewer__player_side_top">
              {flipBoard ? players.white : players.black}
            </div>
          )}

          <div className="game-viewer__board-row">
            {engine && engineOn && (
              <div className="game-viewer__evaluation" aria-hidden="true">
                <span
                  className="game-viewer__evaluation-fill"
                  style={{
                    // La barra se llena desde ABAJO con la ventaja de las
                    // blancas, que es como se lee en cualquier tablero.
                    height: `${(engineState.info === null ? 0.5 : evaluationBarFill(engineState.info.score)) * 100}%`,
                  }}
                />
              </div>
            )}

            <div className="game-viewer__board">
            <ChessBoard
              position={{
                fen,
                lastMove: node?.lastMove,
                check: node?.check ?? false,
                shapes: node ? node.shapes : tree.initialShapes,
              }}
              flipBoard={flipBoard}
            />
            </div>
          </div>

          {players && (
            <div className="game-viewer__player game-viewer__player_side_bottom">
              {flipBoard ? players.black : players.white}
            </div>
          )}

          {controls === "board" && nav}
        </div>

        {boardFooter && <div className="game-viewer__board-footer">{boardFooter}</div>}

        <div className="game-viewer__panel">
          {hasHead && (
            <div className="game-viewer__panel-head">
              <div className="game-viewer__panel-heading">
                {title && <p className="game-viewer__panel-title">{title}</p>}
                {subtitle && <p className="game-viewer__panel-subtitle">{subtitle}</p>}
                {description && <p className="game-viewer__panel-description">{description}</p>}
              </div>
              {badge && <span className="game-viewer__panel-badge">{badge}</span>}
              {headerActions}
            </div>
          )}

          {engine && (
            <EnginePanel
              fen={fen}
              enabled={engineOn}
              onToggle={() => setEngineOn((on) => !on)}
              state={engineState}
            />
          )}

          <div className="game-viewer__moves">
            {moveList === "flow" ? (
              <MoveTree tree={tree} currentPath={currentPath} onSelect={setCurrentPath} />
            ) : (
              <MoveTable tree={tree} currentPath={currentPath} onSelect={setCurrentPath} />
            )}
          </div>

          {controls === "panel" && <div className="game-viewer__panel-nav">{nav}</div>}

          <div className="game-viewer__toolbar">
            <button
              type="button"
              title="Girar el tablero"
              onClick={() => setFlipToggled((current) => !current)}
              className="game-viewer__tool"
            >
              <BoardFlipIcon className="game-viewer__tool-icon" />
            </button>

            <button
              type="button"
              title={preferences.sound ? "Silenciar" : "Activar el sonido"}
              aria-pressed={preferences.sound}
              onClick={() => updatePreferences({ ...preferences, sound: !preferences.sound })}
              className="game-viewer__tool"
            >
              {preferences.sound ? (
                <SoundOnIcon className="game-viewer__tool-icon" />
              ) : (
                <SoundOffIcon className="game-viewer__tool-icon" />
              )}
            </button>

            <button
              type="button"
              title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
              onClick={toggleFullscreen}
              className="game-viewer__tool"
            >
              <FullscreenIcon className="game-viewer__tool-icon" />
            </button>

            {positionActions?.(fen)}

            {footerActions && <div className="game-viewer__toolbar-end">{footerActions}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
