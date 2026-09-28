// Course "Mis 60 memorables partidas": Bobby Fischer's book as one lesson per
// game, grouped into the three stages of his career.
//
// THE CONTENT IS NOT WRITTEN HERE. The canonical source is
// `data/my-60-memorable-games.pgn`, the export of the Lichess study
// https://lichess.org/study/Wq1xlajv, which transcribes the book's games with
// Fischer's notes in Spanish. This module only validates that file and
// translates it into the `SeedCourse` shape prisma/seed.ts consumes. To change
// the content the PGN is replaced, this file is not edited.
//
// WHAT THE STUDY IS AND IS NOT. It carries 58 of the book's 60 games — 59 and
// 60 are missing — plus three reference games that the notes to game 55 cite
// and that do not belong to the sixty. It is an amateur transcription: the
// chapter titles misspell several players and attribute game 48 to the wrong
// Byrne. `GAMES` below is the correction table, one entry per chapter, and the
// seed refuses to run if the PGN stops matching it. The moves and the
// commentary are NOT touched: the PGN travels verbatim into each lesson.
//
// ON THE SOURCES. The games and their results are facts and are cited freely.
// The commentary is Fischer's, in Antonio Gude's Spanish translation for La
// Casa del Ajedrez, still in copyright, transcribed by a third party. It is
// third-party material: fine for the academy's internal use, not for
// publishing it without a licence. See WARNINGS.md.

import { readFileSync } from "node:fs";
import { AUTHOR_ROLE, CONTENT_TYPE, COURSE_STATUS, DEFAULT_LEVEL } from "../../constants/platform/course-codes.const";
import { BOARD_ORIENTATION, TOPIC } from "../../constants/platform/shared-codes.const";
import { SOURCE_TYPE } from "../../constants/platform/source-codes.const";
import type { SeedChapter, SeedCourse, SeedCourseSource, SeedLesson } from "../seed-data";

/** Fixed ids, in a range of their own so as not to clash with seed-data.ts's. */
export const FISCHER_IDS = {
  course: "10000004",

  chLearning: "c1000000-0000-4000-8000-000000000020",
  chBreakthrough: "c1000000-0000-4000-8000-000000000021",
  chTitleRun: "c1000000-0000-4000-8000-000000000022",

  srcOriginal: "f0000000-0000-4000-8000-000000000001",
  srcSpanish: "f0000000-0000-4000-8000-000000000002",
  srcStudy: "f0000000-0000-4000-8000-000000000003",
} as const;

const PGN_FILE = new URL("./data/my-60-memorable-games.pgn", import.meta.url);

function fail(message: string): never {
  throw new Error(`Paquete «Mis 60 memorables partidas» inválido: ${message}`);
}

// ---------------------------------------------------------------------------
// The 61 chapters of the study
// ---------------------------------------------------------------------------

interface GameEntry {
  /** `ChapterName` exactly as the study writes it. It is the key into the PGN. */
  chapterName: string;
  /** The book's game number; null for the three reference games. */
  number: number | null;
  white: string;
  black: string;
  year: number;
  /**
   * Why the players here differ from the study's title. Only filled in when
   * the study is demonstrably wrong, so every correction can be reviewed.
   */
  correction?: string;
}

/**
 * One entry per chapter of the study, in its order. The title is rebuilt from
 * `white`/`black`/`year` and never read off the study's own, which is where
 * the typos are.
 */
const GAMES: GameEntry[] = [
  { chapterName: "1. Robert James Fischer - James Sherwin 1957", number: 1, white: "Robert James Fischer", black: "James Sherwin", year: 1957 },
  { chapterName: "2. Robert James Fischer - Bent Larsen 1958", number: 2, white: "Robert James Fischer", black: "Bent Larsen", year: 1958 },
  { chapterName: "3. Tigran Petrosian-Robert James Fischer 1958", number: 3, white: "Tigran Petrosian", black: "Robert James Fischer", year: 1958 },
  { chapterName: "4. Herman Pilnik- Robert James Fischer 1958", number: 4, white: "Herman Pilnik", black: "Robert James Fischer", year: 1958 },
  { chapterName: "5.  Robert James Fischer - Héctor Rossetto 1959", number: 5, white: "Robert James Fischer", black: "Héctor Rossetto", year: 1959 },
  {
    chapterName: "6. Robert James Fischer - Ruben Shocrhon 1959",
    number: 6,
    white: "Robert James Fischer",
    black: "Ruben Shocron",
    year: 1959,
    correction: "«Shocrhon» es una errata del estudio: el argentino se llama Ruben Shocron.",
  },
  {
    chapterName: "7.Fridik Olafsson-Robert James Fischer 1959",
    number: 7,
    white: "Fridrik Olafsson",
    black: "Robert James Fischer",
    year: 1959,
    correction: "«Fridik» es una errata del estudio: el islandés se llama Fridrik Olafsson.",
  },
  { chapterName: "8. Robert James-Fischer - Paul Keres 1959", number: 8, white: "Robert James Fischer", black: "Paul Keres", year: 1959 },
  { chapterName: "9. Edgar Walther - Robert James-Fischer 1959", number: 9, white: "Edgar Walther", black: "Robert James Fischer", year: 1959 },
  { chapterName: "10. Robert James Fischer - Wolfgang Unzicker 1959", number: 10, white: "Robert James Fischer", black: "Wolfgang Unzicker", year: 1959 },
  { chapterName: "11. Robert James Fischer - Pal Benko 1959", number: 11, white: "Robert James Fischer", black: "Pal Benko", year: 1959 },
  {
    chapterName: "12. Svetozar Gligorix - Robert James Fischer 1959",
    number: 12,
    white: "Svetozar Gligoric",
    black: "Robert James Fischer",
    year: 1959,
    correction: "«Gligorix» es una errata del estudio; el capítulo 13 ya lo escribe Gligoric.",
  },
  { chapterName: "13. Robert James Fischer - Svetozar Gligoric 1959", number: 13, white: "Robert James Fischer", black: "Svetozar Gligoric", year: 1959 },
  { chapterName: "14. Paul Keres - Robert James Fischer 1959", number: 14, white: "Paul Keres", black: "Robert James Fischer", year: 1959 },
  { chapterName: "15. Vasili Smyslov - Robert James Fischer 1959", number: 15, white: "Vasili Smyslov", black: "Robert James Fischer", year: 1959 },
  { chapterName: "16. Robert James Fischer - Tigran Petrosian 1959", number: 16, white: "Robert James Fischer", black: "Tigran Petrosian", year: 1959 },
  { chapterName: "17. Robert James Fischer - Mikhail Tal 1959", number: 17, white: "Robert James Fischer", black: "Mikhail Tal", year: 1959 },
  { chapterName: "18. Boris Spassky - Robert James Fischer 1960", number: 18, white: "Boris Spassky", black: "Robert James Fischer", year: 1960 },
  {
    chapterName: "19. Arinbjon Gudmundsson - Robert James Fischer 1960",
    number: 19,
    white: "Arinbjörn Gudmundsson",
    black: "Robert James Fischer",
    year: 1960,
    correction: "«Arinbjon» es una errata del estudio: el islandés se llama Arinbjörn Gudmundsson.",
  },
  { chapterName: "20. Robert James Fischer - Max Euwe 1960", number: 20, white: "Robert James Fischer", black: "Max Euwe", year: 1960 },
  {
    chapterName: "21. Renne Letelier - Robert James Fischer 1960",
    number: 21,
    white: "René Letelier",
    black: "Robert James Fischer",
    year: 1960,
    correction: "«Renne» es una errata del estudio: el chileno se llama René Letelier.",
  },
  { chapterName: "22. Laszlo Szabo - Robert James Fischer 1960", number: 22, white: "Laszlo Szabo", black: "Robert James Fischer", year: 1960 },
  { chapterName: "23. Robert James Fischer - Mikhail Tal 1960", number: 23, white: "Robert James Fischer", black: "Mikhail Tal", year: 1960 },
  { chapterName: "24. Robert James Fischer - Klaus Darga 1960", number: 24, white: "Robert James Fischer", black: "Klaus Darga", year: 1960 },
  { chapterName: "25. William Lombardy - Robert James Fischer 1960", number: 25, white: "William Lombardy", black: "Robert James Fischer", year: 1960 },
  { chapterName: "26. Robert James Fischer - Samuel Reshevsky 1961", number: 26, white: "Robert James Fischer", black: "Samuel Reshevsky", year: 1961 },
  { chapterName: "27. Samuel Reshevsky . Robert James Fischer 1961", number: 27, white: "Samuel Reshevsky", black: "Robert James Fischer", year: 1961 },
  { chapterName: "28. Samuel Reshevsky - Robert James Fischer 1961", number: 28, white: "Samuel Reshevsky", black: "Robert James Fischer", year: 1961 },
  { chapterName: "29. Robert James Fischer - Efim Geller 1961", number: 29, white: "Robert James Fischer", black: "Efim Geller", year: 1961 },
  { chapterName: "30. Svetozar Gligoric - Robert James Fischer 1961", number: 30, white: "Svetozar Gligoric", black: "Robert James Fischer", year: 1961 },
  { chapterName: "31. Robert James Fischer - Tigran Petrosian 1961", number: 31, white: "Robert James Fischer", black: "Tigran Petrosian", year: 1961 },
  { chapterName: "32.  Robert James Fischer - Mikhail Tal 1961", number: 32, white: "Robert James Fischer", black: "Mikhail Tal", year: 1961 },
  { chapterName: "33. Robert James Fischer - Petar Trifunovic 1961", number: 33, white: "Robert James Fischer", black: "Petar Trifunovic", year: 1961 },
  { chapterName: "34. Mario Bertok - Robert James Fischer 1962", number: 34, white: "Mario Bertok", black: "Robert James Fischer", year: 1962 },
  { chapterName: "35. Robert James Fischer - Julio Bolbochán 1962", number: 35, white: "Robert James Fischer", black: "Julio Bolbochán", year: 1962 },
  {
    chapterName: "36. Robert James Fischer - Robert Korchnoi 1962",
    number: 36,
    white: "Robert James Fischer",
    black: "Viktor Korchnoi",
    year: 1962,
    correction: "El estudio escribe «Robert Korchnoi», contagiado del nombre de Fischer; el gran maestro es Viktor Korchnoi.",
  },
  { chapterName: "37. Paul Keres - Robert James Fisher 1962", number: 37, white: "Paul Keres", black: "Robert James Fischer", year: 1962 },
  { chapterName: "38 Robert James Fischer - Paul Keres 1962", number: 38, white: "Robert James Fischer", black: "Paul Keres", year: 1962 },
  { chapterName: "39. Mikhail Botvinnik - Robert James Fischer 1962", number: 39, white: "Mikhail Botvinnik", black: "Robert James Fischer", year: 1962 },
  { chapterName: "40. Robert James Fischer - Miguel Najdorf 1962", number: 40, white: "Robert James Fischer", black: "Miguel Najdorf", year: 1962 },
  { chapterName: "41. Robert James Fischer - Karl Robatsch 1962", number: 41, white: "Robert James Fischer", black: "Karl Robatsch", year: 1962 },
  { chapterName: "42. Wolfgang Unzicker - Robert James Fischer 1962", number: 42, white: "Wolfgang Unzicker", black: "Robert James Fischer", year: 1962 },
  { chapterName: "43. Robert James Fischer - Samuel Reshevsky 1962", number: 43, white: "Robert James Fischer", black: "Samuel Reshevsky", year: 1962 },
  { chapterName: "44. Robert James Fischer - Reuben Fine 1963", number: 44, white: "Robert James Fischer", black: "Reuben Fine", year: 1963 },
  { chapterName: "45 Robert James Fischer - Arthur Bisguier 1963", number: 45, white: "Robert James Fischer", black: "Arthur Bisguier", year: 1963 },
  {
    chapterName: "46. Robert James Fischer-Paul Benko 1963",
    number: 46,
    white: "Robert James Fischer",
    black: "Pal Benko",
    year: 1963,
    correction: "El estudio escribe «Paul Benko»; el húngaro-estadounidense es Pal Benko, como en el capítulo 11.",
  },
  { chapterName: "47. Robert James Fischer - Arthur Bisguier 1963", number: 47, white: "Robert James Fischer", black: "Arthur Bisguier", year: 1963 },
  {
    chapterName: "48. Donald Byrne - Robert James Fischer 1963",
    number: 48,
    white: "Robert Byrne",
    black: "Robert James Fischer",
    year: 1963,
    correction:
      "El estudio la atribuye a Donald Byrne. Es de su hermano Robert, en el Campeonato de Estados Unidos 1963/64: el propio comentario de la partida cita a «Byrne» en ese torneo, y la partida con Donald Byrne (1956) no está en el libro.",
  },
  { chapterName: "49. Robert James Fischer - Robert Steinmeyer 1963", number: 49, white: "Robert James Fischer", black: "Robert Steinmeyer", year: 1963 },
  { chapterName: "50. Robert James Fischer - Ojars Celle 1964", number: 50, white: "Robert James Fischer", black: "Ojars Celle", year: 1964 },
  {
    chapterName: "51. Robert James Fischer - Vasili Smysklov 1965",
    number: 51,
    white: "Robert James Fischer",
    black: "Vasili Smyslov",
    year: 1965,
    correction: "«Smysklov» es una errata del estudio; el capítulo 15 ya lo escribe Smyslov.",
  },
  { chapterName: "52. Robert James Fischer - Nicolas Rossolimo 1965", number: 52, white: "Robert James Fischer", black: "Nicolas Rossolimo", year: 1965 },
  { chapterName: "53. Lajos Portisch - Robert James Fischer 1966", number: 53, white: "Lajos Portisch", black: "Robert James Fischer", year: 1966 },
  { chapterName: "54. Robert James Fischer - Miguel Najdorf 1966", number: 54, white: "Robert James Fischer", black: "Miguel Najdorf", year: 1966 },
  {
    chapterName: "55. Robert James Fischer - Jacek Bednarsky 1966",
    number: 55,
    white: "Robert James Fischer",
    black: "Jacek Bednarski",
    year: 1966,
    correction: "«Bednarsky» es una errata del estudio: el polaco se llama Jacek Bednarski.",
  },
  { chapterName: "55 bis 1: García Fischer 1966", number: null, white: "García", black: "Fischer", year: 1966 },
  { chapterName: "55 bis 2: Ciocaltea-Gheorghiu 1967", number: null, white: "Ciocaltea", black: "Gheorghiu", year: 1967 },
  { chapterName: "55 bis 3 R.Byrne-Fischer 1967", number: null, white: "Robert Byrne", black: "Fischer", year: 1967 },
  { chapterName: "56. Robert James Fischer - Svetozar Gligoric 1966", number: 56, white: "Robert James Fischer", black: "Svetozar Gligoric", year: 1966 },
  { chapterName: "57. Bent Larsen - Robert James Fischer 1967", number: 57, white: "Bent Larsen", black: "Robert James Fischer", year: 1967 },
  { chapterName: "58. Robert James Fischer - Efim Geller 1967", number: 58, white: "Robert James Fischer", black: "Efim Geller", year: 1967 },
];

/**
 * The five games the course opens with in the list, because they are the ones
 * that get named when the book is talked about. Three of them Fischer lost or
 * drew: the book is not a highlight reel, and marking only wins would hide that.
 */
const PRIORITY_GAMES = new Set([17, 18, 39, 48, 58]);

// ---------------------------------------------------------------------------
// The PGN
// ---------------------------------------------------------------------------

interface RawChapter {
  chapterName: string;
  eco: string;
  /** Headers and moves, exactly as the study exports them. */
  pgn: string;
}

function tagOf(block: string, name: string): string | null {
  return (block.match(new RegExp(`^\\[${name} "([^"]*)"\\]`, "m")) ?? [])[1] ?? null;
}

/**
 * Splits the export into its chapters. Every one of them opens with `[Event`,
 * which is the only separator the format guarantees: a blank line also appears
 * between the headers and the moves.
 */
function readChapters(): RawChapter[] {
  const text = readFileSync(PGN_FILE, "utf8");
  return text
    .split(/(?=^\[Event )/m)
    .filter((block) => block.trim())
    .map((block) => {
      const chapterName = tagOf(block, "ChapterName");
      const eco = tagOf(block, "ECO");
      if (!chapterName) fail("un capítulo del PGN no trae ChapterName");
      if (!eco) fail(`el capítulo «${chapterName}» no trae ECO`);
      return { chapterName, eco, pgn: block.trim() };
    });
}

/**
 * Pairs the PGN with the correction table. It runs on every seed on purpose —
 * 61 chapters parse in milliseconds — so that replacing the export with a
 * different one cannot silently reorder the games, drop one or bring a title
 * nobody has reviewed.
 */
function pair(): { entry: GameEntry; raw: RawChapter }[] {
  const chapters = readChapters();
  if (chapters.length !== GAMES.length) {
    fail(`el PGN trae ${chapters.length} capítulos y la tabla describe ${GAMES.length}`);
  }

  const numbers = new Set<number>();
  return chapters.map((raw, index) => {
    const entry = GAMES[index];
    if (!entry) fail(`sin entrada en la tabla para el capítulo ${index + 1}`);
    if (entry.chapterName !== raw.chapterName) {
      fail(`el capítulo ${index + 1} del PGN es «${raw.chapterName}» y la tabla espera «${entry.chapterName}»`);
    }
    if (entry.number !== null) {
      if (entry.number < 1 || entry.number > 60) fail(`número de partida fuera del libro: ${entry.number}`);
      if (numbers.has(entry.number)) fail(`número de partida duplicado: ${entry.number}`);
      numbers.add(entry.number);
    }
    return { entry, raw };
  });
}

// ---------------------------------------------------------------------------
// Translation to SeedCourse
// ---------------------------------------------------------------------------

/** Minutes per annotated game; the chapter's is the sum of its own. */
const MINUTES_PER_LESSON = 20;

/**
 * Every lesson is a whole annotated game, so it is opening, middlegame and
 * endgame at once. Splitting the topics game by game would be inventing a
 * classification the book does not make.
 */
const LESSON_TOPICS = [TOPIC.OPENING_LINE, TOPIC.STRATEGY, TOPIC.TACTICS];

/**
 * The stages the course is split into, and where each game falls by its year.
 * The descriptions only state what the PGN carries (who plays) and what the
 * course's record of the book gives (the five events): no tournament is named
 * from memory.
 */
const STAGES = [
  {
    id: FISCHER_IDS.chLearning,
    name: "Los años de aprendizaje (1957–1959)",
    description:
      "Las partidas 1 a 17 del libro. Entre los rivales están Larsen, Petrosian, Keres, Smyslov y Tal; la última es la derrota ante Tal en el Torneo de Candidatos de 1959.",
    upTo: 1959,
  },
  {
    id: FISCHER_IDS.chBreakthrough,
    name: "La irrupción mundial (1960–1962)",
    description:
      "Las partidas 18 a 43 del libro. Se abre con la derrota ante Spassky en Mar del Plata 1960 e incluye las tablas con Botvinnik en la Olimpiada de Varna 1962.",
    upTo: 1962,
  },
  {
    id: FISCHER_IDS.chTitleRun,
    name: "Camino al título (1963–1967)",
    description:
      "Las partidas 44 a 58 del libro, con la victoria sobre Robert Byrne en el Campeonato de Estados Unidos 1963/64 y la derrota ante Geller en Skopie 1967. Tras la 55 van las tres partidas de referencia que el estudio añade a sus notas.",
    upTo: 9999,
  },
] as const;

/** "Fischer – Sherwin, 1957": the surnames, which is how a game is named. */
function surname(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1] ?? name;
}

/**
 * «Partida 48 · Byrne – Fischer, 1963». The book's number is spelled out with
 * its word because the platform already puts the lesson's place in its chapter
 * in front of the name: a bare "48." after it read as «5. 48. Byrne – Fischer».
 */
function titleOf(entry: GameEntry, referenceIndex: number): string {
  const players = `${surname(entry.white)} – ${surname(entry.black)}, ${entry.year}`;
  return entry.number === null
    ? `Partida de referencia ${referenceIndex} · ${players}`
    : `Partida ${entry.number} · ${players}`;
}

function descriptionOf(entry: GameEntry, raw: RawChapter): string {
  const players = `${entry.white} – ${entry.black}`;
  if (entry.number === null) {
    return `${players}, ${entry.year}. ECO ${raw.eco}. Partida de referencia citada en las notas de la 55; no es una de las sesenta del libro.`;
  }
  return `${players}, ${entry.year}. ECO ${raw.eco}. Partida ${entry.number} del libro, con los comentarios de Fischer.`;
}

function toSeedLesson(entry: GameEntry, raw: RawChapter, order: number, referenceIndex: number): SeedLesson {
  return {
    // The id goes in the URL, so it stays short and readable. A game keeps its
    // number for good: reimporting the export lands on the same rows.
    id: entry.number === null ? `f${FISCHER_IDS.course}r${referenceIndex}` : `f${FISCHER_IDS.course}g${entry.number}`,
    order,
    name: titleOf(entry, referenceIndex),
    description: descriptionOf(entry, raw),
    isPriority: entry.number !== null && PRIORITY_GAMES.has(entry.number),
    estimatedDuration: MINUTES_PER_LESSON,
    // The board is set from Fischer's side: the notes are his, and reading them
    // from the other side of the board is reading them backwards.
    orientation: entry.black.includes("Fischer") ? BOARD_ORIENTATION.BLACK : BOARD_ORIENTATION.WHITE,
    pgn: raw.pgn,
    topics: LESSON_TOPICS,
    // A whole game has no single forced line to train: the exercises will come
    // when the critical positions of each game are chosen one by one.
    exercises: [],
  };
}

function loadCourse(): SeedCourse {
  const paired = pair();

  let referenceIndex = 0;
  const chapters: SeedChapter[] = STAGES.map((stage, index) => {
    const previous = index === 0 ? 0 : (STAGES[index - 1]?.upTo ?? 0);
    const mine = paired.filter(({ entry }) => entry.year > previous && entry.year <= stage.upTo);
    if (mine.length === 0) fail(`la etapa «${stage.name}» se quedó sin partidas`);

    const lessons = mine.map(({ entry, raw }, position) => {
      if (entry.number === null) referenceIndex += 1;
      return toSeedLesson(entry, raw, position + 1, referenceIndex);
    });

    return {
      id: stage.id,
      order: index + 1,
      name: stage.name,
      description: stage.description,
      estimatedDuration: lessons.length * MINUTES_PER_LESSON,
      lessons,
    };
  });

  const total = chapters.reduce((sum, chapter) => sum + chapter.lessons.length, 0);
  if (total !== GAMES.length) fail(`se repartieron ${total} lecciones de ${GAMES.length}`);

  return {
    id: FISCHER_IDS.course,
    name: "Mis 60 memorables partidas",
    slug: "mis-60-memorables-partidas",
    description:
      "Las partidas que Bobby Fischer eligió de su propia carrera, entre 1957 y 1967, con sus comentarios: victorias, tablas y también las tres derrotas que decidió incluir. Este curso reúne 58 de las 60, una lección por partida y en el orden del libro.",
    contentTypes: [CONTENT_TYPE.GAME_ANALYSIS, CONTENT_TYPE.OPENINGS, CONTENT_TYPE.STRATEGY, CONTENT_TYPE.ENDGAMES],
    status: COURSE_STATUS.PUBLISHED,
    // Orientative, as the level catalog says: the book asks for a player who
    // can already read a long variation, not for a rating.
    levels: [DEFAULT_LEVEL.INTERMEDIATE, DEFAULT_LEVEL.ADVANCED],
    // The content is Fischer's: what the academy signs is having put it on the board.
    authorRole: AUTHOR_ROLE.DIGITAL_ADAPTATION,
    sources: SOURCES,
    chapters,
  };
}

// ---------------------------------------------------------------------------
// Where the material comes from
// ---------------------------------------------------------------------------
//
// Three rows, because they are three different things: the work Fischer
// published in 1969, the Spanish edition the commentary is translated in, and
// the study the PGN was exported from. Mixing them into one would lose which
// data belongs to which.
// ---------------------------------------------------------------------------

const SOURCES: SeedCourseSource[] = [
  {
    id: FISCHER_IDS.srcOriginal,
    order: 0,
    sourceType: SOURCE_TYPE.BOOK,
    originalTitle: "My 60 Memorable Games",
    authors: "Bobby Fischer",
    publicationYear: 1969,
    edition: "Primera edición, Simon & Schuster (Nueva York)",
    specificReference: "Las 60 partidas comentadas, disputadas entre 1957 y 1967.",
    notes:
      "Obra original, en inglés. Larry Evans escribió las introducciones de las partidas y colaboró en la edición. La edición original usa notación descriptiva; hay reediciones en algebraica.",
  },
  {
    id: FISCHER_IDS.srcSpanish,
    order: 1,
    sourceType: SOURCE_TYPE.BOOK,
    originalTitle: "Mis 60 memorables partidas",
    authors: "Bobby Fischer; traducción de Antonio Gude Fernández",
    // Deliberately empty: Casa del Libro da 2023 y Open Library 2022 para el
    // mismo ISBN, y no hay forma de decidir entre los dos sin la página de
    // créditos del ejemplar. La discrepancia queda escrita en las notas.
    publicationYear: null,
    edition: "La Casa del Ajedrez · ISBN-13 9788412510034 · tapa blanda, 196 páginas, 24 × 21 cm",
    specificReference: "Es la traducción de la que proceden los comentarios en español de las lecciones.",
    notes:
      "Año sin confirmar: Casa del Libro registra 2023 y Open Library 2022 para este mismo ISBN. Prólogo de Antonio Gude; revisión y actualización del maestro internacional Gabriel Rojo Huerta.",
  },
  {
    id: FISCHER_IDS.srcStudy,
    order: 2,
    sourceType: SOURCE_TYPE.INTERACTIVE_STUDY,
    originalTitle: "Mis 60 memorables partidas. Bobby Fisher",
    authors: "PeyaTheCrazy (Lichess)",
    url: "https://lichess.org/study/Wq1xlajv",
    publicationYear: 2024,
    edition: null,
    specificReference: "61 capítulos: las partidas 1 a 58 del libro y tres partidas de referencia.",
    notes:
      "De aquí sale el PGN de las lecciones. Transcripción de aficionado: faltan las partidas 59 y 60, y los títulos traían erratas en los nombres (la 48 atribuida a Donald Byrne en vez de a Robert). Las erratas se corrigen en los títulos de las lecciones, el PGN viaja tal cual.",
  },
];

export const MY_60_MEMORABLE_GAMES: SeedCourse = loadCourse();
