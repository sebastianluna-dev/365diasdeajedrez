import type { ExerciseStatusCode } from "@/constants/platform/exercise-codes.const";

// What a card of the exercise bank draws, as data: the services map an
// exercise to it and the sections hand it to `ExerciseCard`. The row actions
// travel as server actions, each taking the exercise's id; which of them a
// card offers is a datum too (`allowed`).

export interface ExerciseCardData {
  id: string;
  /** Where the title leads: the editor; null when the reader has no page of it (a teacher looking at the library). */
  href: string | null;
  title: string;
  /** The start position, drawn small; with the side to move at the bottom. */
  startFen: string;
  orientation: "white" | "black";
  statusCode: ExerciseStatusCode;
  /** The status as the catalog words it: «Borrador», «Listo»… */
  statusLabel: string;
  /** «Secuencia», «Mate en 2». */
  kindLabel: string;
  difficulty: number;
  /** The level the difficulty falls in, or null when none holds it. */
  levelName: string | null;
  /** The student's moves in the main line. */
  playerMoves: number;
  topicLabels: string[];
  /** Who wrote it, when the reader is not its owner: «Academia», or the teacher's name (the library, the review queue). */
  authorLabel?: string | null;
  /** The staff's note on a returned exercise, or on one taken out of the library: «Devuelto: …» (D16). */
  note?: string | null;
  /**
   * The row actions this exercise offers, by its status and its history;
   * `propose` and `withdraw` are the teacher's «Proponer a la biblioteca»
   * (READY) and «Retirar la propuesta» (IN_REVIEW).
   */
  allowed: {
    duplicate: boolean;
    archive: boolean;
    restore: boolean;
    delete: boolean;
    propose?: boolean;
    withdraw?: boolean;
  };
}

/** A row action of the bank: a server action bound to nothing, given the id. */
export type ExerciseCardAction = (exerciseId: string, formData: FormData) => Promise<void>;

/** The bank's row actions, from the section; stubs in Storybook. A lesson's panel hands only the two it has. */
export interface ExerciseCardActions {
  duplicate?: ExerciseCardAction;
  archive?: ExerciseCardAction;
  restore?: ExerciseCardAction;
  delete?: ExerciseCardAction;
  /** «Proponer a la biblioteca» (READY → IN_REVIEW, D07, D16). */
  propose?: ExerciseCardAction;
  /** «Retirar la propuesta» (IN_REVIEW → READY). */
  withdraw?: ExerciseCardAction;
}
