/** A level as /administracion/niveles lists and edits it. */
export interface LevelAdminRow {
  id: number;
  name: string;
  slug: string;
  description: string;
  /** Position by difficulty, the easiest first. */
  order: number;
  /** Inclusive, never negative. */
  eloMin: number;
  /** Inclusive; absent = no upper bound ("2200 o más"). */
  eloMax?: number;
  /** The range as it is read: "Menos de 800", "800–1199", "2200 o más". */
  eloRange: string;
  /** A retired level is offered to no student; the courses that had it keep it. */
  isActive: boolean;
  /** Courses aimed at it, in any status. */
  courseCount: number;
}

/** A level as the course editor offers it. */
export interface LevelOption {
  slug: string;
  name: string;
  eloRange: string;
  isActive: boolean;
}
