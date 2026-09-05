// Curso «Piense como un gran maestro»: los 162 diagramas del libro de Alexander
// Kotov, repartidos en sus 5 capítulos, como lecciones de posición.
//
// EL CONTENIDO NO SE ESCRIBE AQUÍ. La fuente canónica es el paquete de
// importación `data/think-like-a-grandmaster.import.json`; este módulo sólo lo
// valida y lo traduce a la forma `SeedCourse` que consume prisma/seed.ts. Para
// cambiar el contenido se regenera el paquete, no se edita este fichero: por
// eso las lecciones no llevan id fijo escrito a mano, sino derivado de su
// `stableKey` (ver `deterministicId`).
//
// SOBRE LAS FUENTES. Las posiciones y las jugadas son hechos y se citan
// libremente. El comentario que el paquete adjunta a cada diagrama, en cambio,
// es transcripción literal del libro —traducción de Ediciones Polo, 2016, aún
// en derechos— y viaja dentro del PGN de la lección. Es material de terceros:
// vale para uso interno de la academia, no para publicarlo sin licencia.

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { Chess } from "chessops/chess";
import { parseFen } from "chessops/fen";
import { COURSE_STATUS, COURSE_TYPE, LEVEL } from "../../constants/platform/course-codes.const";
import { BOARD_ORIENTATION, OWNER_TYPE, TOPIC } from "../../constants/platform/shared-codes.const";
import { DATABASE_KIND, GAME_RESULT, GAME_SOURCE } from "../../constants/platform/study-codes.const";
import type { SeedChapter, SeedCourse, SeedLesson } from "../seed-data";

/** Ids fijos, en rangos propios para no chocar con los de seed-data.ts. */
export const GM_IDS = {
  course: "10000003",

  chAnalysis: "c1000000-0000-4000-8000-000000000010",
  chJudgement: "c1000000-0000-4000-8000-000000000011",
  chPlanning: "c1000000-0000-4000-8000-000000000012",
  chEndgame: "c1000000-0000-4000-8000-000000000013",
  chPreparation: "c1000000-0000-4000-8000-000000000014",
} as const;

// ---------------------------------------------------------------------------
// Paquete de importación
// ---------------------------------------------------------------------------

const IMPORT_FILE = new URL("./data/think-like-a-grandmaster.import.json", import.meta.url);

interface ImportLesson {
  stableKey: string;
  lessonOrder: number;
  lessonTitle: string;
  lessonSlug: string;
  contentType: string;
  sourceSequence: number;
  sourcePdfPage: number;
  diagramNumber: number | null;
  white: string | null;
  black: string | null;
  sideToMove: string;
  fen: string;
  commentary: string;
  pgn: string;
}

interface ImportChapter {
  order: number;
  title: string;
  sourceLabel: string;
  slug: string;
  lessons: ImportLesson[];
}

interface ImportFile {
  formatVersion: number;
  course: {
    title: string;
    slug: string;
    source: string;
    lessonCount: number;
    chapterCount: number;
    chapters: ImportChapter[];
  };
}

function fail(message: string): never {
  throw new Error(`Paquete «Piense como un gran maestro» inválido: ${message}`);
}

/**
 * Comprueba el paquete antes de que llegue a la base: cuentas declaradas,
 * unicidad de las claves y legalidad de cada posición. Se ejecuta en cada seed
 * a propósito —162 FEN se parsean en milisegundos— para que un paquete
 * regenerado no pueda meter una posición imposible sin que salte nada.
 */
function validate(data: ImportFile): void {
  if (data.formatVersion !== 1) fail(`formatVersion ${data.formatVersion} desconocida`);

  const { course } = data;
  if (course.chapters.length !== course.chapterCount) {
    fail(`declara ${course.chapterCount} capítulos y trae ${course.chapters.length}`);
  }

  const lessons = course.chapters.flatMap((chapter) => chapter.lessons);
  if (lessons.length !== course.lessonCount) {
    fail(`declara ${course.lessonCount} lecciones y trae ${lessons.length}`);
  }

  const stableKeys = new Set<string>();
  const lessonSlugs = new Set<string>();

  for (const chapter of course.chapters) {
    chapter.lessons.forEach((lesson, index) => {
      if (lesson.lessonOrder !== index + 1) {
        fail(`el capítulo ${chapter.order} tiene un lessonOrder fuera de secuencia en «${lesson.stableKey}»`);
      }
      if (lesson.contentType !== "chess-position") fail(`contentType no soportado: ${lesson.contentType}`);
      if (stableKeys.has(lesson.stableKey)) fail(`stableKey duplicado: ${lesson.stableKey}`);
      if (lessonSlugs.has(lesson.lessonSlug)) fail(`lessonSlug duplicado: ${lesson.lessonSlug}`);
      stableKeys.add(lesson.stableKey);
      lessonSlugs.add(lesson.lessonSlug);

      if (!lesson.fen?.trim()) fail(`FEN vacío en «${lesson.stableKey}»`);
      if (!lesson.pgn?.trim()) fail(`PGN vacío en «${lesson.stableKey}»`);

      const fen = resolveFen(lesson);
      const setup = parseFen(fen);
      if (setup.isErr) fail(`FEN ilegible en «${lesson.stableKey}»: ${setup.error.message}`);
      const position = Chess.fromSetup(setup.value);
      if (position.isErr) fail(`posición ilegal en «${lesson.stableKey}» (${fen}): ${position.error.message}`);
    });
  }
}

/**
 * Dos diagramas llegan del paquete con el turno invertido: el bando que no
 * mueve queda en jaque, así que la posición es ilegal tal cual. En los dos
 * casos el propio texto del libro dice de quién es la jugada —el diagrama 6
 * viene de `16.Txe6+` y el 60 de `1…Rxa5`—, de modo que esto no corrige el
 * tablero por suposición: sólo repone el turno que la inferencia automática
 * erró. Cualquier otro campo del FEN se deja intacto.
 */
const SIDE_TO_MOVE_OVERRIDES: Record<string, "w" | "b"> = {
  "kotov-source-006": "b",
  "kotov-source-063": "b",
};

/** FEN de la lección con el turno corregido si está en la lista de arriba. */
function resolveFen(lesson: ImportLesson): string {
  const override = SIDE_TO_MOVE_OVERRIDES[lesson.stableKey];
  if (!override) return lesson.fen;

  const fields = lesson.fen.split(" ");
  fields[1] = override;
  return fields.join(" ");
}

/**
 * El PGN es la fuente única del contenido de la lección (jugadas, comentario y
 * cabeceras `SourcePDFPage`, `DiagramNumber`, `White`/`Black`…), así que se
 * conserva verbatim. Lo único que se toca es la cabecera FEN de los diagramas
 * corregidos: esa cabecera es AHORA la única fuente de la posición de la
 * lección, así que un FEN mal puesto ahí es un diagrama mal puesto.
 */
function resolvePgn(lesson: ImportLesson): string {
  const fen = resolveFen(lesson);
  if (fen === lesson.fen) return lesson.pgn;
  return lesson.pgn.replace(`[FEN "${lesson.fen}"]`, `[FEN "${fen}"]`);
}

// ---------------------------------------------------------------------------
// Traducción a SeedCourse
// ---------------------------------------------------------------------------

/**
 * Id estable derivado del `stableKey` de la lección (UUID v5 sobre SHA-1). El
 * seed hace upsert por id, así que reimportar el mismo paquete cae siempre
 * sobre la misma fila y nunca duplica; y como no depende del orden, mover una
 * lección de sitio no la convierte en otra.
 */
const ID_DIGITS = "0123456789";

/**
 * Ocho caracteres, porque el id de la lección va en la URL. Sigue derivando del
 * `stableKey`, así que reimportar el paquete cae sobre las mismas filas.
 *
 * Ocho dígitos son 100 millones de valores para 162 lecciones. La probabilidad
 * de que dos claves den el mismo número no es despreciable del todo —el
 * problema del cumpleaños—, así que el importador lo comprueba al arrancar en
 * vez de dejar que dos lecciones se pisen en silencio.
 */
function deterministicId(namespace: string, key: string): string {
  const bytes = createHash("sha1").update(`${namespace}:${key}`).digest();
  let id = "";
  for (let index = 0; index < 8; index++) id += ID_DIGITS[bytes[index] % 10];
  return id;
}

/** Ids de los capítulos por orden: los cinco del libro, fijos desde siempre. */
const CHAPTER_IDS = [
  GM_IDS.chAnalysis,
  GM_IDS.chJudgement,
  GM_IDS.chPlanning,
  GM_IDS.chEndgame,
  GM_IDS.chPreparation,
];

/** Lo único que no viene en el paquete: qué se estudia en cada capítulo. */
const CHAPTER_DESCRIPTIONS = [
  "Enumerar las jugadas candidatas, recorrer el árbol sin volver dos veces por la misma rama y comprobar lo evidente antes de mover.",
  "Leer una posición por sus elementos: líneas abiertas, casillas y peones débiles, peones pasados y piezas mal colocadas.",
  "Del juicio al plan: elegir un objetivo, subordinarle las jugadas y saber cuándo hay que cambiar de plan.",
  "Lo que cambia al simplificar: pensar por esquemas, no tener prisa y llevar el rey al centro.",
  "El trabajo fuera del tablero: qué estudiar, cómo analizar una partida aplazada y cómo conocerse a uno mismo.",
];

const CHAPTER_TOPICS = [
  [TOPIC.TACTICS, TOPIC.STRATEGY],
  [TOPIC.STRATEGY, TOPIC.PAWN_STRUCTURE],
  [TOPIC.STRATEGY],
  [TOPIC.ENDGAME],
  [TOPIC.STRATEGY],
];

/** Minutos por diagrama; el del capítulo es la suma de los suyos. */
const MINUTES_PER_LESSON = 6;

/**
 * Ficha corta de la lección a partir de los metadatos del paquete. No resume el
 * comentario del libro a propósito: es texto de terceros y ya viaja en el PGN.
 */
function buildDescription(lesson: ImportLesson, fen: string): string {
  const parts: string[] = [];
  if (lesson.white && lesson.black) parts.push(`${lesson.white}–${lesson.black}`);
  parts.push(fen.split(" ")[1] === "b" ? "juegan las negras" : "juegan las blancas");
  parts.push(lesson.diagramNumber === null ? "posición sin numerar" : `diagrama ${lesson.diagramNumber}`);

  const text = parts.join(" · ");
  return `${text.charAt(0).toUpperCase()}${text.slice(1)} (pág. ${lesson.sourcePdfPage} del original).`;
}

function toSeedLesson(lesson: ImportLesson, topics: string[]): SeedLesson {
  const fen = resolveFen(lesson);
  return {
    id: deterministicId("lesson", lesson.stableKey),
    order: lesson.lessonOrder,
    name: lesson.lessonTitle,
    description: buildDescription(lesson, fen),
    isPriority: false,
    estimatedDuration: MINUTES_PER_LESSON,
    // Cada lección es un diagrama con su comentario, no una partida que se
    // recorre: el PGN no lleva jugadas, sólo la posición de partida.
    orientation: fen.split(" ")[1] === "b" ? BOARD_ORIENTATION.BLACK : BOARD_ORIENTATION.WHITE,
    pgn: resolvePgn(lesson),
    topics,
    // Un diagrama suelto no tiene línea forzada que entrenar: los ejercicios
    // llegarán cuando se anoten las variantes de cada posición.
    exercises: [],
  };
}

function toSeedChapter(chapter: ImportChapter): SeedChapter {
  const index = chapter.order - 1;
  const id = CHAPTER_IDS[index];
  if (!id) fail(`capítulo ${chapter.order} fuera de los cinco del libro`);

  const topics = CHAPTER_TOPICS[index];
  return {
    id,
    order: chapter.order,
    name: chapter.title,
    description: CHAPTER_DESCRIPTIONS[index],
    estimatedDuration: chapter.lessons.length * MINUTES_PER_LESSON,
    lessons: chapter.lessons.map((lesson) => toSeedLesson(lesson, topics)),
  };
}

function loadCourse(): SeedCourse {
  const data = JSON.parse(readFileSync(IMPORT_FILE, "utf8")) as ImportFile;
  validate(data);

  return {
    id: GM_IDS.course,
    name: data.course.title,
    slug: data.course.slug,
    description:
      "El método de trabajo de Alexander Kotov, capítulo a capítulo: cómo se calcula una variante, cómo se juzga una posición, cómo se traza un plan y qué cambia en el final. Los 162 diagramas del libro, uno por lección.",
    type: COURSE_TYPE.STRATEGY,
    status: COURSE_STATUS.PUBLISHED,
    levels: [LEVEL.INTERMEDIATE, LEVEL.ADVANCED],
    chapters: data.course.chapters.map(toSeedChapter),
  };
}

export const THINK_LIKE_A_GRANDMASTER: SeedCourse = loadCourse();

// ---------------------------------------------------------------------------
// Partidas magistrales del curso
// ---------------------------------------------------------------------------
//
// Estas partidas NO son lecciones: forman la base de partidas del curso, que
// además es el corpus del buscador por posición. Se agrupan por el capítulo
// cuyo tema ilustran.
// ---------------------------------------------------------------------------
// Capítulo 1 — Análisis de variantes
// ---------------------------------------------------------------------------

/**
 * Boleslavsky–Flohr, 1950. El sacrificio en e6 y, sobre todo, el abanico de
 * respuestas a 18.Dh5+: la partida sirve para enseñar a ENUMERAR las jugadas
 * del rival antes de calcular ninguna.
 */
const BOLESLAVSKY_FLOHR = `1. e4 c6 2. Nf3 d5 3. Nc3 Bg4 4. h3 Bxf3 5. Qxf3 e6 6. d4 Nf6 7. Bd3 dxe4 8. Nxe4 Qxd4 {El negro toma un peón central y devuelve tiempo: a cambio, su rey se queda en el centro más de lo prudente. [%csl Re8]} 9. Be3 Qd8 10. O-O-O Nbd7 11. Bc4 Qa5 12. Bd2 Qb6 13. Rhe1 Nxe4 14. Rxe4 Nf6 15. Bxe6 fxe6 16. Rxe6+ {Aquí empieza el trabajo de verdad. Antes de calcular una sola variante, enumera las casillas a las que puede ir el rey negro: son cuatro, y ninguna se decide por intuición. [%cal Ge6e7,Ge6f7]} 16... Be7 ( 16... Kf7 17. Rxf6+ {La calidad no importa: lo que importa es que el rey se queda sin refugio.} 17... gxf6 18. Qh5+ {Y ahora las cuatro ramas del árbol. Recórrelas una a una, y cada una UNA sola vez.} 18... Ke7 ( 18... Ke6 19. Re1+ {Misma idea que en e7: la columna abierta llega antes que cualquier defensa.} ) ( 18... Kg7 19. Bh6+ $1 {La jugada intermedia que empuja al rey a la casilla peor. [%cal Gd2h6]} 19... Kg8 20. Qg4+ Kf7 21. Rd7+ Be7 22. Qg7+ ) ( 18... Kg8 19. Qg4+ Kf7 20. Qc4+ {Con el rey en f7 el jaque por la diagonal vuelve a abrir la posición.} ) 19. Re1+ Kd6 20. Bf4+ Kd7 21. Qf7+ {El rey ha cruzado el tablero y las piezas blancas llegan todas a la vez.} ) 17. Rxe7+ {En la partida el negro entregó el material de otra forma y perdió el final.} *`;

/**
 * Alekhine–Réti, Viena 1922. Cinco respuestas cortas a 12...c5: el ejemplo de
 * árbol ancho y poco profundo, donde lo difícil no es calcular hondo sino no
 * dejarse ninguna candidata fuera.
 */
const ALEKHINE_RETI = `1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. Nc3 b5 6. Bb3 Bc5 7. Nxe5 Nxe5 8. d4 Bd6 9. dxe5 Bxe5 10. f4 Bxc3+ 11. bxc3 O-O 12. e5 c5 {La jugada que obliga a las blancas a elegir. No es profunda: es ANCHA. Hay cinco continuaciones razonables y hay que mirarlas todas antes de decidir. [%csl Gc5]} 13. Ba3 ( 13. exf6 Re8+ 14. Kf1 c4 {El negro recupera la pieza con buena posición.} ) ( 13. c4 d5 14. exf6 Re8+ 15. Kf1 Qxf6 ) ( 13. Bd5 Nxd5 14. Qxd5 Qb6 15. Be3 Bb7 {Sin dificultades para el negro.} ) 13... Qa5 14. O-O Qxa3 15. exf6 c4 16. Qd5 Qa5 17. fxg7 Qb6+ 18. Kh1 Kxg7 19. Bxc4 {El alfil recupera la libertad: 19...bxc4 pierde por 20.Dxa8. [%cal Gd5a8]} *`;

/**
 * Rauzer–Riumin, Leningrado 1936. Plan largo de columna y diagonal: sirve para
 * la lección de jugadas candidatas y reaparece en el capítulo 2.
 */
const RAUZER_RIUMIN = `1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 d6 7. c3 b5 8. Bb3 Na5 9. Bc2 c5 10. d4 Qc7 11. Nbd2 Nc6 12. a4 {Primera decisión de plan: abrir la columna a antes de tocar el flanco de rey. [%cal Ga4b5]} 12... Rb8 13. axb5 axb5 14. dxc5 dxc5 15. Nf1 Be6 16. Ne3 O-O 17. Ng5 Rfd8 18. Qf3 Rd6 19. Nf5 Bxf5 20. exf5 h6 21. Ne4 Nxe4 22. Bxe4 Bf6 {Dama y alfil parten el tablero por la diagonal larga mientras la torre manda en la columna a. [%cal Ge4a8][%csl Ga8]} 23. Be3 Ne7 24. b4 c4 25. g3 Rd7 26. Ra7 Qd8 27. Rxd7 Qxd7 28. h4 Kh8 29. g4 Ng8 30. g5 Be7 31. Rd1 Qc7 32. f6 Bxf6 33. gxf6 Nxf6 34. Bc2 Rd8 35. Bxh6 Rxd1+ 36. Bxd1 e4 37. Bf4 Qd8 38. Qe2 {El negro abandonó: el ataque llega con pieza de más en el flanco. } *`;

// ---------------------------------------------------------------------------
// Capítulo 2 — Juicio posicional
// ---------------------------------------------------------------------------

/** Plater–Botvinnik, 1947. Una columna abierta basta para ganar. */
const PLATER_BOTVINNIK = `1. e4 c5 2. Ne2 Nf6 3. Nbc3 d5 4. exd5 Nxd5 5. Nxd5 Qxd5 6. Nc3 Qd8 7. Bc4 Nc6 8. d3 e6 9. O-O Be7 10. f4 O-O 11. Ne4 Na5 12. Bb3 Qd4+ 13. Kh1 c4 14. c3 Qxd3 15. Qxd3 cxd3 16. Nf2 Rd8 17. Rd1 Bc5 18. Rxd3 Bd7 19. Be3 Bxe3 20. Rxe3 Bb5 {La columna de dama es del negro y no hay forma de disputársela. Con eso solo, la partida está encaminada. [%csl Gd8][%cal Gd8d1]} 21. Ne4 h6 22. Rae1 Nxb3 23. axb3 a5 24. h3 Rac8 25. Kg1 Kf8 26. Kh2 Rc7 27. Kg3 b6 28. Kh2 Rcd7 29. Kg1 Rd1 {La torre entra en la última fila y parte en dos las fuerzas blancas.} 30. c4 Bc6 31. Nc3 Rxe1+ 32. Rxe1 Ke7 33. Re2 f6 34. Kf2 Rd3 35. h4 h5 36. Re3 Rd2+ 37. Re2 Rd3 38. Re3 Rd2+ 39. Re2 Rxe2+ 40. Nxe2 Kd6 {Empieza el final: el rey al centro antes que ninguna otra cosa. [%cal Gd6c5,Gc5b4]} 41. Nd4 g6 42. g3 e5 43. fxe5+ fxe5 44. Nc2 Be4 45. Ne1 Kc5 46. Ke3 Bf5 47. Nf3 Kb4 48. Nd2 Bc2 {El alfil supera al caballo y el rey ya está dentro. } *`;

/** Stahlberg–Taimanov, Zúrich 1953. La torre en la séptima que paraliza. */
const STAHLBERG_TAIMANOV = `1. d4 Nf6 2. c4 e6 3. Nf3 b6 4. g3 Ba6 {Presión inmediata sobre c4: el negro pelea la casilla antes de desarrollarse cómodo.} 5. Qa4 Be7 6. Bg2 O-O 7. Nc3 c6 8. Ne5 Qe8 9. O-O d5 10. Re1 b5 11. cxb5 cxb5 12. Qd1 b4 13. Nb1 Nc6 14. Nxc6 Qxc6 15. Nd2 Qb6 16. e3 Rac8 {Cinco jugadas seguidas con un solo objetivo: la única columna abierta del tablero. [%csl Gc8]} 17. Bf1 Rc6 18. Bxa6 Qxa6 19. Nf3 Rfc8 20. Qb3 Ne4 21. Nd2 Rc2 {La torre en la séptima no viene a comer: viene a paralizar. Mientras siga ahí, las blancas no pueden ordenar nada. [%csl Gc2]} 22. Nxe4 dxe4 23. a3 h5 24. d5 R8c4 25. Rd1 exd5 26. Bd2 Qf6 27. Rab1 h4 28. Qa4 Qf5 29. Qxa7 Bf8 {El negro prefirió el final; el ataque directo con 29...Ac5 era aún más fuerte.} *`;

/** Makagonov–Botvinnik, Sverdlovsk 1943. Casillas de un color, sin su alfil. */
const MAKAGONOV_BOTVINNIK = `1. d4 d5 2. c4 e6 3. Nc3 c6 4. e3 Nf6 5. Nf3 Nbd7 6. Ne5 Nxe5 7. dxe5 Nd7 8. f4 Bb4 9. cxd5 exd5 10. Bd3 Nc5 11. Bc2 Qh4+ 12. g3 Qh3 {La dama se instala en una casilla que las blancas ya no pueden disputarle sin debilitar más. [%csl Rh3,Rf3,Re4]} 13. Kf2 Bxc3 14. bxc3 Bf5 15. Bxf5 Qxf5 16. g4 {Buena defensa: para tapar el agujero, las blancas pagan con la seguridad de su rey, que se queda sin refugio para el resto de la partida.} 16... Qe6 17. Ba3 Ne4+ 18. Kf3 h5 19. h3 f6 {Las blancas no pueden capturar en f6 sin abrir su propio rey.} 20. c4 hxg4+ 21. hxg4 Rxh1 22. Qxh1 O-O-O 23. Rd1 fxe5 24. cxd5 cxd5 25. Rc1+ Kb8 {Ventaja posicional y material a la vez. } *`;

/** Kotov–Taimanov, Zúrich 1953. El caballo que se fue a la orilla. */
const KOTOV_TAIMANOV = `1. c4 Nf6 2. g3 e6 3. Bg2 d5 4. Nf3 d4 5. b4 c5 6. Bb2 Qb6 7. Qb3 Nc6 8. b5 Na5 {El caballo llega a la orilla y ahí se queda. No está perdido: está lejos, que en la práctica es peor. [%csl Ra5]} 9. Qc2 Bd6 10. e3 e5 11. exd4 exd4 12. O-O O-O 13. d3 Bd7 14. Nbd2 h6 15. Rae1 Rae8 16. Bc1 {Plan claro: si el caballo negro no defiende el flanco de rey, allí las blancas juegan con una pieza de más. Primero se vacía el flanco de dama. [%cal Gc1d2]} 16... Rxe1 17. Rxe1 Re8 18. Rxe8+ Bxe8 19. Nh4 a6 20. a4 Qa7 21. Nf5 Bf8 22. Ne4 Nxe4 23. Bxe4 b6 24. Qd1 axb5 25. axb5 Bd7 26. Qh5 Be6 27. Bf4 Nb3 {El caballo por fin entra... a comer casillas vacías, mientras el ataque blanco va contra el rey. [%csl Rb3,Gg7]} 28. Qd1 Qa2 29. h4 Na1 30. h5 Nc2 31. Be5 Qb2 32. Bc7 Na3 33. Qg4 Qc1+ 34. Kg2 Nb1 35. Bf4 Nd2 36. Qe2 {El negro abandonó. } *`;

/** Botvinnik–Alekhine, AVRO 1938. Una jugada de dama y el caballo no vuelve. */
const BOTVINNIK_ALEKHINE = `1. Nf3 d5 2. d4 Nf6 3. c4 e6 4. Nc3 c5 5. cxd5 Nxd5 6. e3 Nc6 7. Bc4 cxd4 8. exd4 Be7 9. O-O O-O 10. Re1 b6 11. Nxd5 exd5 12. Bb5 Bd7 13. Qa4 {Una sola jugada obliga al caballo a retirarse a la primera fila, y de ahí no volverá en toda la partida. [%cal Ga4c6][%csl Rc6]} 13... Nb8 14. Bf4 Bxb5 15. Qxb5 a6 16. Qa4 Bd6 17. Bxd6 Qxd6 18. Rac1 Ra7 19. Qc2 {Sencillo y demoledor: la columna c es de las blancas durante el resto de la partida. [%csl Gc1]} 19... Re7 20. Rxe7 Qxe7 21. Qc7 Qxc7 22. Rxc7 f6 23. Kf1 Rf7 24. Rc8+ Rf8 25. Rc3 {Zugzwang: ninguna pieza negra puede moverse sin dejar entrar otra vez la torre.} 25... g5 26. Ne1 h5 27. h4 Nd7 28. Rc7 Rf7 29. Nf3 g4 30. Ne1 f5 31. Nd3 f4 32. f3 gxf3 33. gxf3 a5 34. a4 Kf8 35. Rc6 Ke7 36. Kf2 Rf5 37. b3 Kd8 38. Ke2 Nb8 39. Rg6 Kc7 40. Ne5 Na6 41. Rg7+ Kc8 42. Nc6 Rf6 43. Ne7+ Kb8 44. Nxd5 Rd6 45. Rg5 {Y además cae el peón h. } *`;

/** Botvinnik–Yudovich, 1933. Cinco piezas atadas a una sola mal colocada. */
const BOTVINNIK_YUDOVICH = `1. c4 Nf6 2. d4 g6 3. Nc3 d5 4. Nf3 Bg7 5. Qb3 c6 6. cxd5 Nxd5 7. Bd2 O-O 8. e4 Nb6 {La retirada que lo estropea todo: el caballo queda fuera de juego y, peor aún, obliga a otras piezas a cuidarlo. [%csl Rb6]} 9. Rd1 N8d7 10. a4 a5 11. Be3 Qc7 12. Be2 Qd6 13. Na2 e6 14. O-O h6 15. Rc1 f5 16. Nc3 Kh7 17. Rfd1 fxe4 18. Nxe4 Qb4 19. Qc2 Qxa4 20. b3 Qa3 21. Nh4 Qe7 22. Nxg6 Kxg6 23. Bh5+ {Mate forzado. } *`;

// ---------------------------------------------------------------------------
// Capítulo 3 — Planeamiento
// ---------------------------------------------------------------------------

/**
 * Romanovsky–Vilner, 1927. Un objetivo elegido pronto (la casilla f5) y todas
 * las jugadas subordinadas a él. La línea principal se corta en la jugada 35,
 * donde el plan ya está consumado.
 */
const ROMANOVSKY_VILNER = `1. Nf3 d5 2. e3 Nf6 3. b3 Bg4 4. Bb2 Nbd7 5. Be2 Bxf3 6. Bxf3 e5 7. d3 c6 8. Nd2 Bd6 9. O-O Qe7 10. a4 {Antes de trazar un plan hay que saber dónde enrocará el rival: este avance descarta el flanco de dama. [%cal Ga4a5]} 10... O-O 11. g3 Rad8 12. Bg2 Rfe8 13. Qe2 Qe6 14. e4 Nf8 15. Rfd1 Ng6 16. Nf1 {Objetivo elegido: la casilla f5, y el camino más corto para el caballo: f1-e3-f5. Todo lo demás se subordina. [%csl Gf5][%cal Gf1e3,Ge3f5]} 16... Bc5 17. Ne3 Bxe3 18. Qxe3 d4 {El negro cambia el caballo antes de que llegue, pero al cerrar el centro se queda sin contrajuego y deja el otro flanco entero para las blancas.} 19. Qe2 Nd7 20. Rf1 Qd6 21. Ba3 c5 22. Rae1 Nb8 23. Bc1 Nc6 24. f4 f6 25. f5 {El plan se cumple: la casilla es de las blancas y el flanco de rey queda congelado. [%csl Gf5]} 25... Nf8 26. g4 Kf7 27. g5 Ke7 28. Rf3 Kd7 29. Rg3 Kc8 {El rey huye al otro lado, que es la defensa correcta ante un ataque de flanco.} 30. gxf6 gxf6 31. Bf3 Nd7 32. Qg2 a5 33. Bh5 Re7 34. Rg8 Nb6 35. Bh6 {Las piezas pesadas entran por donde el plan abrió la puerta. } *`;

/** Sokolsky–Botvinnik, 1938. Desarrollar no es un plan. */
const SOKOLSKY_BOTVINNIK = `1. c4 Nf6 2. Nc3 d5 3. d4 g6 4. Nf3 Bg7 5. e3 O-O 6. Be2 e6 7. O-O b6 8. cxd5 exd5 9. b3 Bb7 10. Bb2 Nbd7 11. Qc2 {Once jugadas correctas y ningún plan: las piezas están puestas, pero no hay ninguna idea que las mande a ningún sitio. [%csl Rc2]} 11... a6 12. Rac1 Rc8 13. Rfd1 Qe7 14. Qb1 Rfd8 15. Bf1 c5 16. dxc5 {Error posicional: las blancas sueltan su último punto fuerte del centro y abren la diagonal del alfil negro. [%cal Gb7g2]} 16... bxc5 17. Ne2 Bh6 {Ahora sí hay plan, y es del negro: ataque directo contra f2, cediendo la diagonal larga porque aquí no hace falta. [%csl Rf2]} 18. Ba3 Ng4 19. Qd3 Nde5 20. Nxe5 Qxe5 21. Ng3 Qf6 22. Nh1 {Obligado: f2 no se puede defender de otra forma.} 22... d4 23. Qe2 Ne5 24. exd4 cxd4 25. Rxc8 Bxc8 26. Re1 d3 27. Qd1 Bg4 28. Qa1 d2 29. Rxe5 d1=Q 30. Re8+ Rxe8 31. Qxf6 Be2 {Y las blancas abandonaron. } *`;

/** Petrosian–Euwe, Zúrich 1953. Jugadas sin objetivo común y su factura. */
const PETROSIAN_EUWE = `1. Nf3 Nf6 2. g3 d5 3. Bg2 Bf5 4. d3 e6 5. Nbd2 h6 6. O-O Bc5 7. Qe1 O-O 8. e4 dxe4 9. Nxe4 Nxe4 10. dxe4 Bh7 {Cinco jugadas del negro sin un objetivo común: cambia en el centro sin decidir qué quiere y su alfil queda encerrado detrás de sus propios peones. [%csl Rh7]} 11. b4 Be7 12. Bb2 Na6 13. a3 c6 14. Rd1 Qc8 15. c4 Nc7 16. Qc3 {Las blancas sí tienen un plan y es sencillo: espacio en el flanco de dama y después el centro.} 16... Bf6 17. Ne5 Rd8 18. Bf3 Ne8 19. Rxd8 Qxd8 20. Rd1 Qc7 21. c5 a5 22. Bg2 axb4 23. axb4 Rd8 24. Rxd8 Qxd8 25. Qc2 Nc7 26. Bf1 Nb5 27. f4 Kf8 28. Kf2 Bxe5 29. Bxe5 f6 30. Bb2 Ke7 31. Bc4 Bg6 32. Ke3 Bf7 33. g4 Qc7 34. e5 {Con el rey ya en el centro, las blancas abren la posición en el momento exacto. [%cal Ge4e5]} 34... Qd8 35. exf6+ gxf6 36. h4 Nc7 37. Qc3 Nd5+ {Las blancas ganaron con el peón de más y la mejor posición. } *`;

/**
 * Taimanov–Bronstein, Zúrich 1953. Peón sacrificado en la apertura por dos
 * columnas abiertas: el caso de manual del sacrificio posicional.
 */
const TAIMANOV_BRONSTEIN = `1. d4 Nf6 2. c4 c5 3. d5 g6 4. Nc3 d6 5. e4 b5 {El sacrificio: un peón por las columnas a y b, que son por donde el negro va a trabajar el resto de la partida. [%csl Ga8,Gb8]} 6. cxb5 Bg7 7. Nf3 O-O 8. Be2 a6 9. bxa6 Bxa6 10. O-O Qc7 11. Re1 Nbd7 12. Bxa6 Rxa6 13. Qe2 Rfa8 {Las dos torres ya están donde el sacrificio las quería. El peón de menos no se nota. [%cal Ga6a2,Ga8a2]} 14. h3 Nb6 15. Bg5 Ne8 16. Bd2 Na4 17. Nxa4 Rxa4 18. Bc3 Bxc3 19. bxc3 Qa5 20. Qd3 Qa6 21. Qd2 Rxa2 22. Rxa2 Qxa2 23. e5 Qxd2 24. Nxd2 dxe5 25. Rxe5 Kf8 {Empieza el final, y aquí la torre activa vale más que el peón. [%cal Ga1a2]} 26. Nb3 c4 27. Nc5 Ra1+ 28. Kh2 Nf6 29. Ne4 Nd7 30. Rg5 Ra2 31. Rg4 f5 32. Rf4 Nb6 33. Ng5 Nxd5 34. Rd4 Nb6 35. Rd8+ Kg7 36. f4 h6 37. Ne6+ Kf7 38. Nd4 Na4 39. Rc8 Nxc3 40. Rxc4 Nd5 41. Nf3 Rxg2+ 42. Kh1 Rf2 {Las blancas abandonaron. } *`;


// ---------------------------------------------------------------------------
// Base de partidas del curso
// ---------------------------------------------------------------------------

/**
 * Las partidas magistrales del curso, como base propia. Además de poder
 * consultarse desde «Mis estudios», es el corpus que alimenta el buscador por
 * posición: sin partidas de verdad, el explorador no tiene nada que encontrar.
 */
export const THINK_LIKE_A_GRANDMASTER_DATABASE = {
  id: "kotovDb0",
  ownerType: OWNER_TYPE.COURSE,
  userId: null as string | null,
  courseId: GM_IDS.course as string | null,
  // Al primer capítulo: las colecciones son por capítulo, y el reparto fino
  // entre los cinco lo hace `scripts/migrate-chapter-collections.ts`.
  chapterId: GM_IDS.chAnalysis as string | null,
  name: "Partidas de Análisis de variantes",
  description: "Las partidas magistrales que ilustran el método.",
  kind: DATABASE_KIND.COLLECTION,
  isDefault: false,
  order: 0,
};

export const THINK_LIKE_A_GRANDMASTER_GAMES = [
  {
    id: "kotovG01",
    databaseId: THINK_LIKE_A_GRANDMASTER_DATABASE.id,
    white: "Isaac Boleslavsky",
    black: "Salo Flohr",
    whiteElo: null as number | null,
    blackElo: null as number | null,
    result: GAME_RESULT.WHITE_WINS,
    playedAt: new Date(Date.UTC(1950, 0, 1)),
    event: "Budapest",
    site: null as string | null,
    eco: "B10",
    source: GAME_SOURCE.MANUAL,
    pgn: BOLESLAVSKY_FLOHR,
  },
  {
    id: "kotovG02",
    databaseId: THINK_LIKE_A_GRANDMASTER_DATABASE.id,
    white: "Alexander Alekhine",
    black: "Richard Réti",
    whiteElo: null as number | null,
    blackElo: null as number | null,
    result: GAME_RESULT.WHITE_WINS,
    playedAt: new Date(Date.UTC(1922, 0, 1)),
    event: "Viena",
    site: null as string | null,
    eco: "C77",
    source: GAME_SOURCE.MANUAL,
    pgn: ALEKHINE_RETI,
  },
  {
    id: "kotovG03",
    databaseId: THINK_LIKE_A_GRANDMASTER_DATABASE.id,
    white: "Vsevolod Rauzer",
    black: "Nikolai Riumin",
    whiteElo: null as number | null,
    blackElo: null as number | null,
    result: GAME_RESULT.WHITE_WINS,
    playedAt: new Date(Date.UTC(1936, 0, 1)),
    event: "Leningrado",
    site: null as string | null,
    eco: "C86",
    source: GAME_SOURCE.MANUAL,
    pgn: RAUZER_RIUMIN,
  },
  {
    id: "kotovG04",
    databaseId: THINK_LIKE_A_GRANDMASTER_DATABASE.id,
    white: "Wlodzimierz Plater",
    black: "Mijaíl Botvinnik",
    whiteElo: null as number | null,
    blackElo: null as number | null,
    result: GAME_RESULT.BLACK_WINS,
    playedAt: new Date(Date.UTC(1947, 0, 1)),
    event: "Torneo Paneslavo",
    site: null as string | null,
    eco: "B29",
    source: GAME_SOURCE.MANUAL,
    pgn: PLATER_BOTVINNIK,
  },
  {
    id: "kotovG05",
    databaseId: THINK_LIKE_A_GRANDMASTER_DATABASE.id,
    white: "Gideon Stahlberg",
    black: "Mark Taimanov",
    whiteElo: null as number | null,
    blackElo: null as number | null,
    result: GAME_RESULT.BLACK_WINS,
    playedAt: new Date(Date.UTC(1953, 0, 1)),
    event: "Torneo de Candidatos, Zúrich",
    site: null as string | null,
    eco: "E15",
    source: GAME_SOURCE.MANUAL,
    pgn: STAHLBERG_TAIMANOV,
  },
  {
    id: "kotovG06",
    databaseId: THINK_LIKE_A_GRANDMASTER_DATABASE.id,
    white: "Vladimir Makagonov",
    black: "Mijaíl Botvinnik",
    whiteElo: null as number | null,
    blackElo: null as number | null,
    result: GAME_RESULT.BLACK_WINS,
    playedAt: new Date(Date.UTC(1943, 0, 1)),
    event: "Sverdlovsk",
    site: null as string | null,
    eco: "D46",
    source: GAME_SOURCE.MANUAL,
    pgn: MAKAGONOV_BOTVINNIK,
  },
  {
    id: "kotovG07",
    databaseId: THINK_LIKE_A_GRANDMASTER_DATABASE.id,
    white: "Alexander Kotov",
    black: "Mark Taimanov",
    whiteElo: null as number | null,
    blackElo: null as number | null,
    result: GAME_RESULT.WHITE_WINS,
    playedAt: new Date(Date.UTC(1953, 0, 1)),
    event: "Torneo de Candidatos, Zúrich",
    site: null as string | null,
    eco: "A30",
    source: GAME_SOURCE.MANUAL,
    pgn: KOTOV_TAIMANOV,
  },
  {
    id: "kotovG08",
    databaseId: THINK_LIKE_A_GRANDMASTER_DATABASE.id,
    white: "Mijaíl Botvinnik",
    black: "Alexander Alekhine",
    whiteElo: null as number | null,
    blackElo: null as number | null,
    result: GAME_RESULT.WHITE_WINS,
    playedAt: new Date(Date.UTC(1938, 10, 1)),
    event: "Torneo AVRO",
    site: null as string | null,
    eco: "D41",
    source: GAME_SOURCE.MANUAL,
    pgn: BOTVINNIK_ALEKHINE,
  },
  {
    id: "kotovG09",
    databaseId: THINK_LIKE_A_GRANDMASTER_DATABASE.id,
    white: "Mijaíl Botvinnik",
    black: "Mijaíl Yudovich",
    whiteElo: null as number | null,
    blackElo: null as number | null,
    result: GAME_RESULT.WHITE_WINS,
    playedAt: new Date(Date.UTC(1933, 0, 1)),
    event: "Campeonato de la URSS",
    site: null as string | null,
    eco: "D90",
    source: GAME_SOURCE.MANUAL,
    pgn: BOTVINNIK_YUDOVICH,
  },
  {
    id: "kotovG10",
    databaseId: THINK_LIKE_A_GRANDMASTER_DATABASE.id,
    white: "Piotr Romanovsky",
    black: "Yakov Vilner",
    whiteElo: null as number | null,
    blackElo: null as number | null,
    result: GAME_RESULT.WHITE_WINS,
    playedAt: new Date(Date.UTC(1927, 0, 1)),
    event: "Campeonato de la URSS",
    site: null as string | null,
    eco: "A06",
    source: GAME_SOURCE.MANUAL,
    pgn: ROMANOVSKY_VILNER,
  },
  {
    id: "kotovG11",
    databaseId: THINK_LIKE_A_GRANDMASTER_DATABASE.id,
    white: "Alexey Sokolsky",
    black: "Mijaíl Botvinnik",
    whiteElo: null as number | null,
    blackElo: null as number | null,
    result: GAME_RESULT.BLACK_WINS,
    playedAt: new Date(Date.UTC(1938, 0, 1)),
    event: "Campeonato de la URSS (semifinal)",
    site: null as string | null,
    eco: "D94",
    source: GAME_SOURCE.MANUAL,
    pgn: SOKOLSKY_BOTVINNIK,
  },
  {
    id: "kotovG12",
    databaseId: THINK_LIKE_A_GRANDMASTER_DATABASE.id,
    white: "Tigran Petrosian",
    black: "Max Euwe",
    whiteElo: null as number | null,
    blackElo: null as number | null,
    result: GAME_RESULT.WHITE_WINS,
    playedAt: new Date(Date.UTC(1953, 0, 1)),
    event: "Torneo de Candidatos, Zúrich",
    site: null as string | null,
    eco: "A07",
    source: GAME_SOURCE.MANUAL,
    pgn: PETROSIAN_EUWE,
  },
  {
    id: "kotovG13",
    databaseId: THINK_LIKE_A_GRANDMASTER_DATABASE.id,
    white: "Mark Taimanov",
    black: "David Bronstein",
    whiteElo: null as number | null,
    blackElo: null as number | null,
    result: GAME_RESULT.BLACK_WINS,
    playedAt: new Date(Date.UTC(1953, 0, 1)),
    event: "Torneo de Candidatos, Zúrich",
    site: null as string | null,
    eco: "A56",
    source: GAME_SOURCE.MANUAL,
    pgn: TAIMANOV_BRONSTEIN,
  },
];
