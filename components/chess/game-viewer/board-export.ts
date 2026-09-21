"use client";

import type { Key } from "@lichess-org/chessground/types";
import { parseFen } from "chessops/fen";
import { GIFEncoder, applyPalette, quantize } from "gifenc";
import { BOARD_DARK_SQUARE, BOARD_LIGHT_SQUARE } from "@/constants/chess-board-colors.const";
import { replayGame } from "@/lib/chess/replay";

// Getting the game out of the browser: the position as an image and the
// whole game as a GIF.
//
// The board is painted ON A SEPARATE CANVAS and the on-screen one is not
// captured: chessground draws with CSS — backgrounds, sprites, transforms —
// and turning that into an image requires either a capture library or
// reinventing how the browser resolves each rule. Repainting it here is forty
// lines and comes out identical in every browser, at whatever size is asked
// for and without the interface marks (selected move, destination squares, arrows).

/** The board colours, shared with the CSS tokens (see the constant). */
const LIGHT_SQUARE = BOARD_LIGHT_SQUARE;
const DARK_SQUARE = BOARD_DARK_SQUARE;
/** The last-move yellow, already blended over each square colour. */
const LAST_MOVE_LIGHT = "#f6f682";
const LAST_MOVE_DARK = "#bcc46a";

const COLORS = ["white", "black"] as const;
const ROLES = ["pawn", "knight", "bishop", "rook", "queen", "king"] as const;

/** Name each piece is stored under: the same one chessops gives. */
function pieceKey(color: string, role: string): string {
  return `${color}-${role}`;
}

/**
 * The board's pieces, taken from the sheet chessground already has loaded.
 *
 * `chessground.cburnett.css` — the one `chess-board.comp.tsx` imports — carries
 * the twelve SVGs embedded in base64 inside `background-image` rules. They are
 * read from there and NOT copied into the repository: that way what is exported
 * cannot stop looking like what is on screen, which is exactly what happened
 * when the promotion picker's pieces were used.
 *
 * The selector of those rules is `.cg-wrap piece.pawn.white`, so a probe with
 * that shape is needed inside the document — out of view — to ask the browser
 * for its resolved style. The computed style is queried and not
 * `document.styleSheets` because the text of the rules depends on how Next
 * bundles, and the computed value is the same either way.
 */
function readBoardPieceUrls(): Map<string, string> {
  const urls = new Map<string, string>();

  const probe = document.createElement("div");
  probe.className = "cg-wrap";
  probe.style.cssText = "position:fixed;top:-9999px;left:-9999px;visibility:hidden";

  const elements: { key: string; element: HTMLElement }[] = [];
  for (const color of COLORS) {
    for (const role of ROLES) {
      const element = document.createElement("piece");
      element.className = `${role} ${color}`;
      probe.append(element);
      elements.push({ key: pieceKey(color, role), element });
    }
  }

  document.body.append(probe);
  try {
    for (const { key, element } of elements) {
      const match = /url\(["']?(.+?)["']?\)/.exec(getComputedStyle(element).backgroundImage);
      if (match?.[1]) urls.set(key, match[1]);
    }
  } finally {
    probe.remove();
  }

  return urls;
}

/**
 * Fallback pieces: the promotion picker's, served by the app. They are the
 * same cburnett set as the board, copied by scripts/sync-pieces.ts.
 *
 * Only used when the chessground sheet is not loaded — exporting from a
 * screen without a board — so the function does not depend on who calls it.
 */
const FALLBACK_PIECE_URL: Record<string, string> = {
  "white-pawn": "/pieces/w-pawn.svg",
  "white-knight": "/pieces/w-knight.svg",
  "white-bishop": "/pieces/w-bishop.svg",
  "white-rook": "/pieces/w-rook.svg",
  "white-queen": "/pieces/w-queen.svg",
  "white-king": "/pieces/w-king.svg",
  "black-pawn": "/pieces/b-pawn.svg",
  "black-knight": "/pieces/b-knight.svg",
  "black-bishop": "/pieces/b-bishop.svg",
  "black-rook": "/pieces/b-rook.svg",
  "black-queen": "/pieces/b-queen.svg",
  "black-king": "/pieces/b-king.svg",
};

/**
 * The size each piece is rasterised at before shrinking it into its square.
 *
 * Given explicitly so as not to depend on what each SVG declares: an SVG
 * image without a size of its own is precisely the case some browsers draw
 * blank. With the size set there is nothing to infer.
 */
const PIECE_RASTER = 256;

/** The twelve images are loaded once and reused in every frame. */
let piecesPromise: Promise<Map<string, HTMLImageElement>> | null = null;

/** Where the pieces come from: the board if present, the fallback if not. */
function sourceUrls(): Map<string, string> {
  const fromBoard = readBoardPieceUrls();
  return fromBoard.size === Object.keys(FALLBACK_PIECE_URL).length
    ? fromBoard
    : new Map(Object.entries(FALLBACK_PIECE_URL));
}

function loadPieces(): Promise<Map<string, HTMLImageElement>> {
  piecesPromise ??= Promise.all(
    [...sourceUrls()].map(
      ([name, url]) =>
        new Promise<[string, HTMLImageElement]>((resolve, reject) => {
          const image = new Image(PIECE_RASTER, PIECE_RASTER);
          image.onload = () => resolve([name, image]);
          image.onerror = () => reject(new Error(`No se pudo cargar la pieza ${name}.`));
          image.src = url;
        }),
    ),
  ).then((entries) => new Map(entries));

  return piecesPromise;
}

interface DrawOptions {
  /** Side of the image in pixels. */
  size: number;
  /** [from, to] of the last move, to mark it as on screen. */
  lastMove?: [Key, Key];
}

const FILES = "abcdefgh";

/**
 * Paints a position onto a canvas, always from White's side: a shared image
 * is read the way a diagram in a book is read.
 */
export async function drawPosition(canvas: HTMLCanvasElement, fen: string, options: DrawOptions): Promise<void> {
  const setup = parseFen(fen).unwrap();
  const pieces = await loadPieces();
  const cell = options.size / 8;

  canvas.width = options.size;
  canvas.height = options.size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Este navegador no deja dibujar sobre un canvas.");
  ctx.imageSmoothingQuality = "high";

  const highlighted = new Set(options.lastMove?.map((key) => key.slice(0, 2)) ?? []);

  for (let rank = 0; rank < 8; rank += 1) {
    for (let file = 0; file < 8; file += 1) {
      const isLight = (file + rank) % 2 === 1;
      const isLastMove = highlighted.has(`${FILES[file]}${rank + 1}`);

      ctx.fillStyle = isLastMove ? (isLight ? LAST_MOVE_LIGHT : LAST_MOVE_DARK) : isLight ? LIGHT_SQUARE : DARK_SQUARE;
      // Rank 8 goes on top: the canvas axis grows downwards.
      ctx.fillRect(file * cell, (7 - rank) * cell, cell, cell);
    }
  }

  for (let square = 0; square < 64; square += 1) {
    const piece = setup.board.get(square);
    if (!piece) continue;

    const image = pieces.get(`${piece.color}-${piece.role}`);
    if (!image) continue;

    const file = square % 8;
    const rank = Math.floor(square / 8);
    ctx.drawImage(image, file * cell, (7 - rank) * cell, cell, cell);
  }
}

/** Downloads a blob under the given name, without leaving the temporary URL hanging. */
function download(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/** Saves the current position as a PNG. */
export async function downloadPositionImage(
  fen: string,
  filename: string,
  options: DrawOptions = { size: 720 },
): Promise<void> {
  const canvas = document.createElement("canvas");
  await drawPosition(canvas, fen, options);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("No se pudo generar la imagen.");
  download(blob, filename);
}

interface GifOptions {
  /** Side of each frame. Smaller than the PNG: there are dozens of images. */
  size?: number;
  /** How long each move lasts, in milliseconds. */
  delayMs?: number;
}

/**
 * Palette colours, one fewer than the power of two: the spare one is left
 * free for transparency.
 *
 * Thirty-one are enough because the board is flat and so are the pieces; the
 * only thing that brings real colour is the anti-aliasing of the edges. With
 * 32 entries each pixel takes five bits instead of eight.
 */
const GIF_COLORS = 31;
const GIF_COLOR_DEPTH = 5;

/** The pixels of a frame, the way the quantiser wants them. */
function frameData(canvas: HTMLCanvasElement, size: number): Uint8ClampedArray {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Este navegador no deja dibujar sobre un canvas.");
  return ctx.getImageData(0, 0, size, size).data;
}

/**
 * Saves the game's MAIN LINE as a GIF, one move per frame.
 *
 * Main line only: a GIF is a sequence and variations are not.
 *
 * It is written to be SMALL, which in a long game is the difference between
 * being able to share it and not:
 *
 * - Each frame paints ONLY what changes with respect to the previous one — two
 *   squares, four counting the last-move highlight — and leaves the rest
 *   transparent, which is what the GIF compresses to almost nothing. That
 *   requires `dispose: 1` ("do not clear the previous frame"): gifenc sets `2`
 *   as soon as there is transparency, and with that the game would flicker
 *   over an empty background.
 * - A 32-colour palette instead of 256, with a matching `colorDepth`.
 * - The palette is written ONCE, in the first frame, where it becomes the
 *   global table; passing it in the others would add a local table per frame.
 */
export async function downloadGameGif(pgn: string, filename: string, options: GifOptions = {}): Promise<void> {
  const size = options.size ?? 320;
  const delay = options.delayMs ?? 900;

  const positions = replayGame(pgn);
  if (positions.length === 0) throw new Error("Esta partida no tiene jugadas que exportar.");

  const canvas = document.createElement("canvas");
  const encoder = GIFEncoder();

  // The sample is the FIRST TWO frames: the colours of the last-move highlight
  // do not exist in the initial position, and without them in the palette the
  // highlight would come out in another colour for the rest of the game.
  await drawPosition(canvas, positions[0].fen, { size });
  const first = new Uint8ClampedArray(frameData(canvas, size));

  let sample: Uint8ClampedArray = first;
  const secondPosition = positions[1];
  if (secondPosition) {
    await drawPosition(canvas, secondPosition.fen, { size, lastMove: secondPosition.lastMove });
    const second = frameData(canvas, size);
    sample = new Uint8ClampedArray(first.length + second.length);
    sample.set(first, 0);
    sample.set(second, first.length);
  }

  // The fill colour leaves the transparency index free: since `applyPalette`
  // only sees the real colours, no pixel can land on it. It is padded to 32
  // entries so the file's table measures exactly what `colorDepth` says,
  // whatever palette comes out — the quantiser returns FEWER colours when the
  // image does not have enough.
  const palette = quantize(sample, GIF_COLORS);
  const transparentIndex = palette.length;
  const framePalette = Array.from({ length: 1 << GIF_COLOR_DEPTH }, (_, index) => palette[index] ?? [0, 0, 0]);

  let previous: Uint8Array | null = null;

  for (const [index, position] of positions.entries()) {
    if (index > 0) await drawPosition(canvas, position.fen, { size, lastMove: position.lastMove });
    const indexed = applyPalette(index === 0 ? first : frameData(canvas, size), palette);

    // What has not changed is left transparent and the frame below shows through.
    // The first one goes in full: it is the one that composes the board.
    const frame = new Uint8Array(indexed);
    if (previous) {
      for (let pixel = 0; pixel < frame.length; pixel += 1) {
        if (frame[pixel] === previous[pixel]) frame[pixel] = transparentIndex;
      }
    }
    previous = indexed;

    encoder.writeFrame(frame, size, size, {
      // Only in the first one: there it is the global table, in the others it
      // would be a local table repeated in every frame.
      palette: index === 0 ? framePalette : undefined,
      colorDepth: GIF_COLOR_DEPTH,
      transparent: index > 0,
      transparentIndex,
      dispose: 1,
      // The last position stays a while longer: it is where the game ends, and
      // without that pause the loop starts over before there is time to see it.
      delay: index === positions.length - 1 ? delay * 3 : delay,
    });
  }

  encoder.finish();
  download(new Blob([encoder.bytes() as BlobPart], { type: "image/gif" }), filename);
}
