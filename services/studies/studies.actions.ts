"use server";

import { makePgn, parsePgn } from "chessops/pgn";
import { revalidatePath } from "next/cache";
import { OWNER_TYPE } from "@/constants/platform/shared-codes.const";
import {
  DATABASE_KIND,
  GAME_RESULT,
  GAME_RESULT_BY_PGN_TOKEN,
  GAME_SOURCE,
  type DatabaseKindCode,
} from "@/constants/platform/study-codes.const";
import { PGN_MAX_GAMES, PGN_MAX_LENGTH } from "@/constants/platform/content-limits.const";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import type { Prisma } from "@/lib/platform-db/generated/client";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { platformRoutes } from "@/lib/platform-routes";
import { allowAction } from "@/lib/rate-limit";

// Las server actions son alcanzables por POST directo: el usuario SIEMPRE se
// resuelve aquí dentro (DAL) y la propiedad de la base se comprueba contra la
// base de datos antes de escribir. Entradas vacías o basura salen sin lanzar.

const STUDY_NAME_MAX_LENGTH = 120;
const STUDY_DESCRIPTION_MAX_LENGTH = 500;
const UNKNOWN_PLAYER = "Desconocido";
/** Sólo fechas completas: el PGN admite "????.??.??" y "2024.??.??". */
const FULL_PGN_DATE = /^(\d{4})\.(\d{2})\.(\d{2})$/;

function readText(formData: FormData, field: string): string {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function isDatabaseKindCode(value: string): value is DatabaseKindCode {
  return (Object.values(DATABASE_KIND) as string[]).includes(value);
}

/** Cabecera útil o null: el PGN usa "?" como marcador de dato desconocido. */
function readHeader(headers: Map<string, string>, key: string): string | null {
  const value = headers.get(key)?.trim();
  return value && value !== "?" ? value : null;
}

function readEloHeader(headers: Map<string, string>, key: string): number | null {
  const value = readHeader(headers, key);
  if (value === null || !/^\d+$/.test(value)) return null;
  return Number.parseInt(value, 10);
}

function readDateHeader(headers: Map<string, string>): Date | null {
  const value = readHeader(headers, "Date");
  const match = value ? FULL_PGN_DATE.exec(value) : null;
  if (!match) return null;

  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  const isRealDate = date.getUTCMonth() === Number(month) - 1 && date.getUTCDate() === Number(day);
  return isRealDate ? date : null;
}

/**
 * Crea una base propia del alumno («estudio» en la interfaz). El tipo llega
 * como code del catálogo y se valida contra DATABASE_KIND antes de conectar.
 */
export async function createStudy(formData: FormData): Promise<void> {
  const name = readText(formData, "name");
  const kindCode = readText(formData, "kindCode");
  if (name.length === 0 || !isDatabaseKindCode(kindCode)) return;

  const description = readText(formData, "description");
  const db = getPlatformDb();
  const user = await getCurrentUser();
  if (!allowAction(`${user.id}:create-study`, 20, 60_000)) return;

  await db.gameDatabase.create({
    data: {
      ownerType: { connect: { code: OWNER_TYPE.USER } },
      user: { connect: { id: user.id } },
      kind: { connect: { code: kindCode } },
      name: name.slice(0, STUDY_NAME_MAX_LENGTH),
      description: description.length > 0 ? description.slice(0, STUDY_DESCRIPTION_MAX_LENGTH) : null,
      isDefault: false,
    },
  });

  revalidatePath(platformRoutes.studies);
}

/**
 * Importa un PGN con una o varias partidas en un estudio del propio alumno.
 * Cada partida se guarda como una fila Game con sus cabeceras en columnas y el
 * PGN individual reserializado. Nunca escribe en bases de curso.
 */
export async function importPgnGames(studyId: string, formData: FormData): Promise<void> {
  const pgnText = readText(formData, "pgn");
  if (pgnText.length === 0 || pgnText.length > PGN_MAX_LENGTH) return;

  const db = getPlatformDb();
  const user = await getCurrentUser();
  if (!allowAction(`${user.id}:import-pgn`, 10, 60_000)) return;

  const study = await db.gameDatabase.findFirst({ where: { id: studyId, userId: user.id }, select: { id: true } });
  if (!study) return;

  let parsedGames: ReturnType<typeof parsePgn>;
  try {
    parsedGames = parsePgn(pgnText);
  } catch {
    return;
  }

  const games: Prisma.GameCreateInput[] = [];
  for (const parsedGame of parsedGames.slice(0, PGN_MAX_GAMES)) {
    const headers = parsedGame.headers;
    const initialFen = readHeader(headers, "FEN");
    // Sin jugadas ni posición de partida no hay nada que guardar (texto basura).
    if (parsedGame.moves.children.length === 0 && initialFen === null) continue;

    const resultToken = readHeader(headers, "Result") ?? "";
    games.push({
      database: { connect: { id: study.id } },
      white: readHeader(headers, "White") ?? UNKNOWN_PLAYER,
      black: readHeader(headers, "Black") ?? UNKNOWN_PLAYER,
      whiteElo: readEloHeader(headers, "WhiteElo"),
      blackElo: readEloHeader(headers, "BlackElo"),
      result: { connect: { code: GAME_RESULT_BY_PGN_TOKEN[resultToken] ?? GAME_RESULT.ONGOING } },
      playedAt: readDateHeader(headers),
      event: readHeader(headers, "Event"),
      site: readHeader(headers, "Site"),
      round: readHeader(headers, "Round"),
      eco: readHeader(headers, "ECO"),
      initialFen,
      pgn: makePgn(parsedGame),
      source: { connect: { code: GAME_SOURCE.PGN_IMPORT } },
      isOwnGame: false,
    });
  }

  if (games.length === 0) return;

  // createMany no admite connect por code, así que la transacción encadena
  // un create por partida (atómico: o entran todas o no entra ninguna).
  await db.$transaction(games.map((data) => db.game.create({ data })));

  revalidatePath(platformRoutes.studies);
  revalidatePath(platformRoutes.studyDetail(studyId));
}
