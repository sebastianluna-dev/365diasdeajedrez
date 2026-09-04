"use client";

import type { Key } from "@lichess-org/chessground/types";
import { parseFen } from "chessops/fen";
import { GIFEncoder, applyPalette, quantize } from "gifenc";
import { replayGame } from "@/lib/chess/replay";

// Sacar la partida del navegador: la posición como imagen y la partida entera
// como GIF.
//
// El tablero se pinta EN UN CANVAS aparte y no se captura el que está en
// pantalla: chessground dibuja con CSS —fondos, sprites, transformaciones— y
// llevar eso a una imagen exige o una librería de captura o inventarse cómo
// resuelve el navegador cada regla. Repintarlo aquí son cuarenta líneas y sale
// idéntico en cualquier navegador, con el tamaño que se pida y sin las marcas
// de la interfaz (jugada seleccionada, casillas de destino, flechas).

/** Los colores del tablero, los mismos de `chess-board.comp.css`. */
const LIGHT_SQUARE = "#eeeed2";
const DARK_SQUARE = "#769656";
/** El amarillo de la última jugada, ya mezclado sobre cada color de casilla. */
const LAST_MOVE_LIGHT = "#f6f682";
const LAST_MOVE_DARK = "#bcc46a";

const COLORS = ["white", "black"] as const;
const ROLES = ["pawn", "knight", "bishop", "rook", "queen", "king"] as const;

/** Nombre con el que se guarda cada pieza: el mismo que da chessops. */
function pieceKey(color: string, role: string): string {
  return `${color}-${role}`;
}

/**
 * Las piezas del tablero, sacadas de la hoja que chessground ya tiene cargada.
 *
 * `chessground.cburnett.css` —la que importa `chess-board.comp.tsx`— lleva los
 * doce SVG incrustados en base64 dentro de reglas `background-image`. Se leen de
 * ahí y NO se copian al repositorio: así lo que se exporta no puede dejar de
 * parecerse a lo que se ve, que es justo lo que pasaba usando las piezas del
 * selector de coronación.
 *
 * El selector de esas reglas es `.cg-wrap piece.pawn.white`, así que hace falta
 * una sonda con esa forma dentro del documento —fuera de la vista— para poder
 * preguntarle al navegador por su estilo ya resuelto. Se pregunta al estilo
 * computado y no a `document.styleSheets` porque el texto de las reglas depende
 * de cómo empaquete Next, y el valor computado es el mismo en cualquier caso.
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
      if (match) urls.set(key, match[1]);
    }
  } finally {
    probe.remove();
  }

  return urls;
}

/**
 * Piezas de respaldo: las del selector de coronación, servidas por la app.
 *
 * Sólo se usan si la hoja de chessground no está cargada —exportar desde una
 * pantalla sin tablero—, para que la función no dependa de quién la llame.
 */
const FALLBACK_PIECE_URL: Record<string, string> = {
  "white-pawn": "/design-import/assets/pieces/w-pawn.svg",
  "white-knight": "/design-import/assets/pieces/w-knight.svg",
  "white-bishop": "/design-import/assets/pieces/w-bishop.svg",
  "white-rook": "/design-import/assets/pieces/w-rook.svg",
  "white-queen": "/design-import/assets/pieces/w-queen.svg",
  "white-king": "/design-import/assets/pieces/w-king.svg",
  "black-pawn": "/design-import/assets/pieces/b-pawn.svg",
  "black-knight": "/design-import/assets/pieces/b-knight.svg",
  "black-bishop": "/design-import/assets/pieces/b-bishop.svg",
  "black-rook": "/design-import/assets/pieces/b-rook.svg",
  "black-queen": "/design-import/assets/pieces/b-queen.svg",
  "black-king": "/design-import/assets/pieces/b-king.svg",
};

/**
 * A qué tamaño se rasteriza cada pieza antes de encogerla a su casilla.
 *
 * Se da explícito porque estos SVG traen `viewBox` pero no `width`/`height`, y
 * una imagen SVG sin medida propia es justo el caso que algunos navegadores
 * dibujan en blanco. Con la medida puesta no hay nada que deducir.
 */
const PIECE_RASTER = 256;

/** Las doce imágenes se cargan una vez y se reutilizan en todos los cuadros. */
let piecesPromise: Promise<Map<string, HTMLImageElement>> | null = null;

/** De dónde salen las piezas: del tablero si está, del respaldo si no. */
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
  /** Lado de la imagen en píxeles. */
  size: number;
  /** [origen, destino] de la última jugada, para marcarla como en pantalla. */
  lastMove?: [Key, Key];
}

const FILES = "abcdefgh";

/**
 * Pinta una posición sobre un canvas, siempre desde el lado de las blancas: una
 * imagen que se comparte se lee como se lee un diagrama de un libro.
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

      ctx.fillStyle = isLastMove
        ? isLight
          ? LAST_MOVE_LIGHT
          : LAST_MOVE_DARK
        : isLight
          ? LIGHT_SQUARE
          : DARK_SQUARE;
      // La fila 8 va arriba: el eje del canvas crece hacia abajo.
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

/** Descarga un blob con el nombre dado, sin dejar la URL temporal colgando. */
function download(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/** Guarda la posición actual como PNG. */
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
  /** Lado de cada cuadro. Más pequeño que el PNG: son decenas de imágenes. */
  size?: number;
  /** Cuánto dura cada jugada, en milisegundos. */
  delayMs?: number;
}

/**
 * Colores de la paleta, uno menos que la potencia de dos: el que sobra queda
 * libre para la transparencia.
 *
 * Treinta y uno bastan porque el tablero es plano y las piezas también; lo único
 * que aporta color de verdad es el suavizado de los bordes. Con 32 entradas cada
 * píxel ocupa cinco bits en vez de ocho.
 */
const GIF_COLORS = 31;
const GIF_COLOR_DEPTH = 5;

/** Los píxeles de un cuadro, como los pide el cuantizador. */
function frameData(canvas: HTMLCanvasElement, size: number): Uint8ClampedArray {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Este navegador no deja dibujar sobre un canvas.");
  return ctx.getImageData(0, 0, size, size).data;
}

/**
 * Guarda la LÍNEA PRINCIPAL de la partida como GIF, una jugada por cuadro.
 *
 * Sólo la línea principal: un GIF es una secuencia y las variantes no lo son.
 *
 * Está escrito para que PESE POCO, que en una partida larga es la diferencia
 * entre poder compartirlo y no:
 *
 * - Cada cuadro pinta ÚNICAMENTE lo que cambia respecto al anterior —dos
 *   casillas, cuatro contando el resalte de la última jugada— y deja el resto
 *   transparente, que es lo que el GIF comprime a casi nada. Eso exige
 *   `dispose: 1` («no borres el cuadro anterior»): gifenc pone `2` en cuanto hay
 *   transparencia, y con eso la partida parpadearía sobre un fondo vacío.
 * - Paleta de 32 colores en vez de 256, con `colorDepth` a juego.
 * - La paleta se escribe UNA vez, en el primer cuadro, donde se convierte en la
 *   tabla global; pasarla en los demás añadiría una tabla local por cuadro.
 */
export async function downloadGameGif(pgn: string, filename: string, options: GifOptions = {}): Promise<void> {
  const size = options.size ?? 320;
  const delay = options.delayMs ?? 900;

  const positions = replayGame(pgn);
  if (positions.length === 0) throw new Error("Esta partida no tiene jugadas que exportar.");

  const canvas = document.createElement("canvas");
  const encoder = GIFEncoder();

  // La muestra son los DOS primeros cuadros: los colores del resalte de la
  // última jugada no existen en la posición inicial, y sin ellos en la paleta el
  // resalte saldría de otro color el resto de la partida.
  await drawPosition(canvas, positions[0].fen, { size });
  const first = new Uint8ClampedArray(frameData(canvas, size));

  let sample: Uint8ClampedArray = first;
  if (positions.length > 1) {
    await drawPosition(canvas, positions[1].fen, { size, lastMove: positions[1].lastMove });
    const second = frameData(canvas, size);
    sample = new Uint8ClampedArray(first.length + second.length);
    sample.set(first, 0);
    sample.set(second, first.length);
  }

  // El color de relleno deja libre el índice de la transparencia: como
  // `applyPalette` sólo ve los colores de verdad, ningún píxel puede aterrizar
  // en él. Se rellena hasta 32 entradas para que la tabla del archivo mida
  // exactamente lo que dice `colorDepth`, salga la paleta que salga —el
  // cuantizador devuelve MENOS colores si la imagen no da para más—.
  const palette = quantize(sample, GIF_COLORS);
  const transparentIndex = palette.length;
  const framePalette = Array.from({ length: 1 << GIF_COLOR_DEPTH }, (_, index) => palette[index] ?? [0, 0, 0]);

  let previous: Uint8Array | null = null;

  for (const [index, position] of positions.entries()) {
    if (index > 0) await drawPosition(canvas, position.fen, { size, lastMove: position.lastMove });
    const indexed = applyPalette(index === 0 ? first : frameData(canvas, size), palette);

    // Lo que no ha cambiado se deja transparente y se ve el cuadro de debajo.
    // El primero va entero: es el que compone el tablero.
    const frame = new Uint8Array(indexed);
    if (previous) {
      for (let pixel = 0; pixel < frame.length; pixel += 1) {
        if (frame[pixel] === previous[pixel]) frame[pixel] = transparentIndex;
      }
    }
    previous = indexed;

    encoder.writeFrame(frame, size, size, {
      // Sólo en el primero: ahí es la tabla global, en los demás sería una
      // tabla local repetida en cada cuadro.
      palette: index === 0 ? framePalette : undefined,
      colorDepth: GIF_COLOR_DEPTH,
      transparent: index > 0,
      transparentIndex,
      dispose: 1,
      // La última posición se queda un rato más: es donde acaba la partida y
      // sin esa pausa el bucle vuelve a empezar sin que dé tiempo a verla.
      delay: index === positions.length - 1 ? delay * 3 : delay,
    });
  }

  encoder.finish();
  download(new Blob([encoder.bytes() as BlobPart], { type: "image/gif" }), filename);
}
