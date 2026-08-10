import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type PieceCode = string; // e.g. "w-knight", "b-pawn"
type Board = (PieceCode | null)[]; // 64 squares, index 0 = a8 ... 63 = h1

const START: Board = [
  "b-rook", "b-knight", "b-bishop", "b-queen", "b-king", "b-bishop", "b-knight", "b-rook",
  "b-pawn", "b-pawn", "b-pawn", "b-pawn", "b-pawn", "b-pawn", "b-pawn", "b-pawn",
  null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null,
  null, null, null, null, null, null, null, null,
  "w-pawn", "w-pawn", "w-pawn", "w-pawn", "w-pawn", "w-pawn", "w-pawn", "w-pawn",
  "w-rook", "w-knight", "w-bishop", "w-queen", "w-king", "w-bishop", "w-knight", "w-rook",
];

const FILE = (i: number) => i % 8;
const RANK = (i: number) => Math.floor(i / 8);
const inside = (i: number) => i >= 0 && i < 64;
const colorOf = (p: PieceCode | null) => (p ? p[0] : null);
const kindOf = (p: PieceCode | null) => (p ? p.slice(2) : null);

const RAYS: Record<string, number[]> = {
  bishop: [-9, -7, 7, 9],
  rook: [-8, -1, 1, 8],
  queen: [-9, -8, -7, -1, 1, 7, 8, 9],
};
const JUMPS: Record<string, number[]> = {
  knight: [-17, -15, -10, -6, 6, 10, 15, 17],
  king: [-9, -8, -7, -1, 1, 7, 8, 9],
};

function destinations(b: Board, i: number, ep: number, capturesOnly: boolean): number[] {
  const p = b[i];
  if (!p) return [];
  const c = colorOf(p);
  const t = kindOf(p);
  const out: number[] = [];

  if (t === "pawn") {
    const dir = c === "w" ? -8 : 8;
    const startRank = c === "w" ? 6 : 1;
    if (!capturesOnly) {
      if (inside(i + dir) && !b[i + dir]) {
        out.push(i + dir);
        if (RANK(i) === startRank && !b[i + 2 * dir]) out.push(i + 2 * dir);
      }
    }
    [dir - 1, dir + 1].forEach((d) => {
      const j = i + d;
      if (!inside(j) || Math.abs(FILE(j) - FILE(i)) !== 1) return;
      if (capturesOnly || (b[j] && colorOf(b[j]) !== c) || j === ep) out.push(j);
    });
    return out;
  }

  if (t === "knight" || t === "king") {
    JUMPS[t].forEach((d) => {
      const j = i + d;
      if (!inside(j)) return;
      const step = t === "knight" ? 2 : 1;
      if (Math.abs(FILE(j) - FILE(i)) > step) return;
      if (b[j] && colorOf(b[j]) === c) return;
      out.push(j);
    });
    return out;
  }

  (RAYS[t as string] || []).forEach((d) => {
    let j = i;
    while (true) {
      const prev = j;
      j += d;
      if (!inside(j) || Math.abs(FILE(j) - FILE(prev)) > 1) break;
      if (b[j]) {
        if (colorOf(b[j]) !== c) out.push(j);
        break;
      }
      out.push(j);
    }
  });
  return out;
}

function attacked(b: Board, sq: number, byColor: string): boolean {
  for (let i = 0; i < 64; i++) {
    if (!b[i] || colorOf(b[i]) !== byColor) continue;
    if (destinations(b, i, -1, kindOf(b[i]) === "pawn").indexOf(sq) >= 0) return true;
  }
  return false;
}

function kingOf(b: Board, c: string): number {
  for (let i = 0; i < 64; i++) if (b[i] === c + "-king") return i;
  return -1;
}

interface MoveResult {
  board: Board;
  from: number;
  to: number;
  ep: number;
}

const PIECE_KIND_BY_LETTER: Record<string, string> = { N: "knight", B: "bishop", R: "rook", Q: "queen", K: "king" };

function applyMove(b: Board, san: string, color: string, ep: number): MoveResult {
  const clean = san.replace(/[+#!?]/g, "");
  const nb = b.slice();

  if (clean === "O-O" || clean === "O-O-O") {
    const base = color === "w" ? 56 : 0;
    const long = clean === "O-O-O";
    const kf = base + 4;
    const kt = base + (long ? 2 : 6);
    const rf = base + (long ? 0 : 7);
    const rt = base + (long ? 3 : 5);
    nb[kt] = nb[kf];
    nb[kf] = null;
    nb[rt] = nb[rf];
    nb[rf] = null;
    return { board: nb, from: kf, to: kt, ep: -1 };
  }

  const parts = clean.split("=");
  const body = parts[0];
  const promo = parts[1] ? PIECE_KIND_BY_LETTER[parts[1]] : null;
  const destSquare = body.slice(-2);
  const to = (8 - parseInt(destSquare[1], 10)) * 8 + (destSquare.charCodeAt(0) - 97);
  const initial = body[0];
  const isPiece = "NBRQK".indexOf(initial) >= 0;
  const kind = isPiece ? PIECE_KIND_BY_LETTER[initial] : "pawn";
  const middle = body.slice(isPiece ? 1 : 0, -2).replace("x", "");
  const disambFile = (middle.match(/[a-h]/) || [])[0];
  const disambRank = (middle.match(/[1-8]/) || [])[0];

  let candidates: number[] = [];
  for (let i = 0; i < 64; i++) {
    if (b[i] !== color + "-" + kind) continue;
    if (disambFile && FILE(i) !== disambFile.charCodeAt(0) - 97) continue;
    if (disambRank && RANK(i) !== 8 - parseInt(disambRank, 10)) continue;
    if (destinations(b, i, ep, false).indexOf(to) >= 0) candidates.push(i);
  }
  if (candidates.length > 1) {
    candidates = candidates.filter((i) => {
      const t = b.slice();
      t[to] = t[i];
      t[i] = null;
      return !attacked(t, kingOf(t, color), color === "w" ? "b" : "w");
    });
  }

  const from = candidates[0];
  if (from === undefined) return { board: nb, from: -1, to: -1, ep: -1 };

  const isPawn = kind === "pawn";
  if (isPawn && to === ep && !b[to]) nb[to + (color === "w" ? 8 : -8)] = null;
  nb[to] = promo ? color + "-" + promo : nb[from];
  nb[from] = null;
  const newEp = isPawn && Math.abs(RANK(to) - RANK(from)) === 2 ? (from + to) / 2 : -1;
  return { board: nb, from, to, ep: newEp };
}

const SPANISH_LETTER: Record<string, string> = { N: "C", B: "A", R: "T", Q: "D", K: "R" };
const toSpanish = (san: string) => (san.indexOf("O-O") === 0 ? san : (SPANISH_LETTER[san[0]] || "") + (SPANISH_LETTER[san[0]] ? san.slice(1) : san));
const withoutInitial = (san: string) => (PIECE_KIND_BY_LETTER[san[0]] ? san.slice(1) : san);
const pieceGlyphOf = (san: string) => PIECE_KIND_BY_LETTER[san[0]] || null;

interface PieceFrame {
  square: number;
  code: PieceCode;
}
type FrameSnapshot = Record<number, PieceFrame>; // piece id -> frame

interface ReplayLine {
  boards: Board[];
  marks: number[][];
  slots: number[];
  frames: FrameSnapshot[];
}

function buildLine(moves: string[]): ReplayLine {
  const boards: Board[] = [START.slice()];
  const marks: number[][] = [[]];
  let b = START.slice();
  let ep = -1;
  let ids: (number | null)[] = START.map((p, i) => (p ? i : null));
  const slots: number[] = [];
  START.forEach((p, i) => {
    if (p) slots.push(i);
  });
  let nextId = 64;

  const snapshot = (bd: Board, idb: (number | null)[]): FrameSnapshot => {
    const f: FrameSnapshot = {};
    for (let s = 0; s < 64; s++) {
      const id = idb[s];
      if (bd[s] && id != null) f[id] = { square: s, code: bd[s] as string };
    }
    return f;
  };

  const frames: FrameSnapshot[] = [snapshot(b, ids)];

  moves.forEach((san, n) => {
    const r = applyMove(b, san, n % 2 === 0 ? "w" : "b", ep);
    const nb = r.board;
    const ni: (number | null)[] = new Array(64).fill(null);
    const used: Record<number, 1> = {};

    for (let s = 0; s < 64; s++) {
      if (nb[s] && nb[s] === b[s] && ids[s] != null) {
        ni[s] = ids[s];
        used[ids[s] as number] = 1;
      }
    }
    if (r.from >= 0 && r.to >= 0 && nb[r.to] && ni[r.to] == null && ids[r.from] != null && !used[ids[r.from] as number]) {
      ni[r.to] = ids[r.from];
      used[ids[r.from] as number] = 1;
    }
    for (let s = 0; s < 64; s++) {
      if (!nb[s] || ni[s] != null) continue;
      let found: number | null = null;
      for (let t = 0; t < 64; t++) {
        if (ids[t] == null || used[ids[t] as number]) continue;
        if (b[t] === nb[s] && !nb[t]) {
          found = ids[t];
          break;
        }
      }
      if (found == null) {
        found = nextId++;
        slots.push(found);
      }
      ni[s] = found;
      used[found] = 1;
    }

    b = nb;
    ep = r.ep;
    ids = ni;
    boards.push(b);
    marks.push(r.from >= 0 ? [r.from, r.to] : []);
    frames.push(snapshot(b, ids));
  });

  return { boards, marks, slots, frames };
}

export interface ChessSquare {
  index: number;
  light: boolean;
  highlighted: boolean;
  rank: string | null;
  file: string | null;
}

export interface ChessPiece {
  id: number;
  col: number;
  row: number;
  glyph: string | null;
  visible: boolean;
}

export type MoveQuality =
  | "brilliant"
  | "great"
  | "best"
  | "excellent"
  | "good"
  | "book"
  | "inaccuracy"
  | "mistake"
  | "miss"
  | "blunder";

export interface NotationHalfMove {
  label: string;
  glyph: string | null;
  quality: MoveQuality | null;
  active: boolean;
  empty: boolean;
  onSelect: () => void;
}

export interface NotationRow {
  number: string;
  white: NotationHalfMove;
  black: NotationHalfMove | null;
}

export type MoveAnnotations = Partial<Record<string, MoveQuality>>;

const FILES = "abcdefgh";

export function useChessReplay(moves: string[], flipBoard: boolean, annotations?: MoveAnnotations) {
  const [ply, setPlyState] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [flipToggled, setFlipToggled] = useState(false);
  const autoTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const effectiveFlip = flipToggled ? !flipBoard : flipBoard;

  const line = useMemo(() => buildLine(moves), [moves]);
  const total = moves.length;

  const setPly = useCallback(
    (n: number) => {
      setPlyState(Math.max(0, Math.min(total, n)));
    },
    [total],
  );

  const stopAutoPlay = useCallback(() => {
    if (autoTimer.current) clearInterval(autoTimer.current);
    autoTimer.current = null;
    setIsAutoPlaying(false);
  }, []);

  const toggleAutoPlay = useCallback(() => {
    if (autoTimer.current) {
      stopAutoPlay();
      return;
    }
    setPlyState((current) => (current >= total ? 0 : current));
    setIsAutoPlaying(true);
    autoTimer.current = setInterval(() => {
      setPlyState((current) => {
        if (current >= total) {
          stopAutoPlay();
          return current;
        }
        return current + 1;
      });
    }, 900);
  }, [stopAutoPlay, total]);

  useEffect(() => stopAutoPlay, [moves, stopAutoPlay]);

  const board = line.boards[ply];
  const highlightedSquares = line.marks[ply] || [];

  const squares: ChessSquare[] = useMemo(() => {
    const order: number[] = [];
    for (let n = 0; n < 64; n++) order.push(effectiveFlip ? 63 - n : n);
    return order.map((n, idx) => {
      const col = idx % 8;
      const row = Math.floor(idx / 8);
      return {
        index: n,
        light: ((n >> 3) + (n % 8)) % 2 === 0,
        highlighted: highlightedSquares.indexOf(n) >= 0,
        rank: col === 0 ? (effectiveFlip ? String(row + 1) : String(8 - row)) : null,
        file: row === 7 ? (effectiveFlip ? FILES[7 - col] : FILES[col]) : null,
      };
    });
  }, [effectiveFlip, highlightedSquares]);

  const pieces: ChessPiece[] = useMemo(() => {
    return line.slots.map((id) => {
      const frame = line.frames[ply][id];
      const visible = !!frame;
      const square = visible ? frame.square : 0;
      const display = effectiveFlip ? 63 - square : square;
      return {
        id,
        col: display % 8,
        row: display >> 3,
        glyph: frame ? frame.code : null,
        visible,
      };
    });
  }, [effectiveFlip, line.frames, line.slots, ply]);

  const rows: NotationRow[] = useMemo(() => {
    const out: NotationRow[] = [];
    for (let n = 0; n < moves.length; n += 2) {
      const whiteIndex = n;
      const blackIndex = n + 1;
      const hasBlack = blackIndex < moves.length;
      const moveNumber = n / 2 + 1;
      out.push({
        number: moveNumber + ".",
        white: {
          label: toSpanish(withoutInitial(moves[whiteIndex])),
          glyph: pieceGlyphOf(moves[whiteIndex]),
          quality: annotations?.[`${moveNumber}w`] ?? null,
          active: ply === whiteIndex + 1,
          empty: false,
          onSelect: () => setPly(whiteIndex + 1),
        },
        black: hasBlack
          ? {
              label: toSpanish(withoutInitial(moves[blackIndex])),
              glyph: pieceGlyphOf(moves[blackIndex]),
              quality: annotations?.[`${moveNumber}b`] ?? null,
              active: ply === blackIndex + 1,
              empty: false,
              onSelect: () => setPly(blackIndex + 1),
            }
          : null,
      });
    }
    return out;
  }, [moves, ply, setPly, annotations]);

  const currentMoveLabel = ply === 0 ? "Posición inicial" : `Jugada ${ply} de ${total}`;

  return {
    ply,
    total,
    squares,
    pieces,
    rows,
    currentMoveLabel,
    isAutoPlaying,
    goToStart: () => setPly(0),
    goToEnd: () => setPly(total),
    goToPrevious: () => setPly(ply - 1),
    goToNext: () => setPly(ply + 1),
    toggleAutoPlay,
    toggleFlip: () => setFlipToggled((current) => !current),
  };
}
