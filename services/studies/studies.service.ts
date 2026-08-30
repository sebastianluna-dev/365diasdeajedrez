import { cache } from "react";
import { COURSE_STATUS } from "@/constants/platform/course-codes.const";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import {
  gameViewInclude,
  mapGameView,
  mapStudyDetail,
  mapStudySummary,
  studyDetailInclude,
  studySummaryInclude,
} from "./studies.mapper";
import type { GameView, StudyDetail, StudySummary } from "./studies.types";

// «Mis estudios» en la interfaz; GameDatabase en el dominio. El alumno ve sus
// bases propias (editables) y las de los cursos publicados (sólo lectura).
const getVisibleStudiesWhere = cache(async () => {
  const user = await getCurrentUser();
  return {
    OR: [{ userId: user.id }, { course: { status: { code: COURSE_STATUS.PUBLISHED } } }],
  };
});

export async function getUserStudies(): Promise<StudySummary[]> {
  const db = getPlatformDb();
  const where = await getVisibleStudiesWhere();
  const rows = await db.gameDatabase.findMany({
    where,
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
    include: studySummaryInclude,
  });
  return rows.map(mapStudySummary);
}

export async function getStudyById(studyId: string): Promise<StudyDetail | null> {
  const db = getPlatformDb();
  const where = await getVisibleStudiesWhere();
  const row = await db.gameDatabase.findFirst({ where: { AND: [{ id: studyId }, where] }, include: studyDetailInclude });
  return row ? mapStudyDetail(row) : null;
}

export async function getGameById(studyId: string, gameId: string): Promise<GameView | null> {
  const db = getPlatformDb();
  const where = await getVisibleStudiesWhere();
  const row = await db.game.findFirst({
    where: { id: gameId, databaseId: studyId, database: where },
    include: gameViewInclude,
  });
  return row ? mapGameView(row) : null;
}
