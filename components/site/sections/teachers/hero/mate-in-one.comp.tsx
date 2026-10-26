"use client";

import { useEffect, useMemo, useState } from "react";
import type { Key } from "@lichess-org/chessground/types";
import { Chess } from "chessops/chess";
import { makeFen, parseFen } from "chessops/fen";
import { parseSan } from "chessops/san";
import { makeSquare } from "chessops/util";
import { ChessBoard } from "@/components/chess/chess-board.comp";
import { EyeIcon } from "@/components/icons/eye-icon.comp";
import { RotateLeftIcon } from "@/components/icons/rotate-left-icon.comp";
import { EXERCISE_KIND } from "@/constants/platform/exercise-codes.const";
import { solutionPgnFromLine } from "@/lib/chess/exercise-format";
import {
  playMove,
  readSolution,
  showSolution,
  startSolving,
  type Solution,
  type SolveState,
} from "@/lib/chess/exercise-solver";
import { sanToSpanish } from "@/lib/chess/notation";
import { nodeAtPath } from "@/lib/chess/pgn-tree";
import { mdIconButton } from "@/lib/material/material-classes";
import { MATE_IN_ONE } from "./mate-in-one.const";
import "./mate-in-one.comp.css";

/** How long a wrong move stays on the board before it is taken back, as on the platform's solve screen. */
const WRONG_MOVE_MS = 900;

interface BoardView {
  fen: string;
  lastMove?: [Key, Key];
  check: boolean;
  tone?: "error";
}

type Status = "idle" | "wrong" | "solved" | "solvedAfterMistake" | "shown";

const STATUS_TEXT: Record<Status, string> = {
  idle: "Juegan las blancas: arrastra o toca una pieza y luego su casilla.",
  wrong:
    "Esa no da mate. Como en la plataforma, la primera jugada equivocada ya decidió el intento: cuenta como fallado. Puedes seguir probando.",
  solved: `¡Mate! 1.${sanToSpanish(MATE_IN_ONE.solution)}, a la primera: resuelto.`,
  solvedAfterMistake: `¡Mate! 1.${sanToSpanish(MATE_IN_ONE.solution)}. El intento ya contaba como fallado por la primera jugada.`,
  shown: `La solución: 1.${sanToSpanish(MATE_IN_ONE.solution)}. Ver la solución cuenta como fallado, como en la plataforma.`,
};

function boardOf(solution: Solution, path: string): BoardView {
  const node = path ? nodeAtPath(solution.tree, path) : undefined;
  if (!node) return { fen: solution.tree.initialFen, check: false };
  return { fen: node.fen, lastMove: node.lastMove, check: node.check };
}

/** The position after a move outside the solution, marked as wrong for a moment. */
function wrongBoardOf(fen: string, san: string): BoardView | null {
  const position = Chess.fromSetup(parseFen(fen).unwrap()).unwrap();
  const move = parseSan(position, san);
  if (!move || !("from" in move)) return null;
  const after = position.clone();
  after.play(move);
  return {
    fen: makeFen(after.toSetup()),
    lastMove: [makeSquare(move.from) as Key, makeSquare(move.to) as Key],
    check: after.isCheck(),
    tone: "error",
  };
}

/**
 * The hero's live mate in 1 on the real board (`look="material"`), solved by
 * the platform's own solver (`lib/chess/exercise-solver.ts`), so it follows the
 * exercises' rules: the first wrong move decides the attempt as failed (D19)
 * and «Ver la solución» does too (D20). Nothing is stored: it is a sample.
 */
export function MateInOne() {
  const solution = useMemo(
    () =>
      readSolution({
        solutionPgn: solutionPgnFromLine(MATE_IN_ONE.fen, [MATE_IN_ONE.solution]),
        kind: EXERCISE_KIND.MATE_IN,
        mateIn: 1,
        hints: [],
      }),
    [],
  );
  const [solve, setSolve] = useState<SolveState | null>(() => (solution ? startSolving(solution) : null));
  const [flash, setFlash] = useState<BoardView | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    if (!flash) return;
    const timer = setTimeout(() => setFlash(null), WRONG_MOVE_MS);
    return () => clearTimeout(timer);
  }, [flash]);

  if (!solution || !solve) return null;

  const board = flash ?? boardOf(solution, solve.path);
  const canMove = !solve.completed && !flash;

  function handleMove(san: string) {
    if (!solution || !solve || !canMove) return;
    const result = playMove(solution, solve, san);
    if (result.kind === "illegal") return;
    setSolve(result.state);
    if (result.kind === "wrong") {
      setFlash(wrongBoardOf(solve.fen, san));
      setStatus("wrong");
      return;
    }
    if (result.completed) setStatus(result.state.failed ? "solvedAfterMistake" : "solved");
  }

  function handleShowSolution() {
    if (!solution || !solve || solve.completed) return;
    setFlash(null);
    setSolve(showSolution(solution, solve).state);
    setStatus("shown");
  }

  function handleRestart() {
    if (!solution) return;
    setFlash(null);
    setSolve(startSolving(solution));
    setStatus("idle");
  }

  const tone =
    status === "solved" ? "success" : status === "wrong" || status === "solvedAfterMistake" ? "error" : "neutral";

  return (
    <div className="mate-in-one">
      <div className="mate-in-one__head">
        <h3 className="mate-in-one__title">Pruébalo: mate en 1</h3>
        <div className="mate-in-one__tools">
          <button
            type="button"
            className={mdIconButton("standard", "sm")}
            aria-label="Ver la solución"
            title="Ver la solución"
            onClick={handleShowSolution}
            disabled={solve.completed}
          >
            <EyeIcon className="site-md-icon" />
          </button>
          <button
            type="button"
            className={mdIconButton("standard", "sm")}
            aria-label="Empezar de nuevo"
            title="Empezar de nuevo"
            onClick={handleRestart}
          >
            <RotateLeftIcon className="site-md-icon" />
          </button>
        </div>
      </div>
      <div
        className="mate-in-one__board"
        role="group"
        aria-label="Tablero del ejercicio: juegan las blancas, mate en 1"
      >
        <ChessBoard
          look="material"
          position={{ fen: board.fen, lastMove: board.lastMove, check: board.check }}
          lastMoveTone={board.tone}
          interactive={canMove}
          movableColor={canMove ? "white" : "none"}
          onMove={handleMove}
        />
      </div>
      <p className={`mate-in-one__status mate-in-one__status_tone_${tone}`} aria-live="polite">
        {STATUS_TEXT[status]}
      </p>
    </div>
  );
}
