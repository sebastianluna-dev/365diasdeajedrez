import { formatSpanishDate } from "@/lib/format-spanish-date";
import type { Prisma } from "@/lib/platform-db/generated/client";
import { platformRoutes } from "@/lib/platform-routes";
import type { GameView, StudyDetail, StudyGameItem, StudySummary } from "./studies.types";

export const studySummaryInclude = {
  kind: true,
  course: { select: { name: true } },
  _count: { select: { games: true } },
} satisfies Prisma.GameDatabaseInclude;

export type StudySummaryRow = Prisma.GameDatabaseGetPayload<{ include: typeof studySummaryInclude }>;

export const studyDetailInclude = {
  kind: true,
  course: { select: { name: true } },
  games: {
    orderBy: [{ playedAt: "desc" }, { createdAt: "desc" }],
    include: { result: { select: { label: true } } },
  },
} satisfies Prisma.GameDatabaseInclude;

export type StudyDetailRow = Prisma.GameDatabaseGetPayload<{ include: typeof studyDetailInclude }>;

export const gameViewInclude = {
  result: { select: { label: true } },
  source: { select: { label: true } },
  database: { select: { id: true, name: true } },
} satisfies Prisma.GameInclude;

export type GameViewRow = Prisma.GameGetPayload<{ include: typeof gameViewInclude }>;

export function mapStudySummary(row: StudySummaryRow): StudySummary {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    kindLabel: row.kind.label,
    gameCount: row._count.games,
    updatedAtLabel: formatSpanishDate(row.updatedAt),
    courseName: row.course?.name,
    isCourseStudy: row.courseId !== null,
    href: platformRoutes.studyDetail(row.id),
  };
}

function mapStudyGameItem(studyId: string, game: StudyDetailRow["games"][number]): StudyGameItem {
  return {
    id: game.id,
    white: game.white,
    black: game.black,
    resultLabel: game.result.label,
    eco: game.eco ?? undefined,
    event: game.event ?? undefined,
    playedAtLabel: game.playedAt ? formatSpanishDate(game.playedAt) : undefined,
    href: platformRoutes.gameDetail(studyId, game.id),
  };
}

export function mapStudyDetail(row: StudyDetailRow): StudyDetail {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    kindLabel: row.kind.label,
    isCourseStudy: row.courseId !== null,
    courseName: row.course?.name,
    games: row.games.map((game) => mapStudyGameItem(row.id, game)),
  };
}

export function mapGameView(row: GameViewRow): GameView {
  return {
    id: row.id,
    studyId: row.database.id,
    studyName: row.database.name,
    studyHref: platformRoutes.studyDetail(row.database.id),
    white: row.white,
    black: row.black,
    whiteElo: row.whiteElo ?? undefined,
    blackElo: row.blackElo ?? undefined,
    resultLabel: row.result.label,
    event: row.event ?? undefined,
    site: row.site ?? undefined,
    eco: row.eco ?? undefined,
    playedAtLabel: row.playedAt ? formatSpanishDate(row.playedAt) : undefined,
    sourceLabel: row.source.label,
    pgn: row.pgn,
  };
}
