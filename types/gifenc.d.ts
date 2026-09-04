// `gifenc` no trae tipos: sólo se declara lo que este proyecto usa, que es el
// codificador de GIF de la exportación de partidas
// (components/common/game-viewer/board-export.ts).
//
// Se escriben a mano y no se instala un `@types/*` porque no existe: el paquete
// son unos pocos kilobytes sin dependencias y su superficie es esta.
declare module "gifenc" {
  interface WriteFrameOptions {
    /** Paleta del cuadro; sin ella, gifenc reutiliza la global. */
    palette?: number[][];
    /** Duración del cuadro en milisegundos. */
    delay?: number;
    /** Veces que se repite la animación; 0 es «sin fin», el valor por defecto. */
    repeat?: number;
    /** Bits por píxel: 8 por defecto, 5 con una paleta de 32 colores. */
    colorDepth?: number;
    transparent?: boolean;
    transparentIndex?: number;
    /**
     * Qué hacer con el cuadro al pasar al siguiente (campo del estándar GIF):
     * 0 sin indicar, 1 dejarlo puesto, 2 borrarlo, 3 restaurar el anterior. Con
     * transparencia, gifenc pone 2 salvo que se diga otra cosa.
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

  /** Paleta de hasta `maxColors` colores a partir de los píxeles RGBA. */
  export function quantize(
    data: Uint8Array | Uint8ClampedArray,
    maxColors: number,
    options?: { format?: "rgb565" | "rgb444" | "rgba4444"; oneBitAlpha?: boolean | number; clearAlpha?: boolean },
  ): number[][];

  /** Los píxeles RGBA traducidos a índices de la paleta. */
  export function applyPalette(
    data: Uint8Array | Uint8ClampedArray,
    palette: number[][],
    format?: "rgb565" | "rgb444" | "rgba4444",
  ): Uint8Array;
}
