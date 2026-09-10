import "server-only";
import { OWNER_TYPE } from "@/constants/platform/shared-codes.const";
import { DATABASE_KIND } from "@/constants/platform/study-codes.const";
import type { Prisma } from "@/lib/platform-db/generated/client";

// "Mis partidas": the study that exists automatically for every student and
// where the games that belong to no tournament end up.
//
// It is created when the account is created and is created nowhere else: the
// student does not ask for it and the interface does not offer it. Uniqueness
// does not depend on this code being called only once — two simultaneous
// creations would both pass any check — but on the partial unique index
// `game_database_one_default_per_user` (manual SQL in migration 20260904190000,
// like the one for TeacherStudent's active assignments).
//
// The accounts predating this were covered by that same migration's backfill, so
// there is no need to create it lazily on entry: nobody can be missing it.

export const DEFAULT_STUDY_NAME = "Mis partidas";

/**
 * Creates "Mis partidas" for a newly created student.
 *
 * @param db client or transaction: the creation may want the account and its
 *   study to go in together or not at all.
 */
export async function createDefaultStudy(db: Prisma.TransactionClient, userId: string): Promise<void> {
  await db.gameDatabase.create({
    data: {
      ownerType: { connect: { code: OWNER_TYPE.USER } },
      user: { connect: { id: userId } },
      kind: { connect: { code: DATABASE_KIND.MY_GAMES } },
      name: DEFAULT_STUDY_NAME,
      description: "Tus partidas que no pertenecen a ningún torneo.",
      isDefault: true,
      order: 0,
    },
  });
}
