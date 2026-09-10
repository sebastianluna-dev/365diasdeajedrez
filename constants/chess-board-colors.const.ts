// Colores de las casillas del tablero. Los mismos valores viven como tokens
// CSS en app/(frontend)/globals.css (`--board-light`, `--board-dark`), que es
// lo que usan las hojas; esta copia es para lo que pinta en un canvas
// (board-export.ts), que no puede leer variables CSS. Si cambia uno, cambian
// los dos.
export const BOARD_LIGHT_SQUARE = "#eeeed2";
export const BOARD_DARK_SQUARE = "#769656";
