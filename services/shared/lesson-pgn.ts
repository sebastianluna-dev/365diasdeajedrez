import { startFenOf } from "@/lib/chess/mainline";

// Where a lesson's content comes from.
//
// There are two possible sources and ONE single place that decides between them:
//
//  - if the lesson references a game of the course collection (`gameId`), the
//    content is that game's PGN — that way, fixing it fixes every lesson that
//    uses it;
//  - if not, the content is its own `pgn`, which is how lessons were born.
//
// Pure module (only structural types, no Prisma and no `server-only`) so that
// services, mappers and tests can use it without dragging in data access.
// `lessonPgnSelect` travels with it on purpose: whoever reads a lesson's PGN
// has to bring its game's along too, and having them together is what keeps a
// query from forgetting half of it.

/** What has to be asked of Prisma in order to resolve the content. */
export const lessonPgnSelect = {
  pgn: true,
  game: { select: { pgn: true } },
} as const;

export interface LessonPgnSource {
  pgn: string;
  /** The referenced game, or `null` when the lesson has its own content. */
  game: { pgn: string } | null;
}

/** The PGN the student is shown. */
export function lessonPgnOf(lesson: LessonPgnSource): string {
  return lesson.game?.pgn ?? lesson.pgn;
}

/** Whether the lesson has content, wherever it comes from. */
export function lessonHasContent(lesson: LessonPgnSource): boolean {
  return lessonPgnOf(lesson).trim().length > 0;
}

/**
 * Which position the lesson starts from, or `null` when it is the initial one.
 *
 * It comes from the PGN that RULES, which is the linked game's when there is
 * one. It is the FEN an exercise has to be frozen with: deriving it from
 * anywhere else is freezing moves against a board the student never sees.
 */
export function lessonStartFenOf(lesson: LessonPgnSource): string | null {
  return startFenOf(lessonPgnOf(lesson));
}
