import { config } from "dotenv";

config({ path: ".env.local" });
config();

import { PrismaPg } from "@prisma/adapter-pg";
import { OWNER_TYPE } from "../constants/platform/shared-codes.const";
import { DATABASE_KIND, GAME_RESULT, GAME_SOURCE } from "../constants/platform/study-codes.const";
import { PrismaClient, type Prisma } from "../lib/platform-db/generated/client";
import { indexGamePositions } from "../services/game-positions/game-positions.service";
import { parseImportedGames } from "../services/shared/pgn-import";

// Traslado de las colecciones de curso a colecciones por CAPÍTULO.
//
// La migración SQL sólo abre la columna `GameDatabase.chapterId`. Este script
// hace el movimiento de datos, que no cabe en SQL porque necesita leer las
// cabeceras del PGN de cada lección para dar de alta su partida.
//
// Hace tres cosas:
//
//  1. Crea la colección de cada capítulo que vaya a necesitarla.
//  2. Mueve las partidas de la colección VIEJA del curso a la del capítulo que
//     les toca: el de la lección que ya las referenciaba y, si no la
//     referencia ninguna, el primer capítulo del curso.
//  3. Da de alta como partida el PGN propio de cada lección que no referencie
//     ninguna, y la deja vinculada. Es lo que devuelve ese contenido —hoy sin
//     ningún sitio donde editarse— a un sitio donde se puede editar.
//
// TRANSACCIONES CORTAS, una por partida. No es una preferencia de estilo: en
// una transacción interactiva larga, este Prisma con el adaptador de pg empieza
// a devolver `null` en los `create` a partir de la séptima operación, SIN
// lanzar. Comprobado. Un script que se fiara del valor devuelto escribiría
// basura en silencio, así que además se comprueba lo que devuelve cada alta.
//
// Es IDEMPOTENTE y reanudable: cada lección se salta si ya está vinculada, así
// que si algo falla a medias basta con volver a correrlo.
//
// Con `--dry` no escribe nada: recorre lo mismo y cuenta lo que haría.
//
// Se corre también después de un `prisma db seed`: el seed deja las lecciones
// con su PGN propio y esto las pasa a la colección de su capítulo.
//
//   npx tsx scripts/migrate-chapter-collections.ts [--dry]

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.PLATFORM_DATABASE_URL }),
});

const dryRun = process.argv.includes("--dry");
const log = (...parts: unknown[]) => console.log(dryRun ? "[simulación]" : "[migración]", ...parts);

interface ChapterRow {
  id: string;
  name: string;
  courseId: string;
  lessons: { id: string; name: string; gameId: string | null; pgn: string }[];
}

/** La colección del capítulo, creándola si no la tiene. */
async function chapterCollection(chapter: ChapterRow): Promise<string> {
  const existing = await db.gameDatabase.findUnique({
    where: { chapterId: chapter.id },
    select: { id: true },
  });
  if (existing) return existing.id;
  if (dryRun) return `(nueva para ${chapter.id})`;

  const created = await db.gameDatabase.create({
    data: {
      ownerType: { connect: { code: OWNER_TYPE.COURSE } },
      course: { connect: { id: chapter.courseId } },
      chapter: { connect: { id: chapter.id } },
      kind: { connect: { code: DATABASE_KIND.COLLECTION } },
      name: `Partidas de ${chapter.name}`,
      description: "Las partidas que usan las lecciones de este capítulo.",
    },
    select: { id: true },
  });
  log(`  colección creada para «${chapter.name}»`);
  return created.id;
}

/** Siguiente hueco de orden en una colección. */
async function nextOrder(databaseId: string): Promise<number> {
  const last = await db.game.aggregate({ where: { databaseId }, _max: { order: true } });
  return (last._max.order ?? 0) + 1;
}

/**
 * Cambia una partida de base.
 *
 * `GamePosition.databaseId` está denormalizado desde `Game`, así que mover la
 * partida sin actualizar sus posiciones dejaría el índice del buscador
 * apuntando a una base que ya no la contiene: seguiría encontrándola, pero
 * atribuida al sitio equivocado. Las dos escrituras van juntas o ninguna.
 */
async function moveGame(gameId: string, databaseId: string, order: number) {
  await db.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.game.update({ where: { id: gameId }, data: { databaseId, order } });
    await tx.gamePosition.updateMany({ where: { gameId }, data: { databaseId } });
  });
}

/** Da de alta el PGN de la lección como partida del capítulo y la vincula. */
async function adoptLessonPgn(
  lesson: ChapterRow["lessons"][number],
  databaseId: string,
  order: number,
): Promise<void> {
  const [parsed] = parseImportedGames(lesson.pgn);

  await db.$transaction(async (tx: Prisma.TransactionClient) => {
    const game = await tx.game.create({
      data: {
        database: { connect: { id: databaseId } },
        order,
        // El nombre de la lección: es como la reconoce quien la editó.
        title: lesson.name,
        white: parsed?.white ?? "Desconocido",
        black: parsed?.black ?? "Desconocido",
        result: { connect: { code: parsed?.resultCode ?? GAME_RESULT.ONGOING } },
        event: parsed?.event ?? null,
        site: parsed?.site ?? null,
        eco: parsed?.eco ?? null,
        playedAt: parsed?.playedAt ?? null,
        initialFen: parsed?.initialFen ?? null,
        // Si el PGN de la lección no se deja leer se guarda tal cual: es su
        // contenido y perderlo sería peor que guardarlo sin cabeceras.
        pgn: parsed?.pgn ?? lesson.pgn,
        source: { connect: { code: GAME_SOURCE.MANUAL } },
      },
      select: { id: true },
    });
    // Ver la nota de arriba: este cliente puede devolver null sin lanzar.
    if (!game?.id) throw new Error(`El alta de la partida de «${lesson.name}» no devolvió id`);

    await tx.lesson.update({ where: { id: lesson.id }, data: { gameId: game.id } });

    // El índice de posiciones, en la misma transacción que el alta: una partida
    // guardada sin indexar es invisible para el buscador por posición y nadie
    // se entera hasta buscarla. Es lo mismo que hace la importación de PGN.
    await indexGamePositions(tx, { gameId: game.id, databaseId, pgn: parsed?.pgn ?? lesson.pgn });
  });
}

async function main() {
  const courses = await db.course.findMany({
    select: {
      id: true,
      name: true,
      chapters: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          name: true,
          courseId: true,
          lessons: {
            orderBy: { order: "asc" },
            select: { id: true, name: true, gameId: true, pgn: true },
          },
        },
      },
      gameDatabases: {
        where: { chapterId: null },
        select: { id: true, name: true, games: { select: { id: true } } },
      },
    },
  });

  let moved = 0;
  let adopted = 0;

  for (const course of courses) {
    if (course.chapters.length === 0) continue;
    log(`curso «${course.name}»`);

    // Qué capítulo reclama cada partida: el de la lección que la referencia.
    const claimedBy = new Map<string, ChapterRow>();
    for (const chapter of course.chapters) {
      for (const lesson of chapter.lessons) {
        if (lesson.gameId) claimedBy.set(lesson.gameId, chapter);
      }
    }

    const collections = new Map<string, string>();
    const collectionFor = async (chapter: ChapterRow) => {
      const cached = collections.get(chapter.id);
      if (cached) return cached;
      const id = await chapterCollection(chapter);
      collections.set(chapter.id, id);
      return id;
    };

    // 1 y 2. Las partidas de la colección vieja del curso.
    for (const old of course.gameDatabases) {
      for (const game of old.games) {
        // Sin lección que la reclame va al primer capítulo: es material del
        // curso y dejarla fuera de toda colección la volvería invisible.
        const chapter = claimedBy.get(game.id) ?? course.chapters[0];
        const databaseId = await collectionFor(chapter);
        if (!dryRun) await moveGame(game.id, databaseId, await nextOrder(databaseId));
        moved += 1;
      }

      // La base vieja se queda vacía; se retira para no dejar una colección del
      // curso sin capítulo compitiendo con la de cada uno.
      if (!dryRun) await db.gameDatabase.delete({ where: { id: old.id } });
      log(`  colección de curso «${old.name}» retirada (${old.games.length} partidas movidas)`);
    }

    // 3. El PGN propio de cada lección pasa a ser una partida de su capítulo.
    for (const chapter of course.chapters) {
      let pending = 0;
      for (const lesson of chapter.lessons) {
        if (lesson.gameId || lesson.pgn.trim().length === 0) continue;

        const databaseId = await collectionFor(chapter);
        if (!dryRun) await adoptLessonPgn(lesson, databaseId, await nextOrder(databaseId));
        adopted += 1;
        pending += 1;
      }
      if (pending > 0) log(`  «${chapter.name}»: ${pending} lecciones con partida propia`);
    }
  }

  log(`hecho: ${moved} partidas movidas, ${adopted} lecciones con partida propia dada de alta`);
  await db.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await db.$disconnect();
  process.exit(1);
});
