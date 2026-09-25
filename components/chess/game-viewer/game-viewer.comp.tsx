"use client";

import {
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { ChessBoard } from "@/components/chess/chess-board.comp";
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
import { useEngine } from "./use-engine.hook";
import { evaluationBarFill } from "@/lib/chess/engine-protocol";
import { MoveContextMenu, type MoveContextMenuTarget } from "./move-context-menu.comp";
import { GameTools, useToolsTab } from "./game-tools.comp";
import { type PlayerInfo, PlayerStrip } from "./player-strip.comp";
import { useLingering } from "./use-lingering.hook";
import { MoveTable } from "./move-table.comp";
import { MoveTree } from "./move-tree.comp";
import { playMoveSound } from "./move-sound";
import { usePgnEditing } from "./use-pgn-editing.hook";
import {
  getServerViewerPreferences,
  getViewerPreferences,
  setViewerPreferences,
  subscribeToViewerPreferences,
  type ViewerPreferences,
} from "./viewer-preferences";
import "./game-viewer.comp.css";

interface GameViewerProps {
  /** Full PGN: moves, variations, comments and annotations. */
  pgn: string;
  orientation?: "white" | "black";
  /** Dotted path to open the viewer at (TrainingExercise.path / ClassBlock.movePath). */
  initialPath?: string;
  title?: string;
  /** Second line of the header: chapter, event, whatever places the game. */
  subtitle?: string;
  /** Text of the game or the lesson, under the subtitle. */
  description?: string;
  /** Badge to the right of the title ("Prioridad"). */
  badge?: string;
  /** Button that closes the bottom bar, right-aligned (the notes). */
  footerActions?: ReactNode;
  /** Bottom-bar action that works on the current position. */
  positionActions?: (fen: string) => ReactNode;
  /** "Skip" button under the board. Without a destination it is not rendered. */
  skip?: ReactNode;
  /**
   * Who plays, for the strips around the board. Given by colour, not by
   * position, because the viewer can be flipped: who is on top depends on the
   * orientation and only the viewer knows it. The viewer draws the strips
   * itself (`PlayerStrip`).
   */
  players?: { white: PlayerInfo; black: PlayerInfo };
  /**
   * `table` (default): a no. · white · black grid, like Lichess.
   * `flow`: the usual running text, which is how lessons are read —
   * there the game is still read, not consulted move by move.
   */
  moveList?: "table" | "flow";
  /**
   * Where the four navigation buttons go. Under the board in lessons; inside
   * the moves panel in Mis estudios, which is where the game is traversed.
   */
  controls?: "board" | "panel";
  /**
   * The tools under the board — comment, quality, whole-game evaluation,
   * share and export (`GameTools`) — for the screens where the game is
   * annotated. `saveLabel` says how the autosave, which whoever mounts the
   * viewer runs on the PGN it receives, is going. Hidden in full screen.
   */
  tools?: { saveLabel?: string };
  /**
   * Offers the analysis engine. Off by default: it is 7 MB of WebAssembly that
   * are only downloaded when someone switches it on, and not even that until then.
   */
  engine?: boolean;
  /**
   * Reports the dotted path of the current node every time it changes. It
   * exists so the class block editor can capture "this position" without a
   * second viewer; the viewer stays read-only and whoever does not pass this
   * prop notices no difference.
   */
  onPathChange?: (path: string) => void;
  /**
   * Turns the viewer into an editor: moves are played on the board to add
   * moves and variations, arrows are drawn, and right-clicking a move opens
   * its menu (promote, comment, annotate, copy and delete).
   *
   * There is no separate editing screen: the game is annotated where it is
   * read. Without `onPgnChange` this does nothing, because the viewer does
   * not save: it reports the new PGN and whoever mounts it decides what to do with it.
   */
  editable?: boolean;
  onPgnChange?: (pgn: string) => void;
  /**
   * Which move to show, when whoever mounts the viewer wants to decide — the
   * evaluation chart takes the board to the move being pointed at.
   *
   * Without this prop the viewer keeps deciding by itself and nothing
   * changes; with it, whoever passes it is in charge and has to feed back
   * whatever arrives through `onPathChange` or the board will not move.
   */
  path?: string;
}

/** How long the button has to be held before the game starts running. */
const HOLD_DELAY_MS = 400;

/** How often it advances one move while held. */
const HOLD_STEP_MS = 130;

/** Pieces on the board, to tell a capture from an ordinary move. */
function pieceCount(fen: string): number {
  return (fen.split(" ")[0] ?? "").replace(/[^a-zA-Z]/g, "").length;
}

/**
 * THE platform's game viewer: lessons, Mis estudios games and class blocks
 * use this same component (board + move tree with variations and comments +
 * navigation). Do not create parallel viewers.
 */
export function GameViewer({
  pgn,
  orientation = "white",
  initialPath,
  title,
  subtitle,
  description,
  badge,
  footerActions,
  positionActions,
  skip,
  players,
  moveList = "table",
  controls = "board",
  tools,
  engine = false,
  onPathChange,
  editable = false,
  onPgnChange,
  path,
}: GameViewerProps) {
  const tree = useMemo(() => parsePgnTree(pgn), [pgn]);
  const [selectedPath, setSelectedPath] = useState<string>(() =>
    initialPath && tree?.nodesByPath.has(initialPath) ? initialPath : "",
  );

  /**
   * The chosen move, or the closest ancestor of it that still exists.
   *
   * The PGN can change underfoot — a change is undone, a branch is deleted,
   * the panel below edits it — and leave the path pointing at a move that is
   * no longer there. It is resolved at render time and not with an effect
   * that corrects the state: that way there is no frame with the board at the
   * initial position.
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
  // Both menus stay mounted for a moment after closing so their exit can play.
  const lingeringMenu = useLingering(menu);
  const lingeringOptions = useLingering(optionsOpen ? true : null);
  // Whether the engine has an expanded line. It lives here because what it
  // decides is how much height the notation gives up, and the card answers for that.
  const [engineExpanded, setEngineExpanded] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);
  const optionsButtonRef = useRef<HTMLButtonElement>(null);

  // Closing from the keyboard or by choosing an option hands the focus back to
  // the button that opened the menu; closing by clicking elsewhere does not,
  // because the click already decided where the focus goes.
  const closeOptions = useCallback((returnFocus: boolean) => {
    setOptionsOpen(false);
    if (returnFocus) optionsButtonRef.current?.focus();
  }, []);

  // External store: the first paint uses the defaults (the only thing the
  // server can know) and React catches up with what is stored as soon as it
  // hydrates, without an effect calling setState.
  const preferences = useSyncExternalStore<ViewerPreferences>(
    subscribeToViewerPreferences,
    getViewerPreferences,
    getServerViewerPreferences,
  );
  const updatePreferences = useCallback((next: ViewerPreferences) => setViewerPreferences(next), []);

  const rootRef = useRef<HTMLDivElement>(null);
  const isInViewportRef = useRef(false);
  const hasBeenClickedRef = useRef(false);

  // By reference: that way notifying the path change does not depend on the
  // consumer of the viewer memoising the callback.
  const onPathChangeRef = useRef(onPathChange);
  useEffect(() => {
    onPathChangeRef.current = onPathChange;
  });
  useEffect(() => {
    onPathChangeRef.current?.(currentPath);
  }, [currentPath]);

  /**
   * Go to a move: point at it inside and notify outside.
   *
   * Both things, not one: without the internal state the viewer would not
   * work on its own, and without the notification it would never move in
   * controlled mode — whoever is in charge has to find out to feed back the new path.
   */
  const setCurrentPath = useCallback((next: string) => {
    setSelectedPath(next);
    onPathChangeRef.current?.(next);
  }, []);

  /**
   * The current move, for whoever needs it LATER.
   *
   * The navigation buttons read it from here and not from a dependency: if
   * they were recreated with every move, holding "next" would always repeat
   * the same step — the one captured when pressing.
   */
  const currentPathRef = useRef(currentPath);
  useEffect(() => {
    currentPathRef.current = currentPath;
  });

  // Editing takes two: the permission and someone to hand the PGN to. Without
  // both the viewer is exactly the one it was before.
  const isEditing = editable && Boolean(onPgnChange);
  // By reference, like the path notification: publishing the PGN does not
  // depend on the consumer of the viewer memoising its callback.
  const onPgnChangeRef = useRef(onPgnChange);
  useEffect(() => {
    onPgnChangeRef.current = onPgnChange;
  });
  const publishPgn = useCallback((next: string) => onPgnChangeRef.current?.(next), []);
  const editing = usePgnEditing({ pgn, onPgnChange: publishPgn, onPathChange: setCurrentPath });

  // The tools' tab lives here and not in the panel because the move menu,
  // which is the viewer's, changes it too: "Comentar este movimiento" opens
  // that panel. Mounted always (a hook cannot be conditional); read only with `tools`.
  const toolsTab = useToolsTab(isEditing);

  // Holding "back" or "forward" keeps traversing the game: a wait before
  // starting, so an ordinary click does not trigger the repeat, and from
  // then on one move every so often.
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
  const goToPrevious = useCallback(() => setCurrentPath(parentPathOf(currentPathRef.current)), [setCurrentPath]);
  const goToNext = useCallback(() => {
    if (!tree) return;
    const next = nextPathOf(tree, currentPathRef.current);
    if (next) setCurrentPath(next);
  }, [tree, setCurrentPath]);
  const goToEnd = useCallback(() => {
    if (!tree) return;
    setCurrentPath(endPathOf(tree, currentPathRef.current));
  }, [tree, setCurrentPath]);

  // The arrow keys only act when the viewer is in view or was clicked, like
  // ChessBoard: there may be several viewers on the same page.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) isInViewportRef.current = entry.isIntersecting;
      },
      { threshold: 0.6 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isInViewportRef.current && !hasBeenClickedRef.current) return;
      // While a comment is being typed the arrow keys move the cursor, not the
      // game.
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

  // The options menu closes like any other: clicking outside or with
  // Escape.
  useEffect(() => {
    if (!optionsOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!optionsRef.current?.contains(event.target as Node)) setOptionsOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeOptions(true);
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [optionsOpen, closeOptions]);

  // A menu that opens takes the focus with it, like `MoveContextMenu`: otherwise
  // a keyboard user opens it and is left on the button, with the options out
  // of reach.
  useEffect(() => {
    if (!optionsOpen) return;
    optionsRef.current?.querySelector<HTMLButtonElement>(".game-viewer__options-menu button")?.focus();
  }, [optionsOpen]);

  /** Up and down walk the options and wrap around; the other keys are the page's. */
  const handleOptionsKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    const items = Array.from(event.currentTarget.querySelectorAll("button"));
    if (items.length === 0) return;
    event.preventDefault();
    event.stopPropagation();
    const current = items.findIndex((item) => item === document.activeElement);
    const step = event.key === "ArrowDown" ? 1 : -1;
    items[(current + step + items.length) % items.length]?.focus();
  };

  // Full screen can be left with Escape without going through the button, so
  // the state is read from the document and not from who pressed.
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

  // The engine lives here and not in its panel because its evaluation is used
  // by TWO places far apart on the screen: the bar next to the board and the
  // notation line. With `engine` off the hook creates no worker and downloads nothing.
  const engineState = useEngine(fen, engine && engineOn);

  // It sounds on position change, never on mount: whoever opens a lesson
  // does not expect a starting gun.
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

  /** The move as read in the list ("1… f5"): titles its menu. */
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
      // The path segments ARE the child indexes: all zeros means the move is
      // already on the main line.
      canPromote: !path.split(".").every((segment) => segment === "0"),
      // And the last segment, its place among its siblings.
      canPromoteOneStep: path.split(".").at(-1) !== "0",
    });
  };

  // "Comentar" and "Anotar" from the move menu go down to the tools under the
  // board, which is where one writes; the move is already selected by the click.
  const requestEdit = (mode: "comment" | "annotate") => {
    if (!menu) return;
    toolsTab.requestEdit(mode);
    setMenu(null);
  };
  // In full screen the tools are not rendered: there the game is read, and
  // commenting and annotating are done on the normal screen.
  const offersEdit = Boolean(tools) && !isFullscreen;

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
        // Holding traverses the game; stop on release, on leaving the button
        // or if the browser cancels the gesture.
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
      {/* Flipping the board is an action on the game, not a viewer setting:
          it goes with the buttons the game is traversed with. */}
      <button
        type="button"
        title="Girar el tablero"
        onClick={() => setFlipToggled((current) => !current)}
        className="game-viewer__nav-button"
      >
        <BoardFlipIcon className="game-viewer__nav-icon" />
      </button>

      {/* Sound and full screen are viewer settings, not game ones: they are
          pressed once and get in the way the rest of the time, so they are folded
          into this menu, at the end of the same button bar. */}
      <div className="game-viewer__options" ref={optionsRef}>
        <button
          type="button"
          title="Opciones del visor"
          aria-haspopup="menu"
          aria-expanded={optionsOpen}
          onClick={() => setOptionsOpen((open) => !open)}
          className="game-viewer__nav-button"
          ref={optionsButtonRef}
        >
          <MenuIcon className="game-viewer__nav-icon" />
        </button>

        {lingeringOptions.value && (
          <div
            className={`game-viewer__options-menu${lingeringOptions.closing ? " game-viewer__options-menu_state_closing" : ""}`}
            role="menu"
            onKeyDown={handleOptionsKeyDown}
          >
            <button
              type="button"
              // `menuitemcheckbox` and not `menuitem`: it is a toggle and the
              // screen reader has to say whether it is on.
              role="menuitemcheckbox"
              aria-checked={preferences.sound}
              onClick={() => {
                updatePreferences({ ...preferences, sound: !preferences.sound });
                closeOptions(true);
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
                closeOptions(true);
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
  const hasHead = Boolean(title || subtitle || description || badge);

  return (
    <div
      className={`game-viewer${isFullscreen ? " game-viewer_state_fullscreen" : ""}`}
      ref={rootRef}
      onClick={() => (hasBeenClickedRef.current = true)}
    >
      {/* A PGN with illegal moves would show truncated without warning; in
          development the problems are listed so the author can fix them. */}
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
              {flipBoard ? (
                <PlayerStrip {...players.white} side="white" />
              ) : (
                <PlayerStrip {...players.black} side="black" />
              )}
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

            {/* The bar goes between the board and the notation, and is painted
                WHENEVER the viewer offers an engine: switching it on or off cannot
                move either the board or the panel, so its slot is reserved from the
                start and the only thing that changes is whether it is visible. */}
            {engine && (
              <div
                className={`game-viewer__evaluation${engineOn ? "" : " game-viewer__evaluation_state_off"}`}
                aria-hidden="true"
              >
                <span
                  className="game-viewer__evaluation-fill"
                  style={{
                    // The bar fills from the BOTTOM with White's advantage, which
                    // is how it is read on any board.
                    height: `${(engineState.info === null ? 0.5 : evaluationBarFill(engineState.info.score)) * 100}%`,
                  }}
                />
              </div>
            )}
          </div>

          {players && (
            <div className="game-viewer__player game-viewer__player_side_bottom">
              {flipBoard ? (
                <PlayerStrip {...players.black} side="black" />
              ) : (
                <PlayerStrip {...players.white} side="white" />
              )}
            </div>
          )}

          {controls === "board" && nav}
        </div>

        {/* In full screen the tools are not rendered: there the game is read, and
            commenting and annotating are done on the normal screen — that is why
            the move menu does not offer those two options either. */}
        {tools && (
          <div className={`game-viewer__board-footer${isFullscreen ? " game-viewer__board-footer_state_hidden" : ""}`}>
            <GameTools
              pgn={pgn}
              currentPath={currentPath}
              canEdit={isEditing}
              saveLabel={tools.saveLabel}
              tab={toolsTab.tab}
              onTabChange={toolsTab.setTab}
              focusRequest={toolsTab.focusRequest}
              white={players?.white.name ?? "Blancas"}
              black={players?.black.name ?? "Negras"}
              onSelectPath={setCurrentPath}
              onPgnChange={publishPgn}
            />
          </div>
        )}

        {/* The whole right column: the notation card and, below it and already
            outside it, the button bar the game is traversed with. */}
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

            {/* The card's footer only exists when the screen mounting the viewer
                gives it something to show: empty, it was a white strip. */}
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

      {lingeringMenu.value && (
        <MoveContextMenu
          target={lingeringMenu.value}
          closing={lingeringMenu.closing}
          onPromoteOneStep={() => {
            if (menu) editing.promoteOneStepAt(menu.path);
            setMenu(null);
          }}
          onPromoteToMainLine={() => {
            if (menu) editing.promoteToMainAt(menu.path);
            setMenu(null);
          }}
          onComment={offersEdit ? () => requestEdit("comment") : undefined}
          onAnnotate={offersEdit ? () => requestEdit("annotate") : undefined}
          onCopyVariation={() => (menu ? editing.copyVariation(menu.path) : undefined)}
          onDelete={() => {
            if (menu) editing.deleteAt(menu.path);
            setMenu(null);
          }}
          onClose={() => setMenu(null)}
        />
      )}
    </div>
  );
}
