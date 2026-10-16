// What the progress of a series draws, as data (D24): one row per student
// the series reaches now, one cell per exercise in its order. The teacher's
// service maps the attempts to it; nothing is stored.

export type SeriesProgressCellState = "solved" | "failed" | "untried";

/** A student's standing with one exercise of the series: solved there, failed there so far, or not tried. */
export interface SeriesProgressCell {
  state: SeriesProgressCellState;
  /** Their attempts at it in this series. */
  attempts: number;
}

export interface SeriesProgressItem {
  exerciseId: string;
  /** Its number in the series, from 1. */
  n: number;
  title: string;
}

export interface SeriesProgressStudent {
  userId: string;
  displayName: string;
  /** The student's exercises tab. */
  href: string;
  /** One per item, in the items' order. */
  cells: SeriesProgressCell[];
  /** How many of the items they solved. */
  solved: number;
}

export interface SeriesProgressData {
  items: SeriesProgressItem[];
  students: SeriesProgressStudent[];
  /** «Resolvieron N de M»: the students who solved every item, of those the series reaches. */
  completed: number;
}
