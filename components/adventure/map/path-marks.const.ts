// Original artwork drawn for this project (the version-2 mockup of proposal B, «El
// cuaderno del viajero»), exported by scripts/adventure-art.ts: edit the mockup
// and run `npm run adventure:art` again instead of editing this file by hand.

/** The small marks printed along the paper tape (a pawn, a knight and a star), as the mockup draws them. */
export const PATH_MARKS = {
  pawn: "M-12 0h24l-2 -6h-20zM-9 -6C-7 -14 -5 -20 -6 -25H6C5 -20 7 -14 9 -6ZM-9 -25h18v-4h-18zM0 -45a8.5 8.5 0 1 0 .1 0z",
  knight:
    "M-22 0h44l-3 -8h-38zM-17 -8h34l-3 -7h-28zM-14 -15C-15 -30 -10 -42 -2 -50C-11 -52 -19 -56 -22 -63C-24 -69 -20 -73 -14 -71C-6 -79 2 -87 9 -90L11 -97L15 -90C25 -86 29 -71 27 -55C25 -37 19 -24 17 -15Z",
  star: "M0 -6.4L1.6 -2.2L6.1 -2L2.6 0.8L3.8 5.2L0 2.7L-3.8 5.2L-2.6 0.8L-6.1 -2L-1.6 -2.2Z",
} as const;
