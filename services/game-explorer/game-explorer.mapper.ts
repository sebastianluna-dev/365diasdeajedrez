import { OWNER_TYPE } from "@/constants/platform/shared-codes.const";
import { formatSpanishDate } from "@/lib/format-spanish-date";
import type { Prisma } from "@/lib/platform-db/generated/client";
import { platformRoutes, teacherRoutes } from "@/lib/platform-routes";
import { GAME_ORIGIN_LABEL, gameOriginOf } from "@/services/shared/game-origin";
import type { ExplorerGame } from "./game-explorer.types";

/**
 * What is needed to render a game of the search and to decide where it leads.
 * The class block is filtered by the user looking: it only counts as "seen in
 * class" if they were in THAT class.
 */
export function explorerGameInclude(viewerId: string) {
  return {
    result: { select: { label: true } },
    database: {
      select: {
        id: true,
        userId: true,
        ownerType: { select: { code: true } },
        user: {
          select: {
            teacher: { select: { id: true } },
            staff: { select: { id: true } },
          },
        },
      },
    },
    classBlocks: {
      where: { class: { participants: { some: { userId: viewerId } } } },
      select: { classId: true },
      take: 1,
    },
  } satisfies Prisma.GameInclude;
}

export type ExplorerGameRow = Prisma.GameGetPayload<{
  include: ReturnType<typeof explorerGameInclude>;
}>;

export interface ExplorerViewer {
  userId: string;
  /** Students with an active assignment; empty if whoever is looking is not a teacher. */
  assignedStudentIds: ReadonlySet<string>;
}

/**
 * Where the searcher can open this game.
 *
 * The order matters and goes from the most direct view to the most indirect. A
 * game can be visible through several paths at once (a student's game, whose
 * teacher is the one looking, discussed in class), and it is best to send them
 * to the view with the most context. If no path applies it returns undefined:
 * the game is listed without a link rather than leading to a 404.
 */
function explorerGameHref(row: ExplorerGameRow, viewer: ExplorerViewer): string | undefined {
  const database = row.database;

  if (database.userId === viewer.userId) return platformRoutes.gameDetail(database.id, row.id);
  if (database.ownerType.code === OWNER_TYPE.COURSE) return platformRoutes.gameDetail(database.id, row.id);
  if (database.userId && viewer.assignedStudentIds.has(database.userId)) {
    return teacherRoutes.studentGame(database.userId, database.id, row.id);
  }
  // Seen in class: the game lives in someone else's database, so the student
  // opens it in the class where it was discussed and not in a study that is not theirs.
  const classBlock = row.classBlocks[0];
  if (classBlock) return platformRoutes.classDetail(classBlock.classId);

  return undefined;
}

export function mapExplorerGame(row: ExplorerGameRow, viewer: ExplorerViewer): ExplorerGame {
  const owner = row.database.user;
  const origin = gameOriginOf({
    ownerTypeCode: row.database.ownerType.code,
    owner: owner ? { isTeacher: owner.teacher !== null, isStaff: owner.staff !== null } : null,
  });

  return {
    id: row.id,
    white: row.white,
    black: row.black,
    whiteElo: row.whiteElo ?? undefined,
    blackElo: row.blackElo ?? undefined,
    resultLabel: row.result.label,
    playedAtLabel: row.playedAt ? formatSpanishDate(row.playedAt) : undefined,
    event: row.event ?? undefined,
    origin,
    originLabel: GAME_ORIGIN_LABEL[origin],
    seenInClass: row.classBlocks.length > 0,
    href: explorerGameHref(row, viewer),
  };
}
