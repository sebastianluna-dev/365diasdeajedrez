import type { StaticDiagramArrow } from "@/components/chess/static-diagram-arrows";

// What a row of a student's exercise attempts draws, as data (D24): the
// teacher's service maps an attempt to it and the section hands it to
// `ExerciseAttemptRow`. The mistake comes ready to draw: the position, the
// two moves in Spanish and their arrows.

/** How the attempt went: the four words the student saw. */
export type ExerciseAttemptOutcome = "solved" | "hinted" | "failed" | "solutionShown";

/** The first wrong move of a failed attempt (D19): where it happened and what was expected instead. */
export interface ExerciseAttemptMistake {
  /** The position the move was played in. */
  fen: string;
  /** The side to move at the start, at the bottom. */
  orientation: "white" | "black";
  /** «Cxe5», «Dxh7+»: Spanish notation. */
  playedLabel: string;
  expectedLabel: string;
  /** The played move (danger) and the expected one (success), for the diagram. */
  arrows: StaticDiagramArrow[];
}

export interface ExerciseAttemptRowData {
  id: string;
  title: string;
  /** The exercise's editor when it is the teacher's own; null for one that is not theirs to open. */
  href: string | null;
  /** When, as stored (ISO) and as the server words it. */
  atIso: string;
  atLabel: string;
  outcome: ExerciseAttemptOutcome;
  /** «Resuelto», «Resuelto con pista», «Fallado», «Vio la solución». */
  outcomeLabel: string;
  /** Where it was solved: «Serie: Táctica 1», «De una serie eliminada», «Práctica libre»… */
  whereLabel: string;
  /** «1 min 12 s», or null when the time was not kept. */
  durationLabel: string | null;
  /** Only a failed attempt at a wrong move has one; «Ver la solución» has none. */
  mistake: ExerciseAttemptMistake | null;
}
