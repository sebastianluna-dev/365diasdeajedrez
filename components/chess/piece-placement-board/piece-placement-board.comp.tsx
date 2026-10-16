"use client";

import { useEffect, useRef, useState } from "react";
import { ToggleGroup } from "radix-ui";
import type { Api } from "@lichess-org/chessground/api";
import type { Color, Key, NumberPair, Piece, Role } from "@lichess-org/chessground/types";
import "@lichess-org/chessground/assets/chessground.base.css";
import "@lichess-org/chessground/assets/chessground.cburnett.css";
import { EraserIcon } from "@/components/icons/eraser-icon.comp";
import { HandPointerIcon } from "@/components/icons/hand-pointer-icon.comp";
import "./piece-placement-board.comp.css";

/** A piece of the palette, by its colour and its role: `"white-king"`, `"black-pawn"`… */
export type PlacementPiece = `${Color}-${Role}`;

/** What a tap on the board does: move what is there, put a piece, or take one off. */
export type PlacementTool = "move" | "remove" | PlacementPiece;

const ROLES: Role[] = ["king", "queen", "rook", "bishop", "knight", "pawn"];

/** The piece's name and its colour's agreement, for the tool's accessible name. */
const ROLE_NAMES: Record<Role, { name: string; feminine: boolean }> = {
  king: { name: "Rey", feminine: false },
  queen: { name: "Dama", feminine: true },
  rook: { name: "Torre", feminine: true },
  bishop: { name: "Alfil", feminine: false },
  knight: { name: "Caballo", feminine: false },
  pawn: { name: "Peón", feminine: false },
};

function pieceLabel(color: Color, role: Role): string {
  const { name, feminine } = ROLE_NAMES[role];
  const colour = color === "white" ? "blanc" : "negr";
  return `${name} ${colour}${feminine ? "a" : "o"}`;
}

interface PaletteItem {
  tool: PlacementTool;
  label: string;
  /** The piece file of `public/pieces` it shows, or none for the two tools drawn with an icon. */
  glyph: string | null;
}

/**
 * The palette in the order the keyboard walks it: the white pieces and
 * «Mover», then the black ones and «Quitar pieza». Seven and seven, so the two
 * colours line up piece by piece both in two columns beside the board and in
 * two rows under it.
 */
const PALETTE: PaletteItem[] = (["white", "black"] as const).flatMap((color): PaletteItem[] => [
  ...ROLES.map((role) => ({
    tool: `${color}-${role}` as const,
    label: pieceLabel(color, role),
    glyph: `${color === "white" ? "w" : "b"}-${role}`,
  })),
  color === "white"
    ? { tool: "move", label: "Mover", glyph: null }
    : { tool: "remove", label: "Quitar pieza", glyph: null },
]);

function pieceOf(tool: PlacementPiece): Piece {
  const [color, role] = tool.split("-") as [Color, Role];
  return { color, role };
}

function isPieceTool(tool: PlacementTool): tool is PlacementPiece {
  return tool !== "move" && tool !== "remove";
}

/** The placement field of a FEN: a whole FEN is read up to its first space. */
function boardFen(placement: string): string {
  return placement.trim().split(/\s+/)[0] ?? "";
}

function pointOf(event: MouseEvent | TouchEvent): NumberPair | null {
  if ("touches" in event) {
    const touch = event.targetTouches[0];
    return touch ? [touch.clientX, touch.clientY] : null;
  }
  return [event.clientX, event.clientY];
}

export interface PiecePlacementBoardProps {
  /** The placement field of a FEN (a whole FEN is read up to its first space); the parent owns it. */
  placement: string;
  /** Called with the new placement after every change made on the board. */
  onPlacementChange: (placement: string) => void;
  /** Which side is at the bottom. */
  orientation?: "white" | "black";
  /** Nothing moves and no tool can be chosen: the exercise's content is locked. */
  disabled?: boolean;
  /** The tool chosen when it mounts; «Mover» unless said otherwise. */
  defaultTool?: PlacementTool;
}

/**
 * The board on which an author sets up a position (D09): a chessground of its
 * own where every piece moves anywhere, and a palette of the twelve pieces,
 * «Mover» and «Quitar pieza». A piece is put by dragging it from the palette,
 * or, on a phone, by choosing it and tapping squares (tapping the same piece
 * again takes it off); dragging a piece off the board takes it off too. The
 * board knows nothing about whose turn it is or what is legal: the editor
 * around it asks `validateSetup` (lib/chess/position-setup.ts).
 */
export function PiecePlacementBoard({
  placement,
  onPlacementChange,
  orientation = "white",
  disabled = false,
  defaultTool = "move",
}: PiecePlacementBoardProps) {
  const [tool, setTool] = useState<PlacementTool>(defaultTool);

  const surfaceRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<Api | null>(null);
  const toolRef = useRef(tool);
  const placementRef = useRef(placement);
  const orientationRef = useRef(orientation);
  const onChangeRef = useRef(onPlacementChange);
  useEffect(() => {
    toolRef.current = tool;
    placementRef.current = placement;
    orientationRef.current = orientation;
    onChangeRef.current = onPlacementChange;
  }, [tool, placement, orientation, onPlacementChange]);

  // Chessground is loaded with the board and not with the page that holds
  // it, as ChessBoardLazy does; the surface paints the empty squares
  // meanwhile, so nothing moves when the pieces arrive. One instance per
  // `disabled`: chessground binds its pointer events only when it is created.
  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return;
    let cancelled = false;
    let api: Api | null = null;
    void import("@lichess-org/chessground").then(({ Chessground }) => {
      if (cancelled) return;
      // The pieces slide to their square, or just land on it for whoever
      // asked the system for less motion: the same check as ChessBoard's.
      const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      api = Chessground(surface, {
        fen: boardFen(placementRef.current),
        orientation: orientationRef.current,
        coordinates: true,
        animation: { enabled: !calm, duration: 200 },
        viewOnly: disabled,
        // A king dragged two squares is only a king: no rook follows it.
        autoCastle: false,
        highlight: { lastMove: false, check: false },
        premovable: { enabled: false },
        drawable: { enabled: false },
        draggable: { enabled: true, deleteOnDropOff: true, showGhost: true },
        selectable: { enabled: true },
        movable: {
          free: true,
          color: toolRef.current === "move" ? "both" : undefined,
          showDests: false,
        },
        events: {
          change: () => {
            const current = apiRef.current;
            if (current) onChangeRef.current(current.getFen());
          },
        },
      });
      apiRef.current = api;
    });
    return () => {
      cancelled = true;
      api?.destroy();
      apiRef.current = null;
    };
  }, [disabled]);

  // The parent's placement wins: «Posición inicial», «Vaciar el tablero» or a
  // pasted FEN arrive here. What the board itself reported comes back equal
  // and changes nothing.
  useEffect(() => {
    const api = apiRef.current;
    const fen = boardFen(placement);
    if (api && api.getFen() !== fen) api.set({ fen });
  }, [placement]);

  useEffect(() => {
    apiRef.current?.set({ orientation });
  }, [orientation]);

  // Only «Mover» picks pieces up; with a piece or «Quitar pieza» chosen a tap
  // is the palette's, and a piece half selected is let go.
  useEffect(() => {
    const api = apiRef.current;
    if (!api) return;
    api.set({ movable: { color: tool === "move" ? "both" : undefined } });
    api.selectSquare(null);
  }, [tool]);

  // A tap with a piece or «Quitar pieza» chosen. Chessground hears the same
  // event first, on its own board, and does nothing with it: no piece is
  // movable while such a tool is chosen.
  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface || disabled) return;
    const onStart = (event: MouseEvent | TouchEvent) => {
      const api = apiRef.current;
      const current = toolRef.current;
      if (!api || current === "move") return;
      if ("button" in event && event.button !== 0) return;
      if ("touches" in event && event.touches.length > 1) return;
      const point = pointOf(event);
      const key: Key | undefined = point ? api.getKeyAtDomPos(point) : undefined;
      if (!key) return;
      // No scroll under the finger, and no mouse event after the touch.
      event.preventDefault();
      const there = api.state.pieces.get(key);
      let next: Piece | undefined;
      if (isPieceTool(current)) {
        const piece = pieceOf(current);
        next = there?.color === piece.color && there.role === piece.role ? undefined : piece;
      }
      if (!there && !next) return;
      api.setPieces(new Map([[key, next]]));
      onChangeRef.current(api.getFen());
    };
    surface.addEventListener("mousedown", onStart);
    surface.addEventListener("touchstart", onStart, { passive: false });
    return () => {
      surface.removeEventListener("mousedown", onStart);
      surface.removeEventListener("touchstart", onStart);
    };
  }, [disabled]);

  // Pressing a piece of the palette chooses it and picks up a copy to drag
  // onto the board. It is chosen on the press and not on the click: after a
  // drag chessground cancels the touch's click, and a tap on a phone would
  // choose nothing.
  const pickUp = (piece: PlacementPiece, event: MouseEvent | TouchEvent) => {
    if ("button" in event && event.button !== 0) return;
    setTool(piece);
    apiRef.current?.dragNewPiece(pieceOf(piece), event, true);
  };

  const toolKind = tool === "move" ? "move" : tool === "remove" ? "remove" : "place";

  return (
    <div className={`piece-placement-board piece-placement-board_tool_${toolKind}`}>
      <div className="piece-placement-board__frame">
        <div className="piece-placement-board__surface" ref={surfaceRef} />
      </div>
      <ToggleGroup.Root
        type="single"
        className="piece-placement-board__palette"
        aria-label="Herramienta"
        value={tool}
        // A tool stays chosen: pressing the chosen one again does not leave none.
        onValueChange={(value) => {
          if (value) setTool(value as PlacementTool);
        }}
        disabled={disabled}
      >
        {PALETTE.map((item) => (
          <ToggleGroup.Item
            key={item.tool}
            value={item.tool}
            aria-label={item.label}
            title={item.label}
            className={`piece-placement-board__tool${item.glyph ? ` piece-placement-board__tool_kind_piece piece-placement-board__tool_glyph_${item.glyph}` : ""}`}
            onMouseDown={
              isPieceTool(item.tool) ? (event) => pickUp(item.tool as PlacementPiece, event.nativeEvent) : undefined
            }
            onTouchStart={
              isPieceTool(item.tool) ? (event) => pickUp(item.tool as PlacementPiece, event.nativeEvent) : undefined
            }
          >
            {item.tool === "move" && <HandPointerIcon variant="classic-solid" />}
            {item.tool === "remove" && <EraserIcon variant="classic-solid" />}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup.Root>
    </div>
  );
}
