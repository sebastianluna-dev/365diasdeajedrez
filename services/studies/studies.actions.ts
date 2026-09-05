"use server";

import { Chess } from "chessops/chess";
import { parseFen } from "chessops/fen";
import { makePgn, parsePgn } from "chessops/pgn";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { OWNER_TYPE } from "@/constants/platform/shared-codes.const";
import {
  DATABASE_KIND,
  GAME_RESULT,
  GAME_RESULT_BY_PGN_TOKEN,
  GAME_SOURCE,
  type DatabaseKindCode,
  type GameResultCode,
} from "@/constants/platform/study-codes.const";
import { PGN_MAX_GAMES, PGN_MAX_LENGTH } from "@/constants/platform/content-limits.const";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getTeacherContext } from "@/lib/platform-auth/roles";
import type { Prisma } from "@/lib/platform-db/generated/client";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { platformRoutes } from "@/lib/platform-routes";
import { allowAction } from "@/lib/rate-limit";
import { emptyGame, serializeGame } from "@/lib/chess/pgn-edit";
import { parsePgnTree } from "@/lib/chess/pgn-tree";
import { indexGamePositions } from "@/services/game-positions/game-positions.service";
import { canChangeKindTo, canCreateKind, studyPermissionsOf } from "./study-rules";

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
 * Crea una base propia («estudio» en la interfaz). El tipo llega como code del
 * catálogo y lo decide `study-rules`, no el desplegable: un alumno crea
 * estudios y torneos, un maestro además colecciones, y «Mis partidas» no la
 * crea nadie a mano porque nace con la cuenta.
 *
 * Se vuelve a preguntar aquí aunque la lista ya venga filtrada: una server
 * action es alcanzable por POST directo con el code que sea.
 */
export async function createStudy(formData: FormData): Promise<void> {
  const name = readText(formData, "name");
  const kindCode = readText(formData, "kindCode");
  if (name.length === 0 || !isDatabaseKindCode(kindCode)) return;

  const description = readText(formData, "description");
  const db = getPlatformDb();
  const user = await getCurrentUser();
  const teacher = await getTeacherContext();
  if (!canCreateKind(kindCode, teacher !== null)) return;
  if (!(await allowAction(`${user.id}:create-study`, 20, 60_000))) return;

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
 * Siguiente posición libre del estudio. Sin esto una partida nueva nacería en 0
 * y se colocaría la primera, que no es donde nadie espera encontrarla.
 */
async function nextGameOrder(db: Prisma.TransactionClient, databaseId: string): Promise<number> {
  const last = await db.game.aggregate({ where: { databaseId }, _max: { order: true } });
  return (last._max.order ?? 0) + 1;
}

/**
 * Copia a un estudio propio partidas vistas en clase.
 *
 * COPIA, no referencia: a partir de aquí son suyas y editarlas no toca la clase
 * original ni la base de quien las trajo. Por eso se duplica el PGN y se vuelve
 * a indexar; el `sourceId` se hereda de la original, que es lo veraz —una copia
 * tiene la misma procedencia que aquello de lo que se copió—.
 *
 * El filtro de origen es el mismo que alimenta «Partidas de mis clases»: sólo
 * se puede copiar de una clase a la que se asistió. Un id de otra parte no
 * pasa el `where` y sale de la lista sin escribir nada.
 */
export async function copyClassGamesToStudy(studyId: string, gameIds: string[]): Promise<void> {
  if (gameIds.length === 0) return;

  const db = getPlatformDb();
  const user = await getCurrentUser();
  if (!(await allowAction(`${user.id}:copy-class-games`, 20, 60_000))) return;

  const study = await db.gameDatabase.findFirst({
    where: { id: studyId, userId: user.id },
    select: { id: true },
  });
  if (!study) return;

  const sources = await db.game.findMany({
    where: {
      id: { in: gameIds.slice(0, PGN_MAX_GAMES) },
      classBlocks: { some: { class: { participants: { some: { userId: user.id } } } } },
    },
    select: {
      title: true,
      white: true,
      black: true,
      whiteElo: true,
      blackElo: true,
      resultId: true,
      playedAt: true,
      event: true,
      site: true,
      round: true,
      eco: true,
      initialFen: true,
      pgn: true,
      sourceId: true,
    },
  });
  if (sources.length === 0) return;

  let order = await nextGameOrder(db, study.id);

  await db.$transaction(async (tx) => {
    for (const source of sources) {
      const game = await tx.game.create({
        data: { ...source, databaseId: study.id, order: order++ },
        select: { id: true },
      });
      await indexGamePositions(tx, { gameId: game.id, databaseId: study.id, pgn: source.pgn });
    }
  });

  revalidatePath(platformRoutes.studies);
  revalidatePath(platformRoutes.studyDetail(studyId));
}

/**
 * Coloca las partidas de un estudio propio en el orden recibido.
 *
 * Se comprueba que los ids sean EXACTAMENTE los del estudio —mismos y todos—
 * antes de escribir nada: un id de otra base colado en la lista escribiría
 * fuera, y una lista incompleta dejaría partidas con el orden viejo mezcladas
 * entre las nuevas. Ante cualquier discrepancia no se toca nada.
 *
 * No devuelve error visible: si la comprobación falla, la vista se revalida y
 * el arrastre se deshace solo al recargar, que es lo que el usuario entiende.
 */
export async function reorderStudyGames(studyId: string, orderedIds: string[]): Promise<void> {
  const db = getPlatformDb();
  const user = await getCurrentUser();
  if (!(await allowAction(`${user.id}:reorder-games`, 60, 60_000))) return;

  const study = await db.gameDatabase.findFirst({
    where: { id: studyId, userId: user.id },
    select: { id: true, games: { select: { id: true } } },
  });
  if (!study) return;

  const actual = new Set(study.games.map((game) => game.id));
  const received = new Set(orderedIds);
  if (received.size !== orderedIds.length) return;
  if (received.size !== actual.size) return;
  for (const id of received) if (!actual.has(id)) return;

  await db.$transaction(
    orderedIds.map((id, index) =>
      db.game.update({ where: { id }, data: { order: index + 1 } }),
    ),
  );

  revalidatePath(platformRoutes.studyDetail(studyId));
}

/**
 * Cambia el nombre, la descripción y el tipo de un estudio propio.
 *
 * El `where` lleva `userId` como todas las escrituras de aquí: ver una base de
 * curso —o una colección que a uno le repartieron— no da derecho a
 * renombrarla.
 *
 * El tipo puede venir vacío: hay estudios que se renombran pero no cambian de
 * tipo («Mis partidas» y las colecciones no pueden). Si viene, tiene que ser un
 * cambio que `study-rules` permita, y si no lo es se ignora el tipo y se guarda
 * el resto en vez de tirar el formulario entero.
 */
export async function updateStudy(studyId: string, formData: FormData): Promise<void> {
  const name = readText(formData, "name");
  const kindCode = readText(formData, "kindCode");
  if (name.length === 0) return;

  const description = readText(formData, "description");
  const db = getPlatformDb();
  const user = await getCurrentUser();
  if (!(await allowAction(`${user.id}:update-study`, 30, 60_000))) return;

  const study = await db.gameDatabase.findFirst({
    where: { id: studyId, userId: user.id },
    select: { id: true, kind: { select: { code: true } } },
  });
  if (!study) return;

  const rule = { kindCode: study.kind.code, isOwner: true };
  if (!studyPermissionsOf(rule).canEdit) return;
  const nextKind = isDatabaseKindCode(kindCode) && canChangeKindTo(rule, kindCode) ? kindCode : null;

  await db.gameDatabase.update({
    where: { id: study.id },
    data: {
      name: name.slice(0, STUDY_NAME_MAX_LENGTH),
      description: description.length > 0 ? description.slice(0, STUDY_DESCRIPTION_MAX_LENGTH) : null,
      ...(nextKind ? { kind: { connect: { code: nextKind } } } : {}),
    },
  });

  revalidatePath(platformRoutes.studies);
  revalidatePath(platformRoutes.studyDetail(study.id));
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
  if (!(await allowAction(`${user.id}:import-pgn`, 10, 60_000))) return;

  const study = await db.gameDatabase.findFirst({ where: { id: studyId, userId: user.id }, select: { id: true } });
  if (!study) return;

  let parsedGames: ReturnType<typeof parsePgn>;
  try {
    parsedGames = parsePgn(pgnText);
  } catch {
    return;
  }

  // Se importan al final del estudio y en el orden en que vienen en el PGN,
  // que es como las escribió quien lo exportó.
  let order = await nextGameOrder(db, study.id);

  const games: Prisma.GameCreateInput[] = [];
  for (const parsedGame of parsedGames.slice(0, PGN_MAX_GAMES)) {
    const headers = parsedGame.headers;
    const initialFen = readHeader(headers, "FEN");
    // Sin jugadas ni posición de partida no hay nada que guardar (texto basura).
    if (parsedGame.moves.children.length === 0 && initialFen === null) continue;

    const resultToken = readHeader(headers, "Result") ?? "";
    games.push({
      database: { connect: { id: study.id } },
      order: order++,
      white: readHeader(headers, "White") ?? UNKNOWN_PLAYER,
      black: readHeader(headers, "Black") ?? UNKNOWN_PLAYER,
      whiteElo: readEloHeader(headers, "WhiteElo"),
      blackElo: readEloHeader(headers, "BlackElo"),
      whiteTitle: readHeader(headers, "WhiteTitle"),
      blackTitle: readHeader(headers, "BlackTitle"),
      // `WhiteTeam` es lo que escriben las retransmisiones de Lichess para la
      // federación; el PGN estándar no tiene cabecera propia para ella.
      whiteCountry: readHeader(headers, "WhiteTeam"),
      blackCountry: readHeader(headers, "BlackTeam"),
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
  //
  // El índice de posiciones se escribe DENTRO de la misma transacción: una
  // partida guardada sin indexar sería invisible para el buscador por posición
  // y nadie se enteraría hasta buscarla.
  await db.$transaction(async (tx) => {
    for (const data of games) {
      const created = await tx.game.create({ data, select: { id: true } });
      await indexGamePositions(tx, { gameId: created.id, databaseId: study.id, pgn: data.pgn });
    }
  });

  revalidatePath(platformRoutes.studies);
  revalidatePath(platformRoutes.studyDetail(studyId));
}

/**
 * Guarda el PGN anotado de una partida, tal y como lo dejó el tablero de
 * análisis.
 *
 * Sólo escribe el DUEÑO de la base. `listReferenceableGames` deja a un profesor
 * VER las partidas de sus alumnos para poder citarlas en clase; sin la
 * condición sobre `userId` esa misma visibilidad le dejaría reescribirlas.
 *
 * Reindexa las posiciones después: el buscador por posición se alimenta de
 * `GamePosition`, y dejarlo con las de la versión anterior encontraría jugadas
 * que ya no están en la partida.
 */
export async function updateGamePgn(studyId: string, gameId: string, formData: FormData): Promise<void> {
  const pgn = readText(formData, "pgn");
  if (pgn.length === 0 || pgn.length > PGN_MAX_LENGTH) return;

  const db = getPlatformDb();
  const user = await getCurrentUser();
  if (!(await allowAction(`${user.id}:game-pgn`, 60, 60_000))) return;

  // La previsualización del editor es una comodidad; quien decide es el
  // servidor, que vuelve a parsear antes de escribir.
  if (parsePgnTree(pgn) === null) return;

  const game = await db.game.findFirst({
    where: { id: gameId, databaseId: studyId, database: { userId: user.id } },
    select: { id: true },
  });
  if (!game) return;

  await db.$transaction(async (tx) => {
    await tx.game.update({ where: { id: game.id }, data: { pgn } });
    await indexGamePositions(tx, { gameId: game.id, databaseId: studyId, pgn });
  });

  revalidatePath(platformRoutes.gameDetail(studyId, gameId));
  revalidatePath(platformRoutes.studyDetail(studyId));
}

// --- Partidas creadas a mano -----------------------------------------------
//
// El otro camino para meter una partida en un estudio, además de pegar un PGN:
// crearla vacía y construirla sobre el tablero. Todo el formulario es opcional,
// porque cuando se empieza a analizar todavía no se sabe qué partida va a ser.

const GAME_FIELD_MAX_LENGTH = 120;
/** Rango de Elo que se acepta; fuera de él es una errata, no un dato. */
const ELO_MIN = 100;
const ELO_MAX = 4000;
/** El formulario usa <input type="date">, que envía ISO. */
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

function readOptionalField(formData: FormData, field: string): string | null {
  const value = readText(formData, field);
  return value.length > 0 ? value.slice(0, GAME_FIELD_MAX_LENGTH) : null;
}

function readElo(formData: FormData, field: string): number | null {
  const value = readText(formData, field);
  if (!/^\d+$/.test(value)) return null;
  const elo = Number.parseInt(value, 10);
  return elo >= ELO_MIN && elo <= ELO_MAX ? elo : null;
}

/** Fecha del formulario (ISO). Una fecha imposible se descarta, no se corrige. */
function readIsoDate(formData: FormData, field: string): Date | null {
  const match = ISO_DATE.exec(readText(formData, field));
  if (!match) return null;

  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  const isRealDate = date.getUTCMonth() === Number(month) - 1 && date.getUTCDate() === Number(day);
  return isRealDate ? date : null;
}

/**
 * ¿El FEN describe una posición que puede existir sobre un tablero?
 *
 * `parseFen` a secas no vale: acepta «8/8/8/8/8/8/8/8», un tablero sin reyes.
 * Guardar eso daría una partida que revienta al abrirla.
 */
function isLegalFen(fen: string): boolean {
  const setup = parseFen(fen);
  return setup.isOk && Chess.fromSetup(setup.value).isOk;
}

function isGameResultCode(value: string): value is GameResultCode {
  return (Object.values(GAME_RESULT) as string[]).includes(value);
}

/** El estudio, sólo si es del usuario. Los de curso tienen `userId` nulo. */
async function ownedStudy(studyId: string, userId: string): Promise<{ id: string } | null> {
  return getPlatformDb().gameDatabase.findFirst({
    where: { id: studyId, userId },
    select: { id: true },
  });
}

/**
 * Crea una partida en un estudio propio, con o sin PGN.
 *
 * Todos los campos son opcionales: enviar el formulario vacío da una partida en
 * blanco lista para analizar. Si se pega un PGN, sus cabeceras rellenan los
 * huecos que la persona haya dejado — lo que ella escriba siempre manda.
 *
 * Termina redirigiendo a la partida recién creada, que es donde se analiza:
 * se juega sobre el tablero y se anota desde la lista de jugadas.
 */
export async function createStudyGame(studyId: string, formData: FormData): Promise<void> {
  const db = getPlatformDb();
  const user = await getCurrentUser();
  if (!(await allowAction(`${user.id}:create-game`, 30, 60_000))) return;

  const study = await ownedStudy(studyId, user.id);
  if (!study) return;

  const pgnText = readText(formData, "pgn");
  if (pgnText.length > PGN_MAX_LENGTH) return;

  // El PGN pegado es una FUENTE de datos, no una orden: si no se entiende, se
  // descarta y la partida se crea en blanco en vez de perder lo tecleado.
  let parsed: ReturnType<typeof parsePgn>[number] | undefined;
  if (pgnText.length > 0) {
    try {
      parsed = parsePgn(pgnText)[0];
    } catch {
      parsed = undefined;
    }
  }
  const headers = parsed?.headers ?? new Map<string, string>();

  const initialFen = readOptionalField(formData, "initialFen") ?? readHeader(headers, "FEN");
  // Un FEN malo sí se dice: es lo único que la persona puede haber escrito mal
  // y no notar, porque el resto de campos son texto libre.
  if (initialFen !== null && !isLegalFen(initialFen)) {
    redirect(`${platformRoutes.newStudyGame(studyId)}?error=fen`);
  }

  const pgn = parsed ? makePgn(parsed) : serializeGame(emptyGame(initialFen ?? undefined));

  const resultCode = readText(formData, "resultCode");
  const result = isGameResultCode(resultCode)
    ? resultCode
    : (GAME_RESULT_BY_PGN_TOKEN[readHeader(headers, "Result") ?? ""] ?? GAME_RESULT.ONGOING);

  // Sin nombre propio se numera por lo que ya hay en el estudio. No pretende ser
  // un contador exacto —dos creaciones a la vez podrían repetir «Capítulo 3»—,
  // y no pasa nada: es una etiqueta que se puede cambiar, no una clave.
  const explicitTitle = readOptionalField(formData, "title");
  const title = explicitTitle ?? `Capítulo ${(await db.game.count({ where: { databaseId: studyId } })) + 1}`;

  const created = await db.$transaction(async (tx) => {
    const game = await tx.game.create({
      data: {
        database: { connect: { id: studyId } },
        order: await nextGameOrder(tx, studyId),
        title,
        white: readOptionalField(formData, "white") ?? readHeader(headers, "White") ?? UNKNOWN_PLAYER,
        black: readOptionalField(formData, "black") ?? readHeader(headers, "Black") ?? UNKNOWN_PLAYER,
        whiteElo: readElo(formData, "whiteElo") ?? readEloHeader(headers, "WhiteElo"),
        blackElo: readElo(formData, "blackElo") ?? readEloHeader(headers, "BlackElo"),
        whiteTitle: readOptionalField(formData, "whiteTitle") ?? readHeader(headers, "WhiteTitle"),
        blackTitle: readOptionalField(formData, "blackTitle") ?? readHeader(headers, "BlackTitle"),
        whiteCountry: readOptionalField(formData, "whiteCountry") ?? readHeader(headers, "WhiteTeam"),
        blackCountry: readOptionalField(formData, "blackCountry") ?? readHeader(headers, "BlackTeam"),
        result: { connect: { code: result } },
        playedAt: readIsoDate(formData, "playedAt") ?? readDateHeader(headers),
        event: readOptionalField(formData, "event") ?? readHeader(headers, "Event"),
        site: readOptionalField(formData, "site") ?? readHeader(headers, "Site"),
        round: readOptionalField(formData, "round") ?? readHeader(headers, "Round"),
        eco: readOptionalField(formData, "eco") ?? readHeader(headers, "ECO"),
        initialFen,
        pgn,
        source: { connect: { code: GAME_SOURCE.MANUAL } },
        isOwnGame: false,
      },
      select: { id: true },
    });
    await indexGamePositions(tx, { gameId: game.id, databaseId: studyId, pgn });
    return game;
  });

  revalidatePath(platformRoutes.studies);
  revalidatePath(platformRoutes.studyDetail(studyId));
  redirect(platformRoutes.gameDetail(studyId, created.id));
}

/**
 * Lee un campo SÓLO si el formulario lo trae.
 *
 * `readOptionalField` devuelve null tanto cuando el campo llega vacío como
 * cuando no llega, y para un formulario que reescribe la ficha entera eso no es
 * lo mismo: vacío significa «bórralo», ausente significa «no lo toques». Sin
 * esta distinción, un formulario al que le falte un campo borra ese dato al
 * guardar — que es exactamente como se perdieron la federación y el título de
 * una partida al añadirlos a la acción antes que al formulario.
 */
function readFieldIfPresent(formData: FormData, field: string): string | null | undefined {
  return formData.has(field) ? readOptionalField(formData, field) : undefined;
}

/** Cabecera del PGN: se escribe el valor, se quita si es null, se deja si es undefined. */
function setHeader(headers: Map<string, string>, key: string, value: string | null | undefined): void {
  if (value === undefined) return;
  if (value === null || value.length === 0) headers.delete(key);
  else headers.set(key, value);
}

/** Fecha en el formato del PGN («2024.03.17»). */
function pgnDate(date: Date | null): string | null {
  if (!date) return null;
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${date.getUTCFullYear()}.${month}.${day}`;
}

/**
 * Edita la ficha de la partida: jugadores, Elos, evento, fecha, resultado…
 *
 * Reescribe TAMBIÉN las cabeceras del PGN. Si no, un PGN exportado diría una
 * cosa y la ficha otra sobre la misma partida, y no habría forma de saber cuál
 * de las dos es la buena. Las jugadas y la posición de partida no se tocan:
 * esto sólo cambia quién jugó y dónde.
 */
export async function updateGameDetails(studyId: string, gameId: string, formData: FormData): Promise<void> {
  const db = getPlatformDb();
  const user = await getCurrentUser();
  if (!(await allowAction(`${user.id}:game-details`, 60, 60_000))) return;

  const game = await db.game.findFirst({
    where: { id: gameId, databaseId: studyId, database: { userId: user.id } },
    select: { id: true, pgn: true },
  });
  if (!game) return;

  const resultCode = readText(formData, "resultCode");
  const result = isGameResultCode(resultCode) ? resultCode : GAME_RESULT.ONGOING;
  const white = readOptionalField(formData, "white") ?? UNKNOWN_PLAYER;
  const black = readOptionalField(formData, "black") ?? UNKNOWN_PLAYER;
  const whiteElo = readElo(formData, "whiteElo");
  const blackElo = readElo(formData, "blackElo");
  const playedAt = readIsoDate(formData, "playedAt");
  const event = readOptionalField(formData, "event");
  const site = readOptionalField(formData, "site");
  const round = readOptionalField(formData, "round");
  const eco = readOptionalField(formData, "eco");
  const whiteTitle = readFieldIfPresent(formData, "whiteTitle");
  const blackTitle = readFieldIfPresent(formData, "blackTitle");
  const whiteCountry = readFieldIfPresent(formData, "whiteCountry");
  const blackCountry = readFieldIfPresent(formData, "blackCountry");

  // El token del resultado vive en el label del catálogo («1-0», «*»…), que es
  // justo lo que el PGN espera en su cabecera Result.
  const resultRow = await db.gameResult.findUnique({ where: { code: result }, select: { label: true } });

  let pgn = game.pgn;
  const parsed = parsePgnTree(pgn) === null ? null : parsePgn(pgn)[0];
  if (parsed) {
    setHeader(parsed.headers, "White", white);
    setHeader(parsed.headers, "Black", black);
    setHeader(parsed.headers, "WhiteElo", whiteElo === null ? null : String(whiteElo));
    setHeader(parsed.headers, "BlackElo", blackElo === null ? null : String(blackElo));
    setHeader(parsed.headers, "Event", event);
    setHeader(parsed.headers, "Site", site);
    setHeader(parsed.headers, "Round", round);
    setHeader(parsed.headers, "ECO", eco);
    setHeader(parsed.headers, "Date", pgnDate(playedAt));
    setHeader(parsed.headers, "Result", resultRow?.label ?? "*");
    setHeader(parsed.headers, "WhiteTitle", whiteTitle);
    setHeader(parsed.headers, "BlackTitle", blackTitle);
    // La federación viaja en `WhiteTeam`/`BlackTeam`, que es la cabecera que
    // usan las retransmisiones: el PGN estándar no tiene una para el país.
    setHeader(parsed.headers, "WhiteTeam", whiteCountry);
    setHeader(parsed.headers, "BlackTeam", blackCountry);
    pgn = makePgn(parsed);
  }

  await db.game.update({
    where: { id: game.id },
    data: {
      title: readOptionalField(formData, "title"),
      white,
      black,
      whiteElo,
      blackElo,
      whiteTitle,
      blackTitle,
      whiteCountry,
      blackCountry,
      result: { connect: { code: result } },
      playedAt,
      event,
      site,
      round,
      eco,
      pgn,
    },
  });

  revalidatePath(platformRoutes.studyDetail(studyId));
  revalidatePath(platformRoutes.gameDetail(studyId, gameId));
}

export interface AutosaveResult {
  ok: boolean;
  /** Por qué no se guardó, para poder decirlo en pantalla. */
  reason?: "invalid" | "denied" | "throttled";
}

/**
 * Igual que `updateGamePgn` pero informando de lo ocurrido.
 *
 * El autoguardado no puede fallar en silencio: quien está analizando tiene que
 * enterarse de que su trabajo NO está a salvo, y por eso esta variante devuelve
 * el motivo en vez de salir sin más.
 */
export async function autosaveGamePgn(studyId: string, gameId: string, pgn: string): Promise<AutosaveResult> {
  if (pgn.length === 0 || pgn.length > PGN_MAX_LENGTH) return { ok: false, reason: "invalid" };

  const db = getPlatformDb();
  const user = await getCurrentUser();
  if (!(await allowAction(`${user.id}:game-autosave`, 240, 60_000))) return { ok: false, reason: "throttled" };
  if (parsePgnTree(pgn) === null) return { ok: false, reason: "invalid" };

  const game = await db.game.findFirst({
    where: { id: gameId, databaseId: studyId, database: { userId: user.id } },
    select: { id: true },
  });
  if (!game) return { ok: false, reason: "denied" };

  await db.$transaction(async (tx) => {
    await tx.game.update({ where: { id: game.id }, data: { pgn } });
    await indexGamePositions(tx, { gameId: game.id, databaseId: studyId, pgn });
  });

  // Sólo el listado del estudio: la página de la partida es AHORA la que se
  // está editando —ahí se anota, ya no hay pantalla aparte— y revalidarla en
  // cada autoguardado la recargaría bajo los pies de quien escribe. Se sirve
  // por sesión, así que al volver a ella se lee de la base de datos igual.
  revalidatePath(platformRoutes.studyDetail(studyId));
  return { ok: true };
}

/**
 * Borra una partida de un estudio propio.
 *
 * `ClassBlock.gameId` es `onDelete: SetNull`, así que borrar no rompe ninguna
 * clase: el bloque se queda sin referencia y el mapper ya lo omite. Pero eso
 * hace desaparecer contenido de una clase sin que nadie se entere, así que si
 * la partida está citada se exige una confirmación explícita.
 */
export async function deleteStudyGame(studyId: string, gameId: string, formData: FormData): Promise<void> {
  const db = getPlatformDb();
  const user = await getCurrentUser();
  const gamePath = platformRoutes.gameDetail(studyId, gameId);
  if (!(await allowAction(`${user.id}:delete-game`, 30, 60_000))) return;

  const game = await db.game.findFirst({
    where: { id: gameId, databaseId: studyId, database: { userId: user.id } },
    select: { id: true, _count: { select: { classBlocks: true } } },
  });
  if (!game) return;

  if (game._count.classBlocks > 0 && readText(formData, "confirmClassBlocks") !== "yes") {
    redirect(`${gamePath}?error=gameInClasses`);
  }

  // GamePosition es `onDelete: Cascade`: el índice por posición se limpia solo.
  await db.game.delete({ where: { id: game.id } });

  revalidatePath(platformRoutes.studies);
  revalidatePath(platformRoutes.studyDetail(studyId));
  redirect(platformRoutes.studyDetail(studyId));
}

/**
 * Borra un estudio propio con todo lo que contiene.
 *
 * Las partidas y su índice por posición caen en cascada (`Game.databaseId` y
 * `GamePosition.databaseId` son `onDelete: Cascade`), así que esto se lleva por
 * delante bastante más que una fila. Por eso, si el estudio tiene partidas o
 * alguna está citada en una clase, hace falta confirmarlo explícitamente.
 *
 * Los estudios de curso no se tocan nunca: tienen `userId` nulo y la condición
 * de propiedad ya los deja fuera.
 */
export async function deleteStudy(studyId: string, formData: FormData): Promise<void> {
  const db = getPlatformDb();
  const user = await getCurrentUser();
  const studyPath = platformRoutes.studyDetail(studyId);
  if (!(await allowAction(`${user.id}:delete-study`, 20, 60_000))) return;

  const study = await db.gameDatabase.findFirst({
    where: { id: studyId, userId: user.id },
    select: { id: true, kind: { select: { code: true } }, _count: { select: { games: true } } },
  });
  if (!study) return;

  // «Mis partidas» se crea con la cuenta y es única, así que no se borra. Que
  // el botón no salga en la tarjeta no basta: una server action es alcanzable
  // por POST directo.
  if (!studyPermissionsOf({ kindCode: study.kind.code, isOwner: true }).canDelete) return;

  const citedGames = await db.classBlock.count({ where: { game: { databaseId: studyId } } });

  if ((study._count.games > 0 || citedGames > 0) && readText(formData, "confirmDelete") !== "yes") {
    redirect(`${studyPath}?error=confirmStudyDelete`);
  }

  await db.gameDatabase.delete({ where: { id: study.id } });

  revalidatePath(platformRoutes.studies);
  redirect(platformRoutes.studies);
}

// --- Reparto de colecciones -------------------------------------------------
//
// Una colección es de su dueño —un maestro— y le LLEGA al alumno por una fila
// de StudyShare. El reparto sólo da lectura, y eso no lo impone la tabla sino
// la propiedad: todas las escrituras de este archivo llevan `userId: user.id`
// en el `where`, así que un alumno con una colección repartida no pasa ninguna.
//
// Tres condiciones para repartir, y las tres se comprueban contra la base de
// datos porque el id del alumno llega del cliente:
//
//  1. quien reparte es un profesor ACTIVO;
//  2. la colección es suya y es una colección (un estudio personal no se
//     reparte: para eso se hace una colección con las partidas que toquen);
//  3. el alumno tiene asignación activa con él, el mismo criterio que el resto
//     del panel del profesor.

/** La colección de un profesor activo, o null si falla cualquiera de las dos. */
async function ownedCollection(
  studyId: string,
): Promise<{ study: { id: string }; teacherId: string } | null> {
  const teacher = await getTeacherContext();
  if (!teacher) return null;

  const study = await getPlatformDb().gameDatabase.findFirst({
    where: { id: studyId, userId: teacher.user.id, kind: { code: DATABASE_KIND.COLLECTION } },
    select: { id: true },
  });
  return study ? { study, teacherId: teacher.teacher.id } : null;
}

/** Reparte una colección a un alumno del profesor. */
export async function shareStudyWithStudent(studyId: string, formData: FormData): Promise<void> {
  const studentId = readText(formData, "studentId");
  if (studentId.length === 0) return;

  const owned = await ownedCollection(studyId);
  if (!owned) return;

  const db = getPlatformDb();
  if (!(await allowAction(`${owned.teacherId}:share-study`, 60, 60_000))) return;

  const assignment = await db.teacherStudent.findFirst({
    where: { teacherId: owned.teacherId, studentId, endedAt: null },
    select: { id: true },
  });
  if (!assignment) return;

  // Repartirla dos veces al mismo alumno no es un error que merezca ruido: el
  // resultado buscado —que la tenga— ya se cumple. El índice único de
  // (colección, alumno) es lo que lo garantiza; esto sólo evita el estallido.
  await db.studyShare.upsert({
    where: { databaseId_userId: { databaseId: owned.study.id, userId: studentId } },
    update: {},
    create: { databaseId: owned.study.id, userId: studentId, teacherId: owned.teacherId },
  });

  revalidatePath(platformRoutes.studyDetail(owned.study.id));
}

/**
 * Quita el reparto. No borra nada del material: la colección sigue entera en la
 * base del maestro, el alumno simplemente deja de verla.
 */
export async function unshareStudyWithStudent(studyId: string, formData: FormData): Promise<void> {
  const studentId = readText(formData, "studentId");
  if (studentId.length === 0) return;

  const owned = await ownedCollection(studyId);
  if (!owned) return;

  const db = getPlatformDb();
  if (!(await allowAction(`${owned.teacherId}:share-study`, 60, 60_000))) return;

  await db.studyShare.deleteMany({ where: { databaseId: owned.study.id, userId: studentId } });

  revalidatePath(platformRoutes.studyDetail(owned.study.id));
}
