import type { Prisma } from "@/lib/platform-db/generated/client";

// The visibility RULE, kept apart from whoever asks it.
//
// Pure module (only Prisma types, no DAL and no server-only) so that tests and
// scripts can exercise it with explicit ids: it is the border that keeps the
// search from showing games from another student's private studies, and
// checking it should not require setting up a request with a session.
//
// The wrapper that resolves the identity lives in game-visibility.ts.

export interface GameViewer {
  userId: string;
  /** Teacher id when whoever is looking is an active teacher; absent when they are not. */
  teacherId?: string;
}

/**
 * Visible game databases. Three paths:
 *
 * - their own;
 * - those of the courses they have STARTED: it is not enough for the course to
 *   be published, its database is course material and opens on entering it;
 * - the collections a teacher shared with them (StudyShare).
 *
 * All three are READ-only. That the last two cannot be written is not decided
 * here: the writes look at the ownership of the database, and neither the
 * course nor the shared collection is theirs.
 */
export function buildVisibleDatabasesWhere({ userId }: GameViewer): Prisma.GameDatabaseWhereInput {
  return {
    OR: [
      { userId },
      { course: { progresses: { some: { userId } } } },
      { shares: { some: { userId } } },
    ],
  };
}

/**
 * Visible games. It is wider than "the games of the visible databases", because
 * there are two paths that do not go through the ownership of the database:
 *
 * - those seen in class, which arrive by reference from a class block
 *   (ClassBlock.gameId) and can live in another person's database;
 * - those of the collections a teacher shared with them;
 * - those of the students with an ACTIVE assignment, if whoever is looking is
 *   their teacher; the same criterion as the guards in lib/platform-auth/guards.ts.
 */
export function buildVisibleGamesWhere({ userId, teacherId }: GameViewer): Prisma.GameWhereInput {
  const visible: Prisma.GameWhereInput[] = [
    { database: { userId } },
    { database: { course: { progresses: { some: { userId } } } } },
    { database: { shares: { some: { userId } } } },
    { classBlocks: { some: { class: { participants: { some: { userId } } } } } },
  ];

  if (teacherId) {
    visible.push({
      database: { user: { studentAssignments: { some: { teacherId, endedAt: null } } } },
    });
  }

  return { OR: visible };
}
