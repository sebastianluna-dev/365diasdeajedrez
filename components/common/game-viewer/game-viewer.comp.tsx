"use client";

import {
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { ChessBoard } from "@/components/common/chess-board.comp";
import { ArrowLeftIcon } from "@/components/icons/arrow-left-icon.comp";
import { ArrowRightIcon } from "@/components/icons/arrow-right-icon.comp";
import { BoardFlipIcon } from "@/components/icons/board-flip-icon.comp";
import { FullscreenIcon } from "@/components/icons/fullscreen-icon.comp";
import { JumpEndIcon } from "@/components/icons/jump-end-icon.comp";
import { JumpStartIcon } from "@/components/icons/jump-start-icon.comp";
import { MenuIcon } from "@/components/icons/menu-icon.comp";
import { SoundOffIcon } from "@/components/icons/sound-off-icon.comp";
import { SoundOnIcon } from "@/components/icons/sound-on-icon.comp";
import { numberedMoveLabel } from "@/lib/chess/notation";
import { endPathOf, nextPathOf, nodeAtPath, parentPathOf, parsePgnTree } from "@/lib/chess/pgn-tree";
import { EnginePanel } from "./engine-panel.comp";
import { useEngine } from "./use-engine";
import { evaluationBarFill } from "@/lib/chess/engine-protocol";
import { MoveContextMenu, type MoveContextMenuTarget } from "./move-context-menu.comp";
import { MoveTable } from "./move-table.comp";
import { MoveTree } from "./move-tree.comp";
import { playMoveSound } from "./move-sound";
import { usePgnEditing } from "./use-pgn-editing";
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
  /**
   * Convierte el visor en editor: se juega sobre el tablero para añadir
   * jugadas y variantes, se dibujan flechas y el clic derecho sobre una jugada
   * abre su menú (promover, comentar, anotar, copiar y borrar).
   *
   * No hay pantalla de edición aparte: la partida se anota donde se lee. Sin
   * `onPgnChange` esto no hace nada, porque el visor no guarda: informa del PGN
   * nuevo y quien lo monta decide qué hacer con él.
   */
  editable?: boolean;
  onPgnChange?: (pgn: string) => void;
  /**
   * «Comentar» y «Anotar» del menú de la jugada. El visor NO abre nada: sólo
   * selecciona la jugada y avisa, porque el sitio donde se escribe está fuera
   * de él —el panel bajo el tablero— y quien lo monta es quien lo tiene.
   * Sin esta prop, esas dos opciones no se pintan en el menú.
   */
  onRequestEdit?: (mode: "comment" | "annotate", path: string) => void;
  /**
   * Qué jugada enseñar, cuando quien monta el visor quiere decidirlo —la
   * gráfica de la evaluación lleva el tablero a la jugada que se señala—.
   *
   * Sin esta prop el visor sigue decidiéndolo él y no cambia nada; con ella
   * manda quien la pasa, que tiene que devolver lo que llegue por
   * `onPathChange` o el tablero no se moverá.
   */
  path?: string;
}

/** Lo que hay que mantener pulsado antes de que la partida empiece a correr. */
const HOLD_DELAY_MS = 400;

/** Cada cuánto avanza una jugada mientras se mantenga pulsado. */
const HOLD_STEP_MS = 130;

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
  editable = false,
  onPgnChange,
  onRequestEdit,
  path,
}: GameViewerProps) {
  const tree = useMemo(() => parsePgnTree(pgn), [pgn]);
  const [selectedPath, setSelectedPath] = useState<string>(() =>
    initialPath && tree?.nodesByPath.has(initialPath) ? initialPath : "",
  );

  /**
   * La jugada elegida, o el antepasado suyo que siga existiendo.
   *
   * El PGN puede cambiar bajo los pies —se deshace un cambio, se borra una
   * rama, lo edita el panel de abajo— y dejar la ruta señalando a una jugada
   * que ya no está. Se resuelve al pintar y no con un efecto que corrija el
   * estado: así no hay un fotograma con el tablero en la posición inicial.
   */
  const currentPath = useMemo(() => {
    const wanted = path ?? selectedPath;
    if (!tree || wanted.length === 0 || tree.nodesByPath.has(wanted)) return wanted;

    let closest = parentPathOf(wanted);
    while (closest.length > 0 && !tree.nodesByPath.has(closest)) closest = parentPathOf(closest);
    return closest;
  }, [tree, selectedPath, path]);
  const [flipToggled, setFlipToggled] = useState(false);
  const [engineOn, setEngineOn] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [menu, setMenu] = useState<MoveContextMenuTarget | null>(null);
  const [optionsOpen, setOptionsOpen] = useState(false);
  // Si el módulo tiene una línea desplegada. Vive aquí porque lo que decide es
  // cuánto alto le cede la notación, y de eso responde la tarjeta.
  const [engineExpanded, setEngineExpanded] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);

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

  /**
   * Ir a una jugada: se apunta dentro y se avisa fuera.
   *
   * Las dos cosas, y no una: sin el estado interno el visor no funcionaría solo,
   * y sin el aviso, en modo controlado no se movería nunca —quien manda tiene
   * que enterarse para devolver la ruta nueva—.
   */
  const setCurrentPath = useCallback((next: string) => {
    setSelectedPath(next);
    onPathChangeRef.current?.(next);
  }, []);

  /**
   * La jugada de ahora, para quien la necesite MÁS TARDE.
   *
   * Los botones de navegación se leen de aquí y no de una dependencia: si se
   * recrearan con cada jugada, mantener pulsado «siguiente» repetiría siempre el
   * mismo paso —el que se capturó al apretar—.
   */
  const currentPathRef = useRef(currentPath);
  useEffect(() => {
    currentPathRef.current = currentPath;
  });

  // Editar es cosa de dos: el permiso y alguien a quien entregarle el PGN. Sin
  // las dos cosas el visor es exactamente el de antes.
  const isEditing = editable && Boolean(onPgnChange);
  // Por referencia, como el aviso de ruta: publicar el PGN no depende de que
  // quien consume el visor memorice su callback.
  const onPgnChangeRef = useRef(onPgnChange);
  useEffect(() => {
    onPgnChangeRef.current = onPgnChange;
  });
  const publishPgn = useCallback((next: string) => onPgnChangeRef.current?.(next), []);
  const editing = usePgnEditing({ pgn, onPgnChange: publishPgn, onPathChange: setCurrentPath });

  // Mantener pulsado «atrás» o «adelante» sigue recorriendo la partida: una
  // espera antes de arrancar, para no disparar la repetición en un clic normal,
  // y a partir de ahí una jugada cada poco.
  const repeatRef = useRef<{ delay?: number; step?: number }>({});
  const stopRepeat = useCallback(() => {
    window.clearTimeout(repeatRef.current.delay);
    window.clearInterval(repeatRef.current.step);
    repeatRef.current = {};
  }, []);
  const startRepeat = useCallback(
    (action: () => void) => {
      stopRepeat();
      repeatRef.current.delay = window.setTimeout(() => {
        repeatRef.current.step = window.setInterval(action, HOLD_STEP_MS);
      }, HOLD_DELAY_MS);
    },
    [stopRepeat],
  );
  useEffect(() => stopRepeat, [stopRepeat]);

  const goToStart = useCallback(() => setCurrentPath(""), [setCurrentPath]);
  const goToPrevious = useCallback(
    () => setCurrentPath(parentPathOf(currentPathRef.current)),
    [setCurrentPath],
  );
  const goToNext = useCallback(() => {
    if (!tree) return;
    const next = nextPathOf(tree, currentPathRef.current);
    if (next) setCurrentPath(next);
  }, [tree, setCurrentPath]);
  const goToEnd = useCallback(() => {
    if (!tree) return;
    setCurrentPath(endPathOf(tree, currentPathRef.current));
  }, [tree, setCurrentPath]);

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
      // Mientras se escribe un comentario las flechas mueven el cursor, no la
      // partida.
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "TEXTAREA" || target.tagName === "INPUT" || target.isContentEditable)) return;
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

  // El menú de opciones se cierra como cualquier otro: pulsando fuera o con
  // Escape.
  useEffect(() => {
    if (!optionsOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!optionsRef.current?.contains(event.target as Node)) setOptionsOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOptionsOpen(false);
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [optionsOpen]);

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
  const atStart = currentPath.length === 0;
  const atEnd = nextPathOf(tree, currentPath) === undefined;

  /** La jugada como se lee en la lista («1… f5»): titula su menú. */
  const labelOf = (path: string): string => {
    const target = nodeAtPath(tree, path);
    return target ? numberedMoveLabel(target.ply, target.san) : "esta jugada";
  };

  const openMenu = (path: string, event: MouseEvent) => {
    setCurrentPath(path);
    setMenu({
      path,
      x: event.clientX,
      y: event.clientY,
      label: labelOf(path),
      // Los segmentos de la ruta SON los índices de hijo: todo ceros significa
      // que la jugada ya está en la línea principal.
      canPromote: !path.split(".").every((segment) => segment === "0"),
      // Y el último segmento, su puesto entre las hermanas.
      canPromoteOneStep: path.split(".").at(-1) !== "0",
    });
  };

  const requestEdit = (mode: "comment" | "annotate") => {
    if (!menu) return;
    onRequestEdit?.(mode, menu.path);
    setMenu(null);
  };

  const nav = (
    <div className="game-viewer__nav">
      <button
        type="button"
        title="Primera jugada"
        onClick={goToStart}
        disabled={atStart}
        className="game-viewer__nav-button"
      >
        <JumpStartIcon className="game-viewer__nav-icon" />
      </button>
      <button
        type="button"
        title="Jugada anterior"
        onClick={goToPrevious}
        disabled={atStart}
        onPointerDown={() => startRepeat(goToPrevious)}
        onPointerUp={stopRepeat}
        onPointerLeave={stopRepeat}
        onPointerCancel={stopRepeat}
        className="game-viewer__nav-button"
      >
        <ArrowLeftIcon className="game-viewer__nav-icon" />
      </button>
      <button
        type="button"
        title="Jugada siguiente"
        onClick={goToNext}
        disabled={atEnd}
        // Mantener pulsado recorre la partida; parar al soltar, al salir del
        // botón o si el navegador cancela el gesto.
        onPointerDown={() => startRepeat(goToNext)}
        onPointerUp={stopRepeat}
        onPointerLeave={stopRepeat}
        onPointerCancel={stopRepeat}
        className="game-viewer__nav-button game-viewer__nav-button_emphasis_strong"
      >
        <ArrowRightIcon className="game-viewer__nav-icon" />
      </button>
      <button
        type="button"
        title="Última jugada"
        onClick={goToEnd}
        disabled={atEnd}
        className="game-viewer__nav-button"
      >
        <JumpEndIcon className="game-viewer__nav-icon" />
      </button>
      {/* Girar el tablero es una acción de la partida, no un ajuste del visor:
          va con los botones con los que se la recorre. */}
      <button
        type="button"
        title="Girar el tablero"
        onClick={() => setFlipToggled((current) => !current)}
        className="game-viewer__nav-button"
      >
        <BoardFlipIcon className="game-viewer__nav-icon" />
      </button>

      {/* Sonido y pantalla completa son ajustes del visor, no de la partida: se
          pulsan una vez y estorban el resto del rato, así que van plegados en
          este menú, al final de la misma botonera. */}
      <div className="game-viewer__options" ref={optionsRef}>
        <button
          type="button"
          title="Opciones del visor"
          aria-haspopup="menu"
          aria-expanded={optionsOpen}
          onClick={() => setOptionsOpen((open) => !open)}
          className="game-viewer__nav-button"
        >
          <MenuIcon className="game-viewer__nav-icon" />
        </button>

        {optionsOpen && (
          <div className="game-viewer__options-menu" role="menu">
            <button
              type="button"
              // `menuitemcheckbox` y no `menuitem`: es un interruptor y el
              // lector de pantalla tiene que decir si está puesto.
              role="menuitemcheckbox"
              aria-checked={preferences.sound}
              onClick={() => {
                updatePreferences({ ...preferences, sound: !preferences.sound });
                setOptionsOpen(false);
              }}
              className="game-viewer__options-item"
            >
              {preferences.sound ? (
                <SoundOnIcon className="game-viewer__options-icon" />
              ) : (
                <SoundOffIcon className="game-viewer__options-icon" />
              )}
              {preferences.sound ? "Silenciar" : "Activar el sonido"}
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                toggleFullscreen();
                setOptionsOpen(false);
              }}
              className="game-viewer__options-item"
            >
              <FullscreenIcon className="game-viewer__options-icon" />
              {isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
            </button>
          </div>
        )}
      </div>

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
            <div className="game-viewer__board">
            <ChessBoard
              position={{
                fen,
                lastMove: node?.lastMove,
                check: node?.check ?? false,
                shapes: node ? node.shapes : tree.initialShapes,
              }}
              flipBoard={flipBoard}
              interactive={isEditing}
              onMove={(san) => editing.addMoveAt(currentPath, san)}
              editableShapes={isEditing}
              onShapesChange={(shapes) => editing.updateShapes(currentPath, shapes)}
            />
            </div>

            {/* La barra va entre el tablero y la notación, y se pinta SIEMPRE
                que el visor ofrezca módulo: encenderlo o apagarlo no puede
                mover de sitio ni el tablero ni el panel, así que su hueco está
                reservado desde el principio y lo único que cambia es si se ve. */}
            {engine && (
              <div
                className={`game-viewer__evaluation${engineOn ? "" : " game-viewer__evaluation_state_off"}`}
                aria-hidden="true"
              >
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
          </div>

          {players && (
            <div className="game-viewer__player game-viewer__player_side_bottom">
              {flipBoard ? players.black : players.white}
            </div>
          )}

          {controls === "board" && nav}
        </div>

        {/* A pantalla completa el pie no se pinta: ahí se lee la partida, y
            comentar y anotar se hacen en la pantalla normal —por eso el menú de
            la jugada tampoco ofrece esas dos opciones—. */}
        {boardFooter && (
          <div
            className={`game-viewer__board-footer${isFullscreen ? " game-viewer__board-footer_state_hidden" : ""}`}
          >
            {boardFooter}
          </div>
        )}

        {/* La columna derecha entera: la tarjeta de la notación y, por debajo y
            ya fuera de ella, la botonera con la que se recorre la partida. */}
        <div className="game-viewer__panel-column">
          <div
            className={`game-viewer__panel${engine && engineOn ? " game-viewer__panel_engine_on" : ""}${
              engine && engineOn && engineExpanded ? " game-viewer__panel_engine_expanded" : ""
            }`}
          >
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
                onToggle={() => {
                  setEngineOn((on) => !on);
                  setEngineExpanded(false);
                }}
                state={engineState}
                flipBoard={flipBoard}
                onExpandedChange={setEngineExpanded}
              />
            )}

            <div className="game-viewer__moves">
              {moveList === "flow" ? (
                <MoveTree
                  tree={tree}
                  currentPath={currentPath}
                  onSelect={setCurrentPath}
                  onContextMenu={isEditing ? openMenu : undefined}
                />
              ) : (
                <MoveTable
                  tree={tree}
                  currentPath={currentPath}
                  onSelect={setCurrentPath}
                  onContextMenu={isEditing ? openMenu : undefined}
                />
              )}
            </div>

            {/* El pie de la tarjeta sólo existe si la pantalla que monta el
                visor le da algo que poner: vacío era una franja blanca. */}
            {(positionActions || footerActions) && (
              <div className="game-viewer__toolbar">
                {positionActions?.(fen)}

                {footerActions && <div className="game-viewer__toolbar-end">{footerActions}</div>}
              </div>
            )}
          </div>

          {controls === "panel" && <div className="game-viewer__panel-nav">{nav}</div>}
        </div>
      </div>

      {menu && (
        <MoveContextMenu
          target={menu}
          onPromoteOneStep={() => {
            editing.promoteOneStepAt(menu.path);
            setMenu(null);
          }}
          onPromoteToMainLine={() => {
            editing.promoteToMainAt(menu.path);
            setMenu(null);
          }}
          onComment={onRequestEdit && !isFullscreen ? () => requestEdit("comment") : undefined}
          onAnnotate={onRequestEdit && !isFullscreen ? () => requestEdit("annotate") : undefined}
          onCopyVariation={() => editing.copyVariation(menu.path)}
          onDelete={() => {
            editing.deleteAt(menu.path);
            setMenu(null);
          }}
          onClose={() => setMenu(null)}
        />
      )}
    </div>
  );
}
