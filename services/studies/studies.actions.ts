"use server";

import { Chess } from "chessops/chess";
import { parseFen } from "chessops/fen";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { BOARD_ORIENTATION, OWNER_TYPE } from "@/constants/platform/shared-codes.const";
import {
  DATABASE_KIND,
  GAME_ANALYSIS_MODE,
  GAME_RESULT,
  GAME_SOURCE,
  type DatabaseKindCode,
  type GameAnalysisModeCode,
} from "@/constants/platform/study-codes.const";
import { PGN_IMPORT_TRANSACTION, PGN_MAX_GAMES, PGN_MAX_LENGTH } from "@/constants/platform/content-limits.const";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getTeacherContext } from "@/lib/platform-auth/roles";
import type { Prisma } from "@/lib/platform-db/generated/client";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { platformRoutes } from "@/lib/platform-routes";
import { allowAction } from "@/lib/rate-limit";
import { clearAnnotations, clearVariations, emptyGame, parseEditableGame, serializeGame } from "@/lib/chess/pgn-edit";
import { parsePgnTree } from "@/lib/chess/pgn-tree";
import { indexGamePositions } from "@/services/game-positions/game-positions.service";
import { getVisibleDatabasesWhere } from "@/services/shared/game-visibility";
import { z } from "zod";
import { formOptionalText, formText, parseForm, readIds } from "@/services/shared/form-schema";
import {
  GAME_FIELD_MAX_LENGTH,
  GAME_FIELDS_SCHEMA,
  isGameResultCode,
  resultCodeOf,
  UNKNOWN_PLAYER,
  writeGameRecord,
  type AutosaveResult,
} from "@/services/shared/game-record";
import { readImportedGames, readPastedGame } from "@/services/shared/pgn-import";
import { withImportReport } from "@/services/shared/pgn-import-report";
import { withErrorParam } from "@/services/shared/safe-return-to";
import { studyDetailInclude } from "./studies.mapper";
import { canChangeKindTo, canCreateKind, studyPermissionsOf } from "./study-rules";

// Server actions are reachable by direct POST: the user is ALWAYS resolved in
// here (DAL) and the ownership of the database is checked against the database
// before writing. Empty or rubbish inputs come out without throwing; the ones a
// person can produce from the interface (a throttle, an empty PGN) go back with
// `?error=<code>` so the page can say so, and the ones only a forged request
// produces (a foreign study, a kind the viewer may not create) go out silently.

const STUDY_SCHEMA = z.object({
  name: formText(120),
  kindCode: z.string().trim().max(32).optional(),
  description: formOptionalText(500),
});
const IMPORT_SCHEMA = z.object({ pgn: z.string().trim().min(1).max(PGN_MAX_LENGTH) });

function isDatabaseKindCode(value: string): value is DatabaseKindCode {
  return (Object.values(DATABASE_KIND) as string[]).includes(value);
}

/**
 * Creates an own database ("estudio" in the interface). The kind arrives as a
 * catalog code and `study-rules` decides it, not the dropdown: a student creates
 * studies and tournaments, a teacher additionally collections, and "Mis
 * partidas" is created by hand by nobody because it is born with the account.
 *
 * It is asked again here even though the list already comes filtered: a server
 * action is reachable by direct POST with whatever code.
 */
export async function createStudy(formData: FormData): Promise<void> {
  const form = parseForm(STUDY_SCHEMA, formData);
  const kindCode = form.ok ? (form.data.kindCode ?? "") : "";
  if (!form.ok || !isDatabaseKindCode(kindCode)) redirect(withErrorParam(platformRoutes.studies, "invalid"));

  const { name, description } = form.data;
  const db = getPlatformDb();
  const user = await getCurrentUser();
  const teacher = await getTeacherContext();
  if (!canCreateKind(kindCode, teacher !== null)) return;
  if (!(await allowAction(`${user.id}:create-study`, 20, 60_000)))
    redirect(withErrorParam(platformRoutes.studies, "throttled"));

  await db.gameDatabase.create({
    data: {
      ownerType: { connect: { code: OWNER_TYPE.USER } },
      user: { connect: { id: user.id } },
      kind: { connect: { code: kindCode } },
      name,
      description,
      isDefault: false,
    },
  });

  revalidatePath(platformRoutes.studies);
}

/**
 * Next free position of the study. Without this a new game would be born at 0
 * and placed first, which is not where anyone expects to find it.
 */
async function nextGameOrder(db: Prisma.TransactionClient, databaseId: string): Promise<number> {
  const last = await db.game.aggregate({ where: { databaseId }, _max: { order: true } });
  return (last._max.order ?? 0) + 1;
}

/**
 * Copies games seen in class into an own study.
 *
 * A COPY, not a reference: from here on they are theirs and editing them does
 * not touch the original class nor the database of whoever brought them. That is
 * why the PGN is duplicated and reindexed; the `sourceId` is inherited from the
 * original, which is the truthful thing — a copy has the same provenance as what
 * it was copied from.
 *
 * The origin filter is the same one that feeds "Partidas de mis clases": one can
 * only copy from a class one attended. An id from elsewhere does not pass the
 * `where` and drops out of the list without writing anything.
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
  }, PGN_IMPORT_TRANSACTION);

  revalidatePath(platformRoutes.studies);
  revalidatePath(platformRoutes.studyDetail(studyId));
}

/**
 * Places the games of an own study in the order received.
 *
 * It is checked that the ids are EXACTLY the study's — the same ones and all of
 * them — before writing anything: an id from another database slipped into the
 * list would write outside, and an incomplete list would leave games with the
 * old order mixed among the new ones. On any discrepancy nothing is touched.
 *
 * It returns no visible error: if the check fails, the view is revalidated and
 * the drag undoes itself on reload, which is what the user understands.
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

  await db.$transaction(orderedIds.map((id, index) => db.game.update({ where: { id }, data: { order: index + 1 } })));

  // The list lives beside the board on every game's page, so each of them
  // is stale now, not only the study's; as the chapter collection does.
  revalidatePath(platformRoutes.studyDetail(studyId));
  for (const id of orderedIds) revalidatePath(platformRoutes.gameDetail(studyId, id));
}

/**
 * Changes the name, the description and the kind of an own study.
 *
 * The `where` carries `userId` like every write here: seeing a course database
 * — or a collection someone shared with you — does not give the right to rename it.
 *
 * The kind can come empty: there are studies that get renamed but do not change
 * kind ("Mis partidas" and collections cannot). If it comes, it has to be a
 * change `study-rules` allows, and if it is not, the kind is ignored and the
 * rest is saved instead of throwing away the whole form.
 */
export async function updateStudy(studyId: string, formData: FormData): Promise<void> {
  const form = parseForm(STUDY_SCHEMA, formData);
  if (!form.ok) redirect(withErrorParam(platformRoutes.studyDetail(studyId), "invalid"));
  const { name, description } = form.data;
  const kindCode = form.data.kindCode ?? "";

  const db = getPlatformDb();
  const user = await getCurrentUser();
  if (!(await allowAction(`${user.id}:update-study`, 30, 60_000))) {
    redirect(withErrorParam(platformRoutes.studyDetail(studyId), "throttled"));
  }

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
      name,
      description,
      ...(nextKind ? { kind: { connect: { code: nextKind } } } : {}),
    },
  });

  revalidatePath(platformRoutes.studies);
  revalidatePath(platformRoutes.studyDetail(study.id));
}

/**
 * Imports a PGN with one or several games into a study of the student's own.
 * Each game is stored as a Game row with its headers in columns and the
 * individual PGN reserialised. It never writes into course databases.
 */
export async function importPgnGames(studyId: string, formData: FormData): Promise<void> {
  const back = platformRoutes.studyDetail(studyId);
  const form = parseForm(IMPORT_SCHEMA, formData);
  if (!form.ok) redirect(withErrorParam(back, form.code === "too_big" ? "pgnTooLong" : "pgnEmpty"));
  const pgnText = form.data.pgn;

  const db = getPlatformDb();
  const user = await getCurrentUser();
  if (!(await allowAction(`${user.id}:import-pgn`, 10, 60_000))) redirect(withErrorParam(back, "throttled"));

  const study = await db.gameDatabase.findFirst({ where: { id: studyId, userId: user.id }, select: { id: true } });
  if (!study) return;

  // The PGN is read in services/shared/pgn-import, which is the same reader a
  // course's game collection uses: two readers would end up with two different
  // criteria about what a valid date is or when an Elo is an Elo.
  const reading = readImportedGames(pgnText);
  const imported = reading.games;

  // They are imported at the end of the study and in the order they come in the
  // PGN, which is how whoever exported it wrote them.
  let order = await nextGameOrder(db, study.id);

  const games: Prisma.GameCreateInput[] = imported.map((game) => ({
    database: { connect: { id: study.id } },
    order: order++,
    white: game.white,
    black: game.black,
    whiteElo: game.whiteElo,
    blackElo: game.blackElo,
    whiteTitle: game.whiteTitle,
    blackTitle: game.blackTitle,
    whiteCountry: game.whiteCountry,
    blackCountry: game.blackCountry,
    result: { connect: { code: game.resultCode } },
    playedAt: game.playedAt,
    event: game.event,
    site: game.site,
    round: game.round,
    eco: game.eco,
    initialFen: game.initialFen,
    pgn: game.pgn,
    source: { connect: { code: GAME_SOURCE.PGN_IMPORT } },
    isOwnGame: false,
  }));

  if (games.length === 0) redirect(withErrorParam(back, "pgnEmpty"));

  // createMany does not admit connect by code, so the transaction chains one
  // create per game (atomic: either they all go in or none does).
  //
  // The position index is written WITHIN the same transaction: a game stored
  // without indexing would be invisible to the position search and nobody would
  // find out until they looked for it.
  const firstImportedId = await db.$transaction(async (tx) => {
    let first: string | undefined;
    for (const data of games) {
      const created = await tx.game.create({ data, select: { id: true } });
      first ??= created.id;
      await indexGamePositions(tx, { gameId: created.id, databaseId: study.id, pgn: data.pgn });
    }
    return first;
  }, PGN_IMPORT_TRANSACTION);

  revalidatePath(platformRoutes.studies);
  revalidatePath(platformRoutes.studyDetail(studyId));

  // On to the first game that went in, like a game created by hand, with what
  // happened: how many went in, and how many were left out and why. The games
  // go at the end of the study, so its own URL — which opens the first game —
  // would leave the notice over a game that has nothing to do with it, and the
  // imported ones a page or two away in the aside. The redirect also takes the
  // place of an `?error=` left in the address by an earlier attempt.
  redirect(
    withImportReport(firstImportedId ? platformRoutes.gameDetail(studyId, firstImportedId) : back, {
      imported: games.length,
      skippedEmpty: reading.skippedEmpty,
      overLimit: reading.overLimit,
    }),
  );
}

// --- Games created by hand -------------------------------------------------
//
// The other route to put a game into a study, besides pasting a PGN: creating it
// empty and building it on the board. The whole form is optional, because when
// analysis starts one does not yet know which game it is going to be.

const NEW_GAME_SCHEMA = GAME_FIELDS_SCHEMA.extend({
  pgn: z.string().trim().max(PGN_MAX_LENGTH).optional(),
  initialFen: formOptionalText(GAME_FIELD_MAX_LENGTH),
});

/**
 * Does the FEN describe a position that can exist on a board?
 *
 * Plain `parseFen` is no good: it accepts "8/8/8/8/8/8/8/8", a board without
 * kings. Storing that would give a game that blows up when opened.
 */
function isLegalFen(fen: string): boolean {
  const setup = parseFen(fen);
  return setup.isOk && Chess.fromSetup(setup.value).isOk;
}

/** The study, only if it is the user's. The course ones have a null `userId`. */
async function ownedStudy(studyId: string, userId: string): Promise<{ id: string } | null> {
  return getPlatformDb().gameDatabase.findFirst({
    where: { id: studyId, userId },
    select: { id: true },
  });
}

/**
 * Creates a game in an own study, with or without a PGN.
 *
 * Every field is optional: submitting the empty form gives a blank game ready to
 * analyse. If a PGN is pasted, its headers fill in the gaps the person left —
 * what they write always rules.
 *
 * It ends by redirecting to the freshly created game, which is where it is
 * analysed: it is played on the board and annotated from the move list.
 */
export async function createStudyGame(studyId: string, formData: FormData): Promise<void> {
  // A failure goes back to the study page, where the dialog that posted it lives.
  const back = platformRoutes.studyDetail(studyId);

  const db = getPlatformDb();
  const user = await getCurrentUser();
  if (!(await allowAction(`${user.id}:create-game`, 30, 60_000))) redirect(withErrorParam(back, "throttled"));

  const study = await ownedStudy(studyId, user.id);
  if (!study) return;

  const form = parseForm(NEW_GAME_SCHEMA, formData);
  if (!form.ok) redirect(withErrorParam(back, form.field === "pgn" ? "pgnTooLong" : "invalid"));
  const fields = form.data;
  const pgnText = fields.pgn ?? "";

  // The pasted PGN is a SOURCE of data, not an order: if it holds no game, it is
  // discarded and the game is created blank instead of losing what was typed.
  // It is read by services/shared/pgn-import, the same reader as an import, so
  // a date or an Elo means the same here as there.
  const pasted = pgnText.length > 0 ? readPastedGame(pgnText) : null;

  const initialFen = fields.initialFen ?? pasted?.initialFen ?? null;
  // A bad FEN is reported: it is the only thing the person may have written wrong
  // without noticing, because the rest of the fields are free text.
  if (initialFen !== null && !isLegalFen(initialFen)) redirect(withErrorParam(back, "fen"));

  const pgn = pasted?.pgn ?? serializeGame(emptyGame(initialFen ?? undefined));

  const resultCode = fields.resultCode ?? "";
  const result = isGameResultCode(resultCode) ? resultCode : (pasted?.resultCode ?? GAME_RESULT.ONGOING);

  // Without a name of its own it is numbered by what is already in the study. It
  // does not claim to be an exact counter — two simultaneous creations could
  // repeat "Capítulo 3" — and that is fine: it is a label that can be changed,
  // not a key.
  const explicitTitle = fields.title;
  const title = explicitTitle ?? `Capítulo ${(await db.game.count({ where: { databaseId: studyId } })) + 1}`;

  const created = await db.$transaction(async (tx) => {
    const game = await tx.game.create({
      data: {
        database: { connect: { id: studyId } },
        order: await nextGameOrder(tx, studyId),
        title,
        white: fields.white ?? pasted?.white ?? UNKNOWN_PLAYER,
        black: fields.black ?? pasted?.black ?? UNKNOWN_PLAYER,
        whiteElo: fields.whiteElo ?? pasted?.whiteElo ?? null,
        blackElo: fields.blackElo ?? pasted?.blackElo ?? null,
        whiteTitle: fields.whiteTitle ?? pasted?.whiteTitle ?? null,
        blackTitle: fields.blackTitle ?? pasted?.blackTitle ?? null,
        whiteCountry: fields.whiteCountry ?? pasted?.whiteCountry ?? null,
        blackCountry: fields.blackCountry ?? pasted?.blackCountry ?? null,
        result: { connect: { code: result } },
        playedAt: fields.playedAt ?? pasted?.playedAt ?? null,
        event: fields.event ?? pasted?.event ?? null,
        site: fields.site ?? pasted?.site ?? null,
        round: fields.round ?? pasted?.round ?? null,
        eco: fields.eco ?? pasted?.eco ?? null,
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

// Four of the record's fields keep "absent" apart from "empty" (`formTextIfPresent`):
// empty means "delete it", absent means "do not touch it". Without that
// distinction, a form missing a field erases that data on save — which is
// exactly how a game's federation and title were lost when they were added to
// the action before the form.

/**
 * Edits the game's record: players, Elos, event, date, result…
 *
 * It rewrites the PGN's headers TOO. Otherwise an exported PGN would say one
 * thing and the record another about the same game, and there would be no way to
 * know which of the two is the good one. The moves and the starting position are
 * not touched: this only changes who played and where.
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

  const form = parseForm(GAME_FIELDS_SCHEMA, formData);
  if (!form.ok) redirect(withErrorParam(platformRoutes.gameDetail(studyId, gameId), "invalid"));
  const result = resultCodeOf(form.data);

  // The result's token lives in the catalog's label ("1-0", "*"…), which is
  // exactly what the PGN expects in its Result header.
  const resultRow = await db.gameResult.findUnique({ where: { code: result }, select: { label: true } });
  const { columns } = writeGameRecord(form.data, game.pgn, resultRow?.label ?? "*");

  await db.game.update({
    where: { id: game.id },
    data: { ...columns, result: { connect: { code: result } } },
  });

  revalidatePath(platformRoutes.studyDetail(studyId));
  revalidatePath(platformRoutes.gameDetail(studyId, gameId));
}

/** How long a pinned comment may be: a note heading the notation, not a text. */
const PINNED_COMMENT_MAX_LENGTH = 1000;

const GAME_SETTINGS_SCHEMA = z.object({
  title: formOptionalText(GAME_FIELD_MAX_LENGTH),
  orientationCode: z.string().trim().max(32).optional(),
  analysisModeCode: z.string().trim().max(32).optional(),
  pinnedComment: formOptionalText(PINNED_COMMENT_MAX_LENGTH),
});

function isGameAnalysisModeCode(value: string): value is GameAnalysisModeCode {
  return (Object.values(GAME_ANALYSIS_MODE) as string[]).includes(value);
}

/**
 * Saves a game's settings from the gear of its row in the list: its name,
 * which side the board opens from, how a reader goes through it and the
 * comment pinned at the head of the notation. The PGN is not touched: all four are about
 * the game in this study, not something the game says about itself.
 *
 * Each has a "nothing" that is stored as null: no name (the game is shown by
 * its players), White at the bottom, plain analysis, no comment. A code that
 * is not one of the catalog's is read as that nothing rather than refused: only
 * a forged request sends one.
 */
export async function updateGameSettings(studyId: string, gameId: string, formData: FormData): Promise<void> {
  const db = getPlatformDb();
  const user = await getCurrentUser();
  if (!(await allowAction(`${user.id}:game-details`, 60, 60_000))) return;

  const form = parseForm(GAME_SETTINGS_SCHEMA, formData);
  if (!form.ok) return;

  const game = await db.game.findFirst({
    where: { id: gameId, databaseId: studyId, database: { userId: user.id } },
    select: { id: true },
  });
  if (!game) return;

  const { title, orientationCode, analysisModeCode, pinnedComment } = form.data;
  await db.game.update({
    where: { id: game.id },
    data: {
      title: title ?? null,
      pinnedComment: pinnedComment ?? null,
      orientation:
        orientationCode === BOARD_ORIENTATION.BLACK
          ? { connect: { code: BOARD_ORIENTATION.BLACK } }
          : { disconnect: true },
      analysisMode:
        analysisModeCode && isGameAnalysisModeCode(analysisModeCode)
          ? { connect: { code: analysisModeCode } }
          : { disconnect: true },
    },
  });

  revalidatePath(platformRoutes.studyDetail(studyId));
  revalidatePath(platformRoutes.gameDetail(studyId, gameId));
}

/**
 * Rewrites an own game's PGN with one of the two clean-ups the list's
 * settings offer, and indexes its positions again: taking out the variations
 * takes positions out of the game.
 *
 * It writes on the server what the game's page holds in the browser, so
 * whoever calls it for the game on screen reloads the page afterwards
 * (`GameSettings` does): otherwise the next autosave would write the old PGN
 * back over this one.
 */
async function rewriteGamePgn(
  studyId: string,
  gameId: string,
  clear: (game: NonNullable<ReturnType<typeof parseEditableGame>>) => boolean,
): Promise<void> {
  const db = getPlatformDb();
  const user = await getCurrentUser();
  if (!(await allowAction(`${user.id}:game-clear`, 30, 60_000))) return;

  const game = await db.game.findFirst({
    where: { id: gameId, databaseId: studyId, database: { userId: user.id } },
    select: { id: true, pgn: true },
  });
  if (!game) return;

  const editable = parseEditableGame(game.pgn);
  if (!editable || !clear(editable)) return;
  const pgn = serializeGame(editable);

  await db.$transaction(async (tx) => {
    await tx.game.update({ where: { id: game.id }, data: { pgn } });
    await indexGamePositions(tx, { gameId: game.id, databaseId: studyId, pgn });
  });

  revalidatePath(platformRoutes.studyDetail(studyId));
  revalidatePath(platformRoutes.gameDetail(studyId, gameId));
}

/** Takes the comments, the arrows, the signs and the evaluations out of an own game; the moves and the variations stay. */
export async function clearGameAnnotations(studyId: string, gameId: string): Promise<void> {
  await rewriteGamePgn(studyId, gameId, clearAnnotations);
}

/** Leaves an own game with its main line alone: every variation goes, with what was written on it. */
export async function clearGameVariations(studyId: string, gameId: string): Promise<void> {
  await rewriteGamePgn(studyId, gameId, clearVariations);
}

/**
 * Saves a game's annotated PGN reporting what happened.
 *
 * The autosave cannot fail silently: whoever is analysing has to find out that
 * their work is NOT safe, which is why this variant returns the reason instead
 * of just leaving.
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

  // Only the study's listing: the game's page is NOW the one being edited — it is
  // annotated there, there is no separate screen any more — and revalidating it on
  // every autosave would reload it under the feet of whoever is writing. It is
  // served per session, so on returning to it the database is read all the same.
  revalidatePath(platformRoutes.studyDetail(studyId));
  return { ok: true };
}

/**
 * Deletes a game from an own study.
 *
 * `ClassBlock.gameId` is `onDelete: SetNull`, so deleting breaks no class: the
 * block is left without a reference and the mapper already omits it. But that
 * makes content disappear from a class without anyone finding out, so if the
 * game is cited an explicit confirmation is required.
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

  if (game._count.classBlocks > 0 && readIds(formData, "confirmClassBlocks").confirmClassBlocks !== "yes") {
    redirect(withErrorParam(gamePath, "gameInClasses"));
  }

  // GamePosition is `onDelete: Cascade`: the position index cleans itself.
  await db.game.delete({ where: { id: game.id } });

  revalidatePath(platformRoutes.studies);
  revalidatePath(platformRoutes.studyDetail(studyId));
  // On to the first game that is left, looked up here so as not to bounce
  // through the study's URL; with none left, the study's empty page.
  const next = await db.game.findFirst({
    where: { databaseId: studyId },
    orderBy: studyDetailInclude.games.orderBy,
    select: { id: true },
  });
  redirect(next ? platformRoutes.gameDetail(studyId, next.id) : platformRoutes.studyDetail(studyId));
}

/**
 * Deletes an own study with everything it contains.
 *
 * The games and their position index fall by cascade (`Game.databaseId` and
 * `GamePosition.databaseId` are `onDelete: Cascade`), so this takes down rather
 * more than one row. That is why, if the study has games or one of them is cited
 * in a class, it has to be confirmed explicitly.
 *
 * The course studies are never touched: they have a null `userId` and the
 * ownership condition already leaves them out.
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

  // "Mis partidas" is created with the account and is unique, so it is not
  // deleted. The button not appearing on the card is not enough: a server action
  // is reachable by direct POST.
  if (!studyPermissionsOf({ kindCode: study.kind.code, isOwner: true }).canDelete) return;

  const citedGames = await db.classBlock.count({ where: { game: { databaseId: studyId } } });

  if ((study._count.games > 0 || citedGames > 0) && readIds(formData, "confirmDelete").confirmDelete !== "yes") {
    redirect(withErrorParam(studyPath, "confirmStudyDelete"));
  }

  await db.gameDatabase.delete({ where: { id: study.id } });

  revalidatePath(platformRoutes.studies);
  redirect(platformRoutes.studies);
}

// --- Sharing of collections -------------------------------------------------
//
// A collection belongs to its owner — a teacher — and REACHES the student
// through a StudyShare row. The share only gives read access, and that is not
// imposed by the table but by ownership: every write in this file carries
// `userId: user.id` in the `where`, so a student with a shared collection passes
// none of them.
//
// Three conditions to share, and all three are checked against the database
// because the student's id comes from the client:
//
//  1. whoever shares is an ACTIVE teacher;
//  2. the collection is theirs and is a collection (a personal study is not
//     shared: for that a collection is made with whichever games are needed);
//  3. the student has an active assignment with them, the same criterion as the
//     rest of the teacher panel.

/** The collection of an active teacher, or null if either of the two fails. */
async function ownedCollection(studyId: string): Promise<{ study: { id: string }; teacherId: string } | null> {
  const teacher = await getTeacherContext();
  if (!teacher) return null;

  const study = await getPlatformDb().gameDatabase.findFirst({
    where: { id: studyId, userId: teacher.user.id, kind: { code: DATABASE_KIND.COLLECTION } },
    select: { id: true },
  });
  return study ? { study, teacherId: teacher.teacher.id } : null;
}

/** Shares a collection with a student of the teacher's. */
export async function shareStudyWithStudent(studyId: string, formData: FormData): Promise<void> {
  const { studentId } = readIds(formData, "studentId");
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

  // Sharing it twice with the same student is not an error that deserves noise:
  // the intended result — that they have it — is already met. The unique index on
  // (collection, student) is what guarantees it; this only avoids the blow-up.
  await db.studyShare.upsert({
    where: { databaseId_userId: { databaseId: owned.study.id, userId: studentId } },
    update: {},
    create: { databaseId: owned.study.id, userId: studentId, teacherId: owned.teacherId },
  });

  revalidatePath(platformRoutes.studyDetail(owned.study.id));
}

/**
 * Removes the share. It deletes nothing of the material: the collection is still
 * whole in the teacher's database, the student simply stops seeing it.
 */
export async function unshareStudyWithStudent(studyId: string, formData: FormData): Promise<void> {
  const { studentId } = readIds(formData, "studentId");
  if (studentId.length === 0) return;

  const owned = await ownedCollection(studyId);
  if (!owned) return;

  const db = getPlatformDb();
  if (!(await allowAction(`${owned.teacherId}:share-study`, 60, 60_000))) return;

  await db.studyShare.deleteMany({ where: { databaseId: owned.study.id, userId: studentId } });

  revalidatePath(platformRoutes.studyDetail(owned.study.id));
}

/**
 * The game a person has on screen becomes the one their study opens on next
 * time, its card's board and its place in «Recientes» (`StudyVisit`, of which
 * this is the only writer). Called by the game page from the browser once the
 * game is shown, never while rendering, so a page Next prefetches writes
 * nothing. Only a game the viewer can see, in the study it says; anything else
 * — a forged request, a game deleted meanwhile — goes out silently. Nothing is
 * revalidated: the list is read fresh when it is next opened.
 */
export async function rememberOpenedGame(studyId: string, gameId: string): Promise<void> {
  if (typeof studyId !== "string" || typeof gameId !== "string") return;
  const user = await getCurrentUser();
  const db = getPlatformDb();

  const game = await db.game.findFirst({
    where: { id: gameId, databaseId: studyId, database: await getVisibleDatabasesWhere() },
    select: { id: true },
  });
  if (!game) return;

  await db.studyVisit.upsert({
    where: { userId_databaseId: { userId: user.id, databaseId: studyId } },
    create: { userId: user.id, databaseId: studyId, gameId },
    update: { gameId, openedAt: new Date() },
  });
}
