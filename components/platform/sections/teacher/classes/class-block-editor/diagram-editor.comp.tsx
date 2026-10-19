"use client";

import { useState, type MouseEvent } from "react";
import { PiecePlacementBoard } from "@/components/chess/piece-placement-board/piece-placement-board.comp";
import { StaticDiagram } from "@/components/chess/static-diagram.comp";
import type { StaticDiagramTone } from "@/components/chess/static-diagram-arrows";
import { PlatformFormField } from "@/components/platform/shared/platform-form/platform-form.comp";
import {
  readDiagramPgn,
  writeDiagramPgn,
  type DiagramArrow,
  type DiagramCircle,
  type DiagramColor,
} from "@/lib/chess/diagram-notation";
import "./diagram-editor.comp.css";

const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
const EMPTY = "8/8/8/8/8/8/8/8";

/** The colours a teacher draws in, with what each is called and how the board paints it. */
const COLORS: { color: DiagramColor; label: string; tone: StaticDiagramTone }[] = [
  { color: "green", label: "Verde", tone: "success" },
  { color: "red", label: "Rojo", tone: "danger" },
  { color: "blue", label: "Azul", tone: "info" },
  { color: "yellow", label: "Amarillo", tone: "warning" },
];
const TONE: Record<DiagramColor, StaticDiagramTone> = {
  green: "success",
  red: "danger",
  blue: "info",
  yellow: "warning",
};

interface Marks {
  circles: DiagramCircle[];
  arrows: DiagramArrow[];
}

interface DiagramEditorProps {
  /** A diagram already written, to edit it; none starts from the initial position. */
  defaultPgn?: string;
  /**
   * The position step alone, with no comments and no preview: the board of an
   * «Ahora tú» question, which draws no marks (the class editor).
   */
  positionOnly?: boolean;
}

/** The squares in the order the grid draws them, from the side at the bottom. */
function squaresFrom(orientation: "white" | "black"): string[] {
  const files = orientation === "white" ? "abcdefgh" : "hgfedcba";
  const ranks = orientation === "white" ? [8, 7, 6, 5, 4, 3, 2, 1] : [1, 2, 3, 4, 5, 6, 7, 8];
  return ranks.flatMap((rank) => files.split("").map((file) => `${file}${rank}`));
}

/** The colour of a stroke drawn with the mouse: the modifier keys, as on lichess; without them, the one chosen. */
function colorOf(event: MouseEvent, chosen: DiagramColor): DiagramColor {
  if (event.shiftKey && event.altKey) return "yellow";
  if (event.shiftKey) return "red";
  if (event.altKey) return "blue";
  return chosen;
}

/**
 * The editor of a diagram block (2026-10-19, option D of the editor canvas),
 * in two steps. First the position: the pieces are placed on the placement
 * board, from the initial position or an empty one, with who plays (which is
 * also the side at the bottom unless the board is turned). Then the
 * comments: the pieces stay still and the board takes circles and arrows,
 * with a right click on a square or a right drag between two (Shift, Alt or
 * both change the colour, as on lichess), or on a touch screen a square
 * tapped twice or two squares tapped one after the other.
 *
 * What it writes is one PGN (`writeDiagramPgn`): the position in [FEN], the
 * caption with [%csl] and [%cal] in its comment. The student sees that same
 * notation as a board that cannot be touched, here beside the editor while
 * it is drawn. Front-only for now: the PGN travels in a hidden `pgn` field,
 * which nothing stores yet.
 */
export function DiagramEditor({ defaultPgn, positionOnly = false }: DiagramEditorProps) {
  const initial = defaultPgn ? readDiagramPgn(defaultPgn) : null;
  const [chosenStep, setStep] = useState<"position" | "comments">("position");
  const step = positionOnly ? "position" : chosenStep;
  const [placement, setPlacement] = useState(initial?.fen.split(" ")[0] ?? START);
  const [boardKey, setBoardKey] = useState(0);
  const [turn, setTurn] = useState<"white" | "black">(initial?.fen.split(" ")[1] === "b" ? "black" : "white");
  const [orientation, setOrientation] = useState<"white" | "black">(initial?.orientation ?? "white");
  const [marks, setMarks] = useState<Marks>({ circles: initial?.circles ?? [], arrows: initial?.arrows ?? [] });
  const [history, setHistory] = useState<Marks[]>([]);
  const [color, setColor] = useState<DiagramColor>("green");
  const [pending, setPending] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ from: string; color: DiagramColor } | null>(null);
  const [caption, setCaption] = useState(initial?.caption ?? "");

  const fen = `${placement} ${turn === "white" ? "w" : "b"} - - 0 1`;
  const pgn = writeDiagramPgn({ fen, orientation, caption, ...marks });

  const commit = (next: Marks) => {
    setHistory((current) => [...current, marks].slice(-50));
    setMarks(next);
    setPending(null);
  };
  const toggleCircle = (square: string, stroke: DiagramColor) => {
    const same = marks.circles.find((circle) => circle.square === square);
    const others = marks.circles.filter((circle) => circle.square !== square);
    commit({ ...marks, circles: same?.color === stroke ? others : [...others, { square, color: stroke }] });
  };
  const toggleArrow = (from: string, to: string, stroke: DiagramColor) => {
    const same = marks.arrows.find((arrow) => arrow.from === from && arrow.to === to);
    const others = marks.arrows.filter((arrow) => !(arrow.from === from && arrow.to === to));
    commit({ ...marks, arrows: same?.color === stroke ? others : [...others, { from, to, color: stroke }] });
  };
  const tap = (square: string) => {
    if (pending === null) return setPending(square);
    if (pending === square) return toggleCircle(square, color);
    toggleArrow(pending, square, color);
  };

  const startFrom = (next: string) => {
    setPlacement(next);
    setBoardKey((key) => key + 1);
  };
  const chooseTurn = (next: "white" | "black") => {
    setTurn(next);
    setOrientation(next);
  };
  const preview = {
    circles: marks.circles.map((circle) => ({ square: circle.square, tone: TONE[circle.color] })),
    arrows: marks.arrows.map((arrow) => ({ from: arrow.from, to: arrow.to, tone: TONE[arrow.color] })),
  };

  return (
    <div className="diagram-editor">
      <input type="hidden" name="pgn" value={pgn} />

      {!positionOnly && (
        <div className="diagram-editor__steps" role="group" aria-label="Pasos del diagrama">
          <button
            type="button"
            className={`diagram-editor__step${step === "position" ? " diagram-editor__step_state_current" : ""}`}
            aria-pressed={step === "position"}
            onClick={() => {
              setStep("position");
              setPending(null);
            }}
          >
            1. Posición
          </button>
          <button
            type="button"
            className={`diagram-editor__step${step === "comments" ? " diagram-editor__step_state_current" : ""}`}
            aria-pressed={step === "comments"}
            onClick={() => setStep("comments")}
          >
            2. Comentarios
          </button>
        </div>
      )}

      <div className="diagram-editor__body">
        <div className="diagram-editor__work">
          {step === "position" ? (
            <>
              <PiecePlacementBoard
                key={boardKey}
                placement={placement}
                onPlacementChange={setPlacement}
                orientation={orientation}
              />
              <div className="diagram-editor__actions">
                <button
                  type="button"
                  className="platform-button platform-button_size_sm"
                  onClick={() => startFrom(START)}
                >
                  Posición inicial
                </button>
                <button
                  type="button"
                  className="platform-button platform-button_size_sm"
                  onClick={() => startFrom(EMPTY)}
                >
                  Tablero vacío
                </button>
                <button
                  type="button"
                  className="platform-button platform-button_size_sm"
                  onClick={() => setOrientation((side) => (side === "white" ? "black" : "white"))}
                >
                  Girar el tablero
                </button>
              </div>
              <div className="diagram-editor__turn" role="group" aria-label="Quién juega">
                {(["white", "black"] as const).map((side) => (
                  <button
                    key={side}
                    type="button"
                    className={`diagram-editor__option${turn === side ? " diagram-editor__option_state_on" : ""}`}
                    aria-pressed={turn === side}
                    onClick={() => chooseTurn(side)}
                  >
                    Juegan las {side === "white" ? "blancas" : "negras"}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="diagram-editor__canvas">
                <StaticDiagram fen={fen} orientation={orientation} {...preview} />
                <div className="diagram-editor__grid" onContextMenu={(event) => event.preventDefault()}>
                  {squaresFrom(orientation).map((square) => (
                    <button
                      key={square}
                      type="button"
                      className={`diagram-editor__square${pending === square ? " diagram-editor__square_state_pending" : ""}`}
                      aria-label={`Casilla ${square}`}
                      onClick={() => tap(square)}
                      onMouseDown={(event) => {
                        if (event.button === 2) setDrag({ from: square, color: colorOf(event, color) });
                      }}
                      onMouseUp={(event) => {
                        if (event.button !== 2 || !drag) return;
                        setDrag(null);
                        if (drag.from === square) toggleCircle(square, drag.color);
                        else toggleArrow(drag.from, square, drag.color);
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="diagram-editor__actions">
                <div className="diagram-editor__colors" role="group" aria-label="Color">
                  {COLORS.map((item) => (
                    <button
                      key={item.color}
                      type="button"
                      className={`diagram-editor__color diagram-editor__color_tone_${item.tone}${color === item.color ? " diagram-editor__color_state_on" : ""}`}
                      aria-label={item.label}
                      aria-pressed={color === item.color}
                      onClick={() => setColor(item.color)}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  className="platform-button platform-button_size_sm"
                  disabled={history.length === 0}
                  onClick={() => {
                    setMarks(history.at(-1) ?? marks);
                    setHistory((current) => current.slice(0, -1));
                    setPending(null);
                  }}
                >
                  Deshacer
                </button>
                <button
                  type="button"
                  className="platform-button platform-button_size_sm"
                  disabled={marks.circles.length === 0 && marks.arrows.length === 0}
                  onClick={() => commit({ circles: [], arrows: [] })}
                >
                  Quitar todo
                </button>
              </div>
              <p className="diagram-editor__keys">
                Clic derecho: círculo · arrastra con clic derecho: flecha · Shift rojo, Alt azul, Shift + Alt amarillo.
                En pantalla táctil, toca una casilla dos veces para el círculo, o dos casillas para la flecha.
              </p>
            </>
          )}
        </div>

        {!positionOnly && (
          <div className="diagram-editor__side">
            <p className="diagram-editor__eyebrow">Así lo verá el alumno</p>
            <div className="diagram-editor__preview">
              <StaticDiagram fen={fen} orientation={orientation} caption={caption || undefined} {...preview} />
            </div>
            <PlatformFormField name="caption" label="Pie del diagrama">
              <textarea value={caption} onChange={(event) => setCaption(event.target.value)} rows={2} maxLength={300} />
            </PlatformFormField>
            <details className="diagram-editor__notation">
              <summary>Lo que se guarda</summary>
              <pre>{pgn}</pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
