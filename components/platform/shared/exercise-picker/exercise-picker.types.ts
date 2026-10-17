// What the picker offers, as data: the teacher's service maps a pickable
// exercise (D08: theirs and usable, or the library's) to it, for a series or
// for a class block.

export interface ExercisePickOption {
  id: string;
  title: string;
  /** «Mate en 2 · 1400». */
  facts: string;
  /** The topics, «Táctica, Clavada». */
  topics: string;
}
