import { afterEach, describe, expect, it, vi } from "vitest";
import {
  lessonHasContent,
  lessonPgnNotEmptyWhere,
  lessonPgnOf,
  lessonPgnSelect,
  type LessonPgnSource,
} from "@/services/shared/lesson-pgn";
import {
  courseContentCandidatesWhere,
  courseHasContent,
  coursePracticeLessonsWhere,
  type CourseContentReader,
} from "@/services/staff-courses/course-content.service";

// The flag, mocked so the test does not read the owner's local switch: a
// practice-only lesson counts only while the student can see it.
const flags = vi.hoisted(() => ({ exercises: true }));
vi.mock("@/constants/platform/features.const", () => ({
  get EXERCISES_ENABLED() {
    return flags.exercises;
  },
}));
afterEach(() => {
  flags.exercises = true;
});

const COURSE = "10000009";
const OTHER_COURSE = "10000010";
const OWN = "1. e4 e5 2. Nf3 *";
const LINKED = "1. d4 d5 2. c4 *";

// Every kind of lesson the rule tells apart, by where its content comes from.
const KINDS = {
  own: { pgn: OWN, game: null },
  // How `createLesson` leaves a lesson: no content until a game is linked.
  justCreated: { pgn: "", game: null },
  blank: { pgn: " \n\t", game: null },
  unicodeBlank: { pgn: "\u00a0\u3000\ufeff", game: null },
  linked: { pgn: "", game: { pgn: LINKED } },
  linkedKeepingOwn: { pgn: OWN, game: { pgn: LINKED } },
  // The game rules even when it is empty: the lesson's own PGN is dormant.
  emptyGame: { pgn: OWN, game: { pgn: "" } },
  blankGame: { pgn: OWN, game: { pgn: "  \n" } },
} satisfies Record<string, LessonPgnSource>;

type Kind = keyof typeof KINDS;
const KIND_NAMES = Object.keys(KINDS) as Kind[];

/** What `courseHasContent` asks of the lessons. */
interface CandidatesQuery {
  where: ReturnType<typeof courseContentCandidatesWhere>;
  select: unknown;
}

/** A lesson as the fake database holds it: whose course it is, its content, and whether a published exercise is in play. */
interface StoredLesson extends LessonPgnSource {
  courseId: string;
  practice?: boolean;
}

/**
 * The rule as it was written before the read was narrowed: a course can be
 * published when one of its chapters has a lesson with content.
 */
function oldRule(chapters: { lessons: LessonPgnSource[] }[]): boolean {
  return chapters.some((chapter) => chapter.lessons.some(lessonHasContent));
}

/**
 * A lesson reader over `lessons` that records what it was asked and how many
 * PGNs it handed back. It answers the candidates `where` the way
 * lesson-pgn.test proves the database does: the course's lessons whose ruling
 * PGN is not the empty string, in the order they are stored. Any order is a
 * possible answer, and the tests go through all of them.
 */
function reader(lessons: StoredLesson[]) {
  const calls: ("findFirst" | "findMany" | "findPractice")[] = [];
  let pgnsRead = 0;

  const candidates = ({ where, select }: CandidatesQuery): LessonPgnSource[] => {
    expect(select).toEqual(lessonPgnSelect);
    const { chapter, ...content } = where;
    expect(content).toEqual(lessonPgnNotEmptyWhere);
    return lessons
      .filter((lesson) => lesson.courseId === chapter.courseId && lessonPgnOf(lesson) !== "")
      .map(({ pgn, game }) => ({ pgn, game }));
  };

  /** The practice-only query, told apart by its `where`: a lesson with a published exercise in play. */
  const isPracticeQuery = (args: CandidatesQuery) => "lessonExercises" in args.where;

  const lesson = {
    async findFirst(args: CandidatesQuery) {
      if (isPracticeQuery(args)) {
        calls.push("findPractice");
        expect(args.where).toEqual(coursePracticeLessonsWhere(args.where.chapter.courseId));
        const found = lessons.find(
          (candidate) => candidate.courseId === args.where.chapter.courseId && candidate.practice,
        );
        return found ? { id: "practice" } : null;
      }
      calls.push("findFirst");
      const first = candidates(args)[0] ?? null;
      if (first) pgnsRead += 1;
      return first;
    },
    async findMany(args: CandidatesQuery) {
      calls.push("findMany");
      const rows = candidates(args);
      pgnsRead += rows.length;
      return rows;
    },
  };
  // Cast: Prisma's delegate has every method, generic over its query, and the
  // fake answers only the two calls `courseHasContent` makes.
  const db = { lesson } as unknown as CourseContentReader;
  return { db, calls, pgnsRead: () => pgnsRead };
}

const inCourse = (kinds: Kind[], courseId = COURSE): StoredLesson[] =>
  kinds.map((kind) => ({ courseId, ...KINDS[kind] }));

/** Every sequence of up to `length` kinds, repeats included: 1 + 8 + 64 + 512 courses for 3. */
function sequences(length: number): Kind[][] {
  if (length === 0) return [[]];
  const shorter = sequences(length - 1);
  const longest = shorter.filter((sequence) => sequence.length === length - 1);
  return [...shorter, ...longest.flatMap((sequence) => KIND_NAMES.map((kind) => [...sequence, kind]))];
}

describe("courseHasContent", () => {
  it("responde lo mismo que la regla de siempre, en cualquier curso de hasta tres lecciones y en cualquier orden", async () => {
    const courses = sequences(3);
    expect(courses).toHaveLength(1 + 8 + 64 + 512);
    for (const kinds of courses) {
      const expected = oldRule([{ lessons: kinds.map((kind) => KINDS[kind]) }]);
      expect(await courseHasContent(reader(inCourse(kinds)).db, COURSE), kinds.join(", ")).toBe(expected);
    }
  });

  it("da igual en qué capítulo esté la lección: cuenta el curso entero", async () => {
    const chapters = [{ lessons: [KINDS.justCreated] }, { lessons: [KINDS.blank, KINDS.linked] }];
    expect(oldRule(chapters)).toBe(true);
    expect(await courseHasContent(reader(inCourse(["justCreated", "blank", "linked"])).db, COURSE)).toBe(true);
  });

  it("sólo mira las lecciones del curso", async () => {
    const lessons = [...inCourse(["justCreated", "emptyGame"]), ...inCourse(["own"], OTHER_COURSE)];
    expect(await courseHasContent(reader(lessons).db, COURSE)).toBe(false);
    expect(await courseHasContent(reader(lessons).db, OTHER_COURSE)).toBe(true);
  });

  it("con contenido, lee un solo PGN: el de la primera lección que lo tiene", async () => {
    const { db, calls, pgnsRead } = reader(inCourse(["justCreated", "emptyGame", "linked", "own", "linkedKeepingOwn"]));
    expect(await courseHasContent(db, COURSE)).toBe(true);
    expect(calls).toEqual(["findFirst"]);
    expect(pgnsRead()).toBe(1);
  });

  it("sin ninguna lección con PGN, no lee ninguno, y pregunta por una de práctica antes de decir que no", async () => {
    const { db, calls, pgnsRead } = reader(inCourse(["justCreated", "emptyGame", "justCreated"]));
    expect(await courseHasContent(db, COURSE)).toBe(false);
    expect(calls).toEqual(["findFirst", "findPractice"]);
    expect(pgnsRead()).toBe(0);
  });

  it("una lección sólo de práctica —sin partida, con un ejercicio publicado— es contenido (D25)", async () => {
    const lessons: StoredLesson[] = [{ courseId: COURSE, ...KINDS.justCreated, practice: true }];
    const { db, calls } = reader(lessons);
    expect(await courseHasContent(db, COURSE)).toBe(true);
    expect(calls).toEqual(["findFirst", "findPractice"]);
    // In another course it counts for nothing.
    expect(await courseHasContent(reader(lessons).db, OTHER_COURSE)).toBe(false);
  });

  it("con la bandera apagada, una lección sólo de práctica no es contenido: el alumno no vería nada", async () => {
    flags.exercises = false;
    const lessons: StoredLesson[] = [{ courseId: COURSE, ...KINDS.justCreated, practice: true }];
    const { db, calls } = reader(lessons);
    expect(await courseHasContent(db, COURSE)).toBe(false);
    // It does not even ask: the answer is known.
    expect(calls).toEqual(["findFirst"]);
    // A lesson with a PGN is content whatever the flag says.
    expect(await courseHasContent(reader(inCourse(["own"])).db, COURSE)).toBe(true);
  });

  it("con PGN en blanco y sin ejercicios publicados, no se publica", async () => {
    const { db, calls } = reader(inCourse(["blank", "unicodeBlank"]));
    expect(await courseHasContent(db, COURSE)).toBe(false);
    expect(calls).toEqual(["findFirst", "findMany", "findPractice"]);
  });

  it("si la primera está en blanco, mira las demás antes de responder", async () => {
    const { db, calls } = reader(inCourse(["blank", "unicodeBlank", "own"]));
    expect(await courseHasContent(db, COURSE)).toBe(true);
    expect(calls).toEqual(["findFirst", "findMany"]);
  });

  it("un curso sin lecciones no se puede publicar", async () => {
    expect(await courseHasContent(reader([]).db, COURSE)).toBe(false);
  });
});
