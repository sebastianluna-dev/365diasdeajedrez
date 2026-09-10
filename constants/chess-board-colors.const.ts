// Colours of the board squares. The same values live as CSS tokens in
// app/(frontend)/globals.css (`--board-light`, `--board-dark`), which is what
// the stylesheets use; this copy is for what paints on a canvas
// (board-export.ts), which cannot read CSS variables. If one changes, both change.
export const BOARD_LIGHT_SQUARE = "#eeeed2";
export const BOARD_DARK_SQUARE = "#769656";
