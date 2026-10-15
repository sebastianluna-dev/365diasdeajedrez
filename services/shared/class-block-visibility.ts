import { CLASS_BLOCK_VISIBILITY, CLASS_STATUS } from "@/constants/platform/class-codes.const";
import type { Prisma } from "@/lib/platform-db/generated/client";

// Which blocks of a class a student may reach, as a Prisma `where`: the SQL
// twin of `isBlockVisibleToStudent` (class-rules.ts), for the reads that
// start from the blocks rather than from a class — the games seen in class,
// the explorer, the copy to a study. Pure module (only Prisma types), so the
// tests read the `where` without a database.

/**
 * The blocks a student sees: of a class they are in that is not cancelled,
 * what is «para preparar» always, what is «después de la clase» once the
 * class ended or was finalized, and the teacher's script never.
 */
export function studentVisibleClassBlockWhere(userId: string, now: Date): Prisma.ClassBlockWhereInput {
  return {
    AND: [
      {
        class: {
          participants: { some: { userId } },
          status: { code: { not: CLASS_STATUS.CANCELLED } },
        },
      },
      {
        OR: [
          { visibility: { code: CLASS_BLOCK_VISIBILITY.BEFORE } },
          {
            visibility: { code: CLASS_BLOCK_VISIBILITY.AFTER },
            class: { OR: [{ endsAt: { lte: now } }, { status: { code: CLASS_STATUS.COMPLETED } }] },
          },
        ],
      },
    ],
  };
}
