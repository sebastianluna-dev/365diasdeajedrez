import { DATABASE_KIND, type DatabaseKindCode } from "./study-codes.const";

export type StudyKindPiece = "rook" | "king" | "pawn";

export interface StudyKindCard {
  /** One line under the kind's name in the creation dialog. */
  description: string;
  /** The piece drawn on the card, from `public/pieces`. */
  piece: StudyKindPiece;
}

/**
 * What the creation dialog says about each kind a user can create. The labels
 * come from the database catalog; this is only the card's flourish, so a kind
 * missing here still renders, with its label alone.
 */
export const STUDY_KIND_CARDS: Partial<Record<DatabaseKindCode, StudyKindCard>> = {
  [DATABASE_KIND.TOURNAMENT]: { description: "Tus partidas de competición", piece: "rook" },
  [DATABASE_KIND.STUDY]: { description: "Estudio libre de posiciones", piece: "king" },
  [DATABASE_KIND.COLLECTION]: { description: "Para compartir con tus alumnos", piece: "pawn" },
};
