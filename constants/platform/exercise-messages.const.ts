import type { SetupProblem } from "@/lib/chess/position-setup";

// What the exercise editor says, in one place (docs → Chess → Library for the position setup).
// «Ejercicio» is masculine: every message about one agrees with it.

/** Why «Colocar piezas» refuses a position, under the board (`validateSetup`). */
export const SETUP_PROBLEM_MESSAGES: Record<SetupProblem, string> = {
  empty: "Coloca al menos los dos reyes.",
  kings: "Cada bando necesita exactamente un rey.",
  pawnsOnBackrank: "Hay peones en la primera o la última fila.",
  oppositeCheck: "El bando que no juega está en jaque: esa posición no puede darse.",
  castling: "Ese enroque necesita el rey y la torre en su casilla.",
  enPassant: "Esa casilla al paso no es posible en esta posición.",
  impossibleCheck: "Ese jaque no puede darse en una partida.",
  impossibleMaterial: "Hay más piezas de las que puede tener un bando.",
};
