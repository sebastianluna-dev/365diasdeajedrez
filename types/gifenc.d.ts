// `gifenc` ships no types: only what this project uses is declared, which is the
// GIF encoder of the game export
// (components/common/game-viewer/board-export.ts).
//
// They are written by hand and no `@types/*` is installed because none exists:
// the package is a few kilobytes without dependencies and this is its surface.
declare module "gifenc" {
  interface WriteFrameOptions {
    /** Palette of the frame; without it, gifenc reuses the global one. */
    palette?: number[][];
    /** Duration of the frame in milliseconds. */
    delay?: number;
    /** Times the animation repeats; 0 is "endless", the default value. */
    repeat?: number;
    /** Bits per pixel: 8 by default, 5 with a 32-colour palette. */
    colorDepth?: number;
    transparent?: boolean;
    transparentIndex?: number;
    /**
     * What to do with the frame when moving to the next (a field of the GIF
     * standard): 0 unspecified, 1 leave it in place, 2 clear it, 3 restore the
     * previous one. With transparency, gifenc sets 2 unless told otherwise.
     */
    dispose?: number;
  }

  interface Encoder {
    writeFrame(index: Uint8Array, width: number, height: number, options?: WriteFrameOptions): void;
    finish(): void;
    bytes(): Uint8Array;
    bytesView(): Uint8Array;
    reset(): void;
  }

  export function GIFEncoder(options?: { auto?: boolean; initialCapacity?: number }): Encoder;

  /** Palette of up to `maxColors` colours from the RGBA pixels. */
  export function quantize(
    data: Uint8Array | Uint8ClampedArray,
    maxColors: number,
    options?: { format?: "rgb565" | "rgb444" | "rgba4444"; oneBitAlpha?: boolean | number; clearAlpha?: boolean },
  ): number[][];

  /** The RGBA pixels translated to palette indexes. */
  export function applyPalette(
    data: Uint8Array | Uint8ClampedArray,
    palette: number[][],
    format?: "rgb565" | "rgb444" | "rgba4444",
  ): Uint8Array;
}
