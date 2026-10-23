"use client";

import {
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import { ChessBoard } from "@/components/chess/chess-board.comp";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon.comp";
import { ChevronRightIcon } from "@/components/icons/chevron-right-icon.comp";
import { ArrowRightArrowLeftIcon } from "@/components/icons/arrow-right-arrow-left-icon.comp";
import { ExpandIcon } from "@/components/icons/expand-icon.comp";
import { ForwardStepIcon } from "@/components/icons/forward-step-icon.comp";
import { BackwardStepIcon } from "@/components/icons/backward-step-icon.comp";
import { BarsIcon } from "@/components/icons/bars-icon.comp";
import { VolumeXmarkIcon } from "@/components/icons/volume-xmark-icon.comp";
import { VolumeLowIcon } from "@/components/icons/volume-low-icon.comp";
import { FlagIcon } from "@/components/icons/flag-icon.comp";
import type { PlayStatus } from "@/lib/play/play-status";
import { numberedMoveLabel } from "@/lib/chess/notation";
import { endPathOf, nextPathOf, nodeAtPath, parentPathOf, parsePgnTree, treeUpToPly } from "@/lib/chess/pgn-tree";
import type { EngineClientHandle } from "@/components/chess/engine/use-engine-client.hook";
import { EnginePanel } from "./engine-panel.comp";
import { useEngine } from "./use-engine.hook";
import { evaluationBarFill } from "@/lib/chess/engine-protocol";
import { MoveContextMenu, type MoveContextMenuTarget } from "./move-context-menu.comp";
import { GameTools, useToolsTab } from "./game-tools.comp";
import { GameOverActions, type GameOverActionsData } from "./game-over-actions.comp";
import { type PlayerInfo, PlayerStrip } from "./player-strip.comp";
import { playerOutcomes } from "@/lib/chess/player-outcomes";
import { useLingering } from "./use-lingering.hook";
import { MoveTable } from "./move-table.comp";
import { mdButton, mdIconButton } from "@/lib/material/material-classes";
import { MoveTree } from "./move-tree.comp";
import { MoveNotes } from "./move-notes.comp";
import { TrophyIcon } from "@/components/icons/trophy-icon.comp";
import { lineThrough } from "@/lib/chess/notation-line";
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

/** A game being played on the viewer (`interaction="play"`), or the actions of one that is over. */
export interface GameViewerPlay {
  /** The person's colour: the board moves only for it. */
  color: "white" | "black";
  /** From `playStatusOf`: the board moves only on `your-turn`, and only at the end of the line. */
  status: PlayStatus;
  /** The person's move, as SAN; the viewer adds nothing to the PGN itself. */
  onMove?: (san: string) => void;
  /** «Abandonar», while the game is on: the page opens its popup. */
  onAbandon?: (event: MouseEvent<HTMLButtonElement>) => void;
  /** Once it is over, what goes under the board (G6). */
  over?: GameOverActionsData;
  /**
   * The line being played, when it is not the main line: from `fromPath`
   * (the node it started at) to `leafPath` (its last move). The board moves
   * only at `leafPath`, and the notation paints the line's moves in the
   * selection's blue — the analysis board playing a position against the
   * module. Without them, the main line and its end.
   */
  fromPath?: string;
  leafPath?: string;
}

interface GameViewerProps {
  /** Full PGN: moves, variations, comments and annotations. */
  pgn: string;
  orientation?: "white" | "black";
  /** Dotted path to open the viewer at (TrainingExercise.path / ClassBlock.movePath). */
  initialPath?: string;
  title?: string;
  /** A line above the title, beside the badge, in `notes` («Capítulo 2 · La Najdorf»); a link with `href`. */
  subtitle?: { label: string; href?: string };
  /** Badge to the right of the title ("Prioritaria"); above it, beside the subtitle, in `notes`. */
  badge?: string;
  /**
   * What the bar under the board offers BESIDES the four arrows: turning the
   * board around, and the settings menu (sound, full screen).
   *
   * A lesson shows none of it. It is taught from the side its author chose —
   * or the one the student fixed in the course's settings — the page is
   * already the whole window, and what is under the board there is the way
   * through the lesson and nothing else.
   */
  boardTools?: boolean;
  /**
   * How the viewer is drawn. `material`: the new design system's
   * (2026-10-22), for a page already passed to it — the blue board with the
   * «elegida» pieces, Material's keys under it and the notation loose on the
   * panel. Without it, the platform's own look.
   */
  look?: "material";
  /**
   * The button at the right end of the bar under the board: the way OUT while
   * there are moves left («Saltar»), and the way ON once the last one is
   * reached («Continuar»), where it takes the emphasis.
   *
   * It is given as data and not as a slot: `finish` is a server action, which
   * travels as a prop like any other value, and the viewer is the only one
   * that knows when the last move has been reached.
   */
  onwards?: {
    /** Where the way out leads. Without it, nothing is drawn until the end. */
    skipHref?: string;
    skipLabel: string;
    skipTitle?: string;
    finishLabel: string;
    finish: () => Promise<void>;
  };
  /**
   * Who plays, for the strips around the board. Given by colour, not by
   * position, because the viewer can be flipped: who is on top depends on the
   * orientation and only the viewer knows it. The viewer draws the strips
   * itself (`PlayerStrip`).
   */
  players?: { white: PlayerInfo; black: PlayerInfo };
  /**
   * The game's result as its PGN token ("1-0", "0-1", "1/2-1/2", "*"): each
   * strip then opens with the point its player took. Nothing is drawn for a
   * game that has not ended, or without `players`.
   */
  result?: string;
  /**
   * A text of the game's owner for everyone who opens the game — what to look
   * for, whose turn it is to think —, drawn as the first comment of the
   * notation, before the moves: it is read before the game, where its other
   * comments are read.
   */
  pinnedComment?: string;
  /**
   * The game is read with its next moves hidden: the notation shows the moves
   * up to the furthest one stepped onto, and each of the rest comes out as the
   * arrows reach it. For a reader's «what would you play?»; an editor sees
   * everything, so it does nothing with `editable`.
   */
  hideNextMoves?: boolean;
  /**
   * `table` (default): a no. · white · black grid, like Lichess.
   * `flow`: the usual running text, which is how lessons are read —
   * there the game is still read, not consulted move by move.
   * `notes`: a lesson read one move at a time, in the new design system —
   * the line as pills, the note on the move on the board, the way to the
   * next one, and how far through the line one is under the title.
   */
  moveList?: "table" | "flow" | "notes";
  /**
   * The lesson's exercises, at the foot of the panel in `notes`: what there
   * is to practise, how it stands and the way in. Data, drawn by the viewer.
   */
  practice?: {
    title: string;
    detail: string;
    action?: { href: string; label: string };
  };
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
   * «Crear ejercicio desde aquí» (D11): the address of a new exercise from
   * this game, to which the viewer appends `&jugada=<path>` for the move the
   * menu opened on and for the current one in the tools' «Compartir». Given
   * only to a teacher on their own game, with the exercises on
   * (`GameView.canCreateExercise`); a link, so nothing is saved by it.
   */
  exerciseFromHereHref?: string;
  /**
   * Offers the analysis engine. Off by default: it is 7 MB of WebAssembly that
   * are only downloaded when someone switches it on, and not even that until then.
   */
  engine?: boolean;
  /**
   * The engine to analyse on, when whoever mounts the viewer owns one it
   * shares with something else — the analysis board's analysis and its
   * full-strength module are one Worker. Without it the viewer creates its own.
   */
  engineClient?: EngineClientHandle;
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
   * How the viewer is used: `read` goes through the game; `edit` annotates
   * it (what `editable` says); `play` plays a live game on it: the board
   * moves only for `play.color`, only on its turn and only at the end of the
   * line, with no move menu, no arrows and nothing to edit. Without it, `edit`
   * when `editable`, otherwise `read`.
   */
  interaction?: "read" | "edit" | "play";
  /** The live game, with `interaction="play"`; or, with any interaction, a finished game's actions (`over`). */
  play?: GameViewerPlay;
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

/** The strip's container says what kind of strip it holds and how the game ended for it (G6). */
function stripModifiers(player: PlayerInfo): string {
  return `${player.avatar ? " game-viewer__player_kind_played" : ""}${player.ending ? ` game-viewer__player_ending_${player.ending.kind}` : ""}`;
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
  badge,
  practice,
  boardTools = true,
  look,
  onwards,
  players,
  result,
  pinnedComment,
  hideNextMoves = false,
  moveList = "table",
  controls = "board",
  tools,
  exerciseFromHereHref,
  engine = false,
  engineClient,
  onPathChange,
  editable = false,
  onPgnChange,
  interaction,
  play,
  path,
}: GameViewerProps) {
  const tree = useMemo(() => parsePgnTree(pgn), [pgn]);
  const outcomes = playerOutcomes(result);
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

  // Playing, the board follows the game: when a move lands at the end of the
  // line and the person was looking at the end, they go on looking at it; one
  // who went back to look at an earlier move is left there. Adjusted while
  // rendering, as a state that follows another, so no frame shows the old end.
  const mainEnd = useMemo(() => (tree ? endPathOf(tree, "") : ""), [tree]);
  const leafPath = play?.leafPath ?? mainEnd;
  const [followedLeaf, setFollowedLeaf] = useState(leafPath);
  if (leafPath !== followedLeaf) {
    setFollowedLeaf(leafPath);
    if (interaction === "play" && (selectedPath === followedLeaf || play?.leafPath !== undefined)) {
      setSelectedPath(leafPath);
    }
  }
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
  const isPlaying = interaction === "play" && play !== undefined;
  const isEditing =
    (interaction === "edit" || (interaction === undefined && editable)) && Boolean(onPgnChange) && !isPlaying;
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
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      event.preventDefault();

      // The move that was clicked keeps the focus, and the first arrow makes
      // the browser show its focus ring — on a move that is no longer the one
      // being looked at. Walking the game with the arrows is not walking the
      // list, so the focus is let go of; whoever reached a move with Tab
      // still gets their ring, because that is where they are.
      const focused = document.activeElement;
      if (focused instanceof HTMLElement && focused.closest(".game-viewer__moves")) focused.blur();

      if (event.key === "ArrowRight") goToNext();
      else goToPrevious();
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

  // With the next moves hidden, how far the game has been shown: the furthest
  // ply stepped onto, which going back does not lower. Adjusted while
  // rendering, as a state that follows another, so the notation never draws a
  // frame behind the board.
  const [revealedPly, setRevealedPly] = useState(0);
  const currentPly = node?.ply ?? 0;
  if (currentPly > revealedPly) setRevealedPly(currentPly);
  const concealing = hideNextMoves && !isEditing;
  const notationTree = useMemo(
    () => (tree && concealing ? treeUpToPly(tree, revealedPly) : tree),
    [tree, concealing, revealedPly],
  );
  // Whether anything is still out of sight: said under the list, so the short
  // notation is not taken for the whole game.
  const hasHiddenMoves = useMemo(
    () => concealing && tree !== null && [...tree.nodesByPath.values()].some((hidden) => hidden.ply > revealedPly),
    [tree, concealing, revealedPly],
  );

  // The engine lives here and not in its panel because its evaluation is used
  // by TWO places far apart on the screen: the bar next to the board and the
  // notation line. With `engine` off the hook creates no worker and downloads nothing.
  // Playing, the board is the game's: no evaluation, no lines (T3), and the
  // shared engine is free for whoever plays on it.
  const engineState = useEngine(fen, engine && engineOn && !isPlaying, engineClient);

  // The line being played against the module, painted in the notation.
  const lineFrom = play?.fromPath;
  const lineEnd = play?.leafPath;
  const playedLine = useMemo(() => {
    if (!isPlaying || lineFrom === undefined || lineEnd === undefined) return undefined;
    const segments = lineEnd ? lineEnd.split(".") : [];
    const from = lineFrom ? lineFrom.split(".").length : 0;
    return new Set(segments.slice(from).map((_, index) => segments.slice(0, from + index + 1).join(".")));
  }, [isPlaying, lineFrom, lineEnd]);

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
  /** «Crear ejercicio desde aquí» for a move: the game's address with that move appended. */
  const exerciseHrefFor = (movePath: string) =>
    exerciseFromHereHref === undefined ? undefined : `${exerciseFromHereHref}&jugada=${encodeURIComponent(movePath)}`;

  const material = look === "material";
  // A key of the bar: the platform's square, or Material's wide pill — the
  // way forward filled, the rest tonal.
  const keyClass = (main = false) =>
    material ? mdIconButton(main ? "filled" : "tonal", "sm", "wide") : "game-viewer__nav-button";
  const keyIcon = material ? "platform-md-icon" : "game-viewer__nav-icon";
  const onwardsClass = (finish: boolean) =>
    material
      ? `${mdButton(finish ? "filled" : "tonal", "sm")} game-viewer__onwards-button`
      : "platform-button platform-button_size_lg game-viewer__onwards-button";

  const nav = (
    <div className="game-viewer__nav">
      <button type="button" title="Primera jugada" onClick={goToStart} disabled={atStart} className={keyClass()}>
        <BackwardStepIcon variant="classic-solid" className={keyIcon} />
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
        className={keyClass()}
      >
        <ChevronLeftIcon variant="classic-solid" className={keyIcon} />
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
        className={keyClass(true)}
      >
        <ChevronRightIcon variant="classic-solid" className={keyIcon} />
      </button>
      <button type="button" title="Última jugada" onClick={goToEnd} disabled={atEnd} className={keyClass()}>
        <ForwardStepIcon variant="classic-solid" className={keyIcon} />
      </button>
      {/* Flipping the board is an action on the game, not a viewer setting:
          it goes with the buttons the game is traversed with. */}
      {boardTools && (
        <button
          type="button"
          title="Girar el tablero"
          onClick={() => setFlipToggled((current) => !current)}
          className={keyClass()}
        >
          <ArrowRightArrowLeftIcon className={keyIcon} />
        </button>
      )}

      {/* Sound and full screen are viewer settings, not game ones: they are
          pressed once and get in the way the rest of the time, so they are folded
          into this menu, at the end of the same button bar. */}
      {boardTools && (
        <div className="game-viewer__options" ref={optionsRef}>
          <button
            type="button"
            title="Opciones del visor"
            aria-haspopup="menu"
            aria-expanded={optionsOpen}
            onClick={() => setOptionsOpen((open) => !open)}
            className={keyClass()}
            ref={optionsButtonRef}
          >
            <BarsIcon className={keyIcon} />
          </button>

          {lingeringOptions.value && (
            // eslint-disable-next-line jsx-a11y/interactive-supports-focus -- the focus goes to the items inside it, never to the container
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
                  <VolumeLowIcon className="game-viewer__options-icon" />
                ) : (
                  <VolumeXmarkIcon className="game-viewer__options-icon" />
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
                <ExpandIcon className="game-viewer__options-icon" />
                {isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* At the last move there is nothing left to skip: the button becomes
          the way on, and the one that marks the lesson done. */}
      {onwards && (
        <div className="game-viewer__onwards">
          {atEnd ? (
            <form action={onwards.finish}>
              <button type="submit" className={onwardsClass(true)}>
                {onwards.finishLabel}
              </button>
            </form>
          ) : (
            onwards.skipHref && (
              <Link href={onwards.skipHref} title={onwards.skipTitle} className={onwardsClass(false)}>
                {onwards.skipLabel}
              </Link>
            )
          )}
        </div>
      )}
    </div>
  );
  const hasHead = Boolean(title || badge);
  const notes = moveList === "notes";
  // How far through the line being read: the move on the board of all of them.
  const notesLine = notes && tree ? lineThrough(notationTree ?? tree, currentPath) : [];
  const notesAt = notesLine.findIndex((step) => step.path === currentPath) + 1;

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- not a control: the click is only noted, so the viewer's keys answer once it has been used
    <div
      className={`game-viewer${material ? " game-viewer_look_material" : ""}${moveList === "notes" ? " game-viewer_list_notes" : ""}${isFullscreen ? " game-viewer_state_fullscreen" : ""}`}
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
            <div
              className={`game-viewer__player game-viewer__player_side_top${stripModifiers(flipBoard ? players.white : players.black)}`}
            >
              {flipBoard ? (
                <PlayerStrip {...players.white} outcome={outcomes?.white} />
              ) : (
                <PlayerStrip {...players.black} outcome={outcomes?.black} />
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
                look={look}
                interactive={isEditing || isPlaying}
                onMove={(san) => (isPlaying ? play?.onMove?.(san) : editing.addMoveAt(currentPath, san))}
                movableColor={
                  isPlaying
                    ? play?.status === "your-turn" && currentPath === leafPath
                      ? play.color
                      : "none"
                    : undefined
                }
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
                className={`game-viewer__evaluation${engineOn && !isPlaying ? "" : " game-viewer__evaluation_state_off"}`}
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
            <div
              className={`game-viewer__player game-viewer__player_side_bottom${stripModifiers(flipBoard ? players.black : players.white)}`}
            >
              {flipBoard ? (
                <PlayerStrip {...players.black} outcome={outcomes?.black} />
              ) : (
                <PlayerStrip {...players.white} outcome={outcomes?.white} />
              )}
            </div>
          )}

          {play?.over && (
            <GameOverActions {...play.over} onAnalyse={tools ? () => toolsTab.reveal("review") : undefined} />
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
              exerciseFromHereHref={exerciseHrefFor(currentPath)}
            />
          </div>
        )}

        {/* The whole right column: the notation card and, below it and already
            outside it, the button bar the game is traversed with. */}
        <div className="game-viewer__panel-column">
          <div
            className={`game-viewer__panel${engine && engineOn && !isPlaying ? " game-viewer__panel_engine_on" : ""}${
              engine && engineOn && engineExpanded ? " game-viewer__panel_engine_expanded" : ""
            }`}
          >
            {hasHead && !notes && (
              <div className="game-viewer__panel-head">
                <div className="game-viewer__panel-heading">
                  {title && <p className="game-viewer__panel-title">{title}</p>}
                </div>
                {badge && <span className="game-viewer__panel-badge">{badge}</span>}
              </div>
            )}

            {/* A lesson read one move at a time: the badge and where it is
                above the title, and how far through the line under it. */}
            {notes && (
              <div className="game-viewer__panel-head game-viewer__panel-head_list_notes">
                {(badge || subtitle) && (
                  <p className="game-viewer__panel-kicker">
                    {badge && <span className="game-viewer__panel-badge">{badge}</span>}
                    {subtitle &&
                      (subtitle.href ? (
                        <Link href={subtitle.href} className="game-viewer__panel-subtitle">
                          {subtitle.label}
                        </Link>
                      ) : (
                        <span className="game-viewer__panel-subtitle">{subtitle.label}</span>
                      ))}
                  </p>
                )}
                {title && <h1 className="game-viewer__panel-title">{title}</h1>}
                {notesLine.length > 0 && (
                  <div className="game-viewer__progress">
                    <span className="game-viewer__progress-track" aria-hidden="true">
                      <span
                        className="game-viewer__progress-fill"
                        style={{ width: `${(notesAt / notesLine.length) * 100}%` }}
                      />
                    </span>
                    <span className="game-viewer__progress-text">
                      Jugada {notesAt} de {notesLine.length}
                    </span>
                  </div>
                )}
              </div>
            )}

            {engine && !isPlaying && (
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

            <div className={`game-viewer__moves${moveList !== "table" ? ` game-viewer__moves_list_${moveList}` : ""}`}>
              {notes ? (
                <MoveNotes
                  tree={notationTree ?? tree}
                  currentPath={currentPath}
                  onSelect={setCurrentPath}
                  pinnedComment={pinnedComment}
                />
              ) : moveList === "flow" ? (
                <MoveTree
                  tree={notationTree ?? tree}
                  currentPath={currentPath}
                  onSelect={setCurrentPath}
                  onContextMenu={isEditing ? openMenu : undefined}
                  pinnedComment={pinnedComment}
                  highlightedPaths={playedLine}
                  look={look}
                />
              ) : (
                <MoveTable
                  tree={notationTree ?? tree}
                  currentPath={currentPath}
                  onSelect={setCurrentPath}
                  onContextMenu={isEditing ? openMenu : undefined}
                  pinnedComment={pinnedComment}
                  highlightedPaths={playedLine}
                />
              )}
              {/* Said in the list itself, where the missing moves would be looked for. */}
              {hasHiddenMoves && (
                <p className="game-viewer__concealed">
                  Las jugadas siguientes están ocultas: avanza para descubrirlas.
                </p>
              )}
            </div>

            {/* The lesson's exercises, at the foot of the panel (D25). */}
            {notes && practice && (
              <aside className="game-viewer__practice" aria-label="Ejercicios de la lección">
                <span className="game-viewer__practice-disc" aria-hidden="true">
                  <TrophyIcon variant="classic-solid" className="game-viewer__practice-icon" />
                </span>
                <p className="game-viewer__practice-text">
                  <span className="game-viewer__practice-title">{practice.title}</span>
                  <span className="game-viewer__practice-detail">{practice.detail}</span>
                </p>
                {practice.action && (
                  <Link href={practice.action.href} className={mdButton("tonal", "sm")}>
                    <TrophyIcon variant="classic-solid" className="platform-md-icon" />
                    {practice.action.label}
                  </Link>
                )}
              </aside>
            )}

            {/* While a game is on, its one action under the moves (P2). */}
            {isPlaying && play?.onAbandon && play.status !== "over" && (
              <div className="game-viewer__toolbar">
                <div className="game-viewer__toolbar-end">
                  <button
                    type="button"
                    className="platform-button platform-button_variant_danger platform-button_size_sm"
                    onClick={play.onAbandon}
                    disabled={play.status === "halted"}
                  >
                    <FlagIcon variant="classic-solid" className="platform-button__icon" />
                    Abandonar
                  </button>
                </div>
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
          createExerciseHref={exerciseHrefFor(lingeringMenu.value.path)}
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
