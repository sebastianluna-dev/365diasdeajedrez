import { cache } from "react";
import { formatSpanishDate } from "@/lib/format-spanish-date";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { platformRoutes } from "@/lib/platform-routes";
import { getVisibleDatabasesWhere } from "@/services/shared/game-visibility";
import {
  gameViewInclude,
  mapGameView,
  mapStudyDetail,
  mapStudySummary,
  studyDetailInclude,
  studySummaryInclude,
} from "./studies.mapper";
import type { ClassGameItem, GameView, StudyDetail, StudyKindOption, StudySummary } from "./studies.types";

// «Mis estudios» en la interfaz; GameDatabase en el dominio. El alumno ve sus
// bases propias (editables), las de los cursos que ha empezado (sólo lectura) y
// una colección derivada con las partidas que ha visto en clase.
//
// El filtro de visibilidad vive en services/shared/game-visibility para que el
// buscador por posición use exactamente el mismo.
const getVisibleStudiesWhere = getVisibleDatabasesWhere;

/**
 * Identificador de la tarjeta de partidas de clase. No es un id de base: existe
 * sólo para que la lista tenga una clave estable, y por eso no es un uuid —
 * confundirlo con uno se ve a simple vista.
 */
const CLASS_GAMES_ID = "class-games";

export async function getUserStudies(): Promise<StudySummary[]> {
  const db = getPlatformDb();
  const where = await getVisibleStudiesWhere();
  const rows = await db.gameDatabase.findMany({
    where,
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
    include: studySummaryInclude,
  });

  const studies = rows.map(mapStudySummary);
  const classGames = await getClassGamesSummary();
  // Al final de la lista y sólo si hay algo: una tarjeta vacía «partidas de
  // clase» sería ruido para quien todavía no ha ido a ninguna.
  return classGames ? [...studies, classGames] : studies;
}

/** Tipos de estudio del catálogo: las etiquetas viven en la base, no en la UI. */
export const getStudyKinds = cache(async (): Promise<StudyKindOption[]> => {
  const db = getPlatformDb();
  const rows = await db.databaseKind.findMany({ orderBy: { order: "asc" }, select: { code: true, label: true } });
  return rows.map((row) => ({ code: row.code, label: row.label }));
});

/** Resultados del catálogo. El label ES el token PGN («1-0», «*»…). */
export const getGameResultOptions = cache(async (): Promise<StudyKindOption[]> => {
  const rows = await getPlatformDb().gameResult.findMany({
    orderBy: { order: "asc" },
    select: { code: true, label: true },
  });
  return rows.map((row) => ({ code: row.code, label: row.label }));
});

export async function getStudyById(studyId: string): Promise<StudyDetail | null> {
  const db = getPlatformDb();
  const where = await getVisibleStudiesWhere();
  const row = await db.gameDatabase.findFirst({ where: { AND: [{ id: studyId }, where] }, include: studyDetailInclude });
  return row ? mapStudyDetail(row) : null;
}

export async function getGameById(studyId: string, gameId: string): Promise<GameView | null> {
  const db = getPlatformDb();
  const [where, user] = await Promise.all([getVisibleStudiesWhere(), getCurrentUser()]);
  const row = await db.game.findFirst({
    where: { id: gameId, databaseId: studyId, database: where },
    include: gameViewInclude,
  });
  return row ? mapGameView(row, user.id) : null;
}

// --- Partidas vistas en clase ----------------------------------------------
//
// No son una base de datos: son punteros desde los bloques de las clases a las
// que el alumno asistió (ClassBlock.gameId), y la partida puede vivir en la
// base de su profesor. Por eso el enlace lleva a la CLASE donde se vio y no al
// visor de estudios: allí ya tiene acceso y además conserva el contexto, y
// evita enseñarle el nombre de la base privada de otra persona.

/** Partidas de clase, memorizado: la lista y la tarjeta resumen lo comparten. */
const getClassGameItems = cache(async (): Promise<ClassGameItem[]> => {
  const db = getPlatformDb();
  const user = await getCurrentUser();

  const blocks = await db.classBlock.findMany({
    where: {
      gameId: { not: null },
      class: { participants: { some: { userId: user.id } } },
    },
    orderBy: [{ class: { scheduledAt: "desc" } }, { order: "asc" }],
    select: {
      classId: true,
      class: { select: { title: true, scheduledAt: true } },
      game: {
        select: {
          id: true,
          white: true,
          black: true,
          eco: true,
          playedAt: true,
          result: { select: { label: true } },
        },
      },
    },
  });

  // La misma partida puede aparecer en varias clases: se queda la más reciente,
  // que es la primera por el orden de la consulta.
  const seen = new Set<string>();
  const items: ClassGameItem[] = [];
  for (const block of blocks) {
    if (!block.game || seen.has(block.game.id)) continue;
    seen.add(block.game.id);
    items.push({
      id: block.game.id,
      white: block.game.white,
      black: block.game.black,
      resultLabel: block.game.result.label,
      eco: block.game.eco ?? undefined,
      playedAtLabel: block.game.playedAt ? formatSpanishDate(block.game.playedAt) : undefined,
      className: block.class.title,
      classDateLabel: formatSpanishDate(block.class.scheduledAt),
      href: platformRoutes.classDetail(block.classId),
    });
  }
  return items;
});

/** Tarjeta de la colección en «Mis estudios», o null si no hay ninguna. */
async function getClassGamesSummary(): Promise<StudySummary | null> {
  const items = await getClassGameItems();
  if (items.length === 0) return null;

  return {
    id: CLASS_GAMES_ID,
    name: "Partidas de mis clases",
    description: "Las partidas que se han visto en las clases a las que asististe.",
    kindLabel: "Colección",
    gameCount: items.length,
    updatedAtLabel: items[0].classDateLabel,
    isCourseStudy: false,
    href: platformRoutes.classGames,
  };
}

/** Contenido de la colección para su propia página. */
export async function getClassGames(): Promise<ClassGameItem[]> {
  return getClassGameItems();
}
