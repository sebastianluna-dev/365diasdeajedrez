import { ACTIVITY_TYPE, SUBJECT_TYPE } from "../constants/platform/activity-codes.const";
import { EXERCISE_KIND, EXERCISE_STATUS, type ExerciseKindCode } from "../constants/platform/exercise-codes.const";
import { TOPIC, type TopicCode } from "../constants/platform/shared-codes.const";
import { ATTEMPT_CONTEXT } from "../constants/platform/training-codes.const";
import { readSolution, replayAttempt, type AttemptOutcome, type PlayedMove } from "../lib/chess/exercise-solver";
import { createPositionHash } from "../lib/chess/position-hash";
import type { PrismaClient } from "../lib/platform-db/generated/client";
import { syncCatalogJoin } from "../services/shared/catalog-join.service";
import { rebuildUserExerciseState } from "../services/shared/exercise-attempt.service";
import { exerciseActivityTopic } from "../services/shared/exercise-activity-topic";
import { exerciseKindIds, exerciseSolutionColumns } from "../services/shared/exercise-record.service";
import { IDS } from "./seed-data";

// The exercises demo (planning/ejercicios, phases 1 and 4): five exercises of
// `profesor.demo` — three READY, one IN_REVIEW (proposed to the library) and
// one returned by the staff with a note (READY again, D16); his series
// «Táctica de la semana» with the five, given to `alumno.demo`; three attempts
// of the student — one clean, one failed at the first move with its mistake,
// one with a hint — so the student's «Ejercicios», the series' marks,
// «Ejercicios superados» and the teacher's view of attempts have something to
// show; and, from phase 4, four academy exercises PUBLISHED (the library, D32)
// and the academy's published series «Mates y golpes tácticos» with the four.
//
// The seed is the documented exception to the single writers (docs →
// Platform → Data model, «Exercises»): the rows go by fixed id, the solution
// spreads `exerciseSolutionColumns` as the writers do, the status is written
// as seeded data, the attempts are stored with the outcome the server's
// replay gives their moves (`replayAttempt`), the states are folded by
// `rebuildUserExerciseState` and the two EXERCISE_PASSED activities go by
// fixed id, before the daily stats are rebuilt. prisma/seed-exercises.test.ts
// checks every solution with `analyzeSolution` and every attempt's replay.

const DAY_MS = 24 * 60 * 60 * 1000;

export const EXERCISE_IDS = {
  backRank: "dmEjer01",
  smothered: "dmEjer02",
  blackBackRank: "dmEjer03",
  knightFork: "dmEjer04",
  skewer: "dmEjer05",
  academyBackRank: "dmEjer06",
  academySmothered: "dmEjer07",
  academyFork: "dmEjer08",
  academySkewer: "dmEjer09",
  series: "dmSerie1",
  academySeries: "dmSerie2",
  seriesShare: "e2000000-0000-4000-8000-000000000001",
  attemptClean: "e3000000-0000-4000-8000-000000000001",
  attemptFailed: "e3000000-0000-4000-8000-000000000002",
  attemptHinted: "e3000000-0000-4000-8000-000000000003",
  mistakeFailed: "e4000000-0000-4000-8000-000000000001",
  activityClean: "ac000000-0000-4000-8000-000000000010",
  activityHinted: "ac000000-0000-4000-8000-000000000011",
} as const;

export interface DemoExercise {
  id: string;
  title: string;
  prompt: string | null;
  kind: ExerciseKindCode;
  mateIn: number | null;
  difficulty: number;
  topics: TopicCode[];
  hints: string[];
  explanation: string | null;
  solutionPgn: string;
  sourceWhite?: string;
  sourceBlack?: string;
  sourceYear?: number;
}

const setUp = (fen: string, moves: string) => `[SetUp "1"]\n[FEN "${fen}"]\n\n${moves} *`;

export const DEMO_EXERCISES: DemoExercise[] = [
  {
    id: EXERCISE_IDS.backRank,
    title: "El pasillo abierto",
    prompt: null,
    kind: EXERCISE_KIND.MATE_IN,
    mateIn: 1,
    difficulty: 800,
    topics: [TOPIC.BACK_RANK_MATE],
    hints: [],
    explanation: "El rey negro no tiene casillas de escape: sus propios peones le cierran la salida.",
    solutionPgn: setUp("6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1", "1. Rd8#"),
  },
  {
    id: EXERCISE_IDS.smothered,
    title: "El mate de Philidor",
    prompt: null,
    kind: EXERCISE_KIND.MATE_IN,
    mateIn: 2,
    difficulty: 1400,
    topics: [TOPIC.MATING_ATTACK, TOPIC.SACRIFICE],
    hints: [],
    explanation:
      "La dama se entrega en g8 para que la torre tape la última casilla del rey: el caballo da mate ahogado en f7.",
    solutionPgn: setUp("r6k/6pp/7N/8/2Q5/8/6PP/6K1 w - - 0 1", "1. Qg8+ Rxg8 2. Nf7#"),
  },
  {
    id: EXERCISE_IDS.blackBackRank,
    title: "Mate de las negras",
    prompt: null,
    kind: EXERCISE_KIND.MATE_IN,
    mateIn: 1,
    difficulty: 900,
    topics: [TOPIC.BACK_RANK_MATE],
    hints: [],
    explanation: null,
    solutionPgn: setUp("3r2k1/5ppp/8/8/8/8/5PPP/6K1 b - - 0 1", "1... Rd1#"),
  },
  {
    id: EXERCISE_IDS.knightFork,
    title: "Horquilla de caballo",
    prompt: "Juegan blancas y ganan la dama",
    kind: EXERCISE_KIND.SEQUENCE,
    mateIn: null,
    difficulty: 1100,
    topics: [TOPIC.FORK],
    hints: [],
    explanation: "El caballo ataca al rey y a la dama a la vez: el rey tiene que moverse y la dama cae.",
    // The defence has a variant: whichever way the king goes, the queen falls.
    solutionPgn: setUp("q3k3/8/8/1N6/8/8/8/4K3 w - - 0 1", "1. Nc7+ Kd7 (1... Kd8 2. Nxa8) 2. Nxa8"),
  },
  {
    id: EXERCISE_IDS.skewer,
    title: "La enfilada en la columna",
    prompt: "Juegan blancas y ganan la dama",
    kind: EXERCISE_KIND.SEQUENCE,
    mateIn: null,
    difficulty: 1250,
    topics: [TOPIC.SKEWER],
    hints: [
      "Busca un jaque que deje al rey y a la dama en la misma línea.",
      "La torre puede dar jaque en la columna e.",
    ],
    explanation:
      "Re1+ es una enfilada: el rey tiene que apartarse de la columna e y la torre gana la dama que estaba detrás.",
    solutionPgn: setUp("4q3/8/8/4k3/8/8/8/R6K w - - 0 1", "1. Re1+ Kd6 2. Rxe8"),
  },
];

/**
 * What the library's review left on the teacher's exercises (phase 4, D16):
 * one proposed and waiting, one returned with the staff's note.
 */
export const DEMO_REVIEW = {
  /** «Horquilla de caballo», IN_REVIEW: proposed two days ago. */
  inReview: { exerciseId: EXERCISE_IDS.knightFork, submittedDaysAgo: 2 },
  /** «La enfilada en la columna», READY again: proposed three days ago, returned yesterday with a note. */
  returned: {
    exerciseId: EXERCISE_IDS.skewer,
    submittedDaysAgo: 3,
    reviewedDaysAgo: 1,
    note: "Explica por qué el rey no puede quedarse en la columna e: así el alumno entiende la enfilada, no sólo la jugada.",
  },
} as const;

/** The academy's four, PUBLISHED (the library, D32): what free practice and the academy's series serve. */
export const ACADEMY_EXERCISES: DemoExercise[] = [
  {
    id: EXERCISE_IDS.academyBackRank,
    title: "La dama en la octava",
    prompt: null,
    kind: EXERCISE_KIND.MATE_IN,
    mateIn: 1,
    difficulty: 700,
    topics: [TOPIC.BACK_RANK_MATE],
    hints: ["La última fila está abierta."],
    explanation: "Los peones de f7, g7 y h7 encierran a su propio rey: la dama entra en la octava y no hay escape.",
    solutionPgn: setUp("6k1/5ppp/8/8/8/8/5PPP/2Q3K1 w - - 0 1", "1. Qc8#"),
  },
  {
    id: EXERCISE_IDS.academySmothered,
    title: "El mate ahogado de las negras",
    prompt: null,
    kind: EXERCISE_KIND.MATE_IN,
    mateIn: 2,
    difficulty: 1500,
    topics: [TOPIC.MATING_ATTACK, TOPIC.SACRIFICE],
    hints: [],
    explanation:
      "La dama se entrega en g1 para que la torre tape la única casilla del rey; el caballo da mate ahogado en f2.",
    solutionPgn: setUp("6k1/6pp/8/2q5/8/7n/6PP/R6K b - - 0 1", "1... Qg1+ 2. Rxg1 Nf2#"),
  },
  {
    id: EXERCISE_IDS.academyFork,
    title: "El caballo salta a e6",
    prompt: "Juegan blancas y ganan la torre",
    kind: EXERCISE_KIND.SEQUENCE,
    mateIn: null,
    difficulty: 1200,
    topics: [TOPIC.FORK],
    hints: ["Busca un jaque que ataque dos piezas a la vez."],
    explanation:
      "Ce6+ da jaque y ataca la torre de d8: el alfil de b3 protege al caballo, así que el rey no puede capturarlo.",
    solutionPgn: setUp(
      "3r1k2/8/8/8/5N2/1B6/8/4K3 w - - 0 1",
      "1. Ne6+ Kf7 (1... Ke8 2. Nxd8) (1... Kg8 2. Nxd8) (1... Ke7 2. Nxd8) 2. Nxd8+",
    ),
  },
  {
    id: EXERCISE_IDS.academySkewer,
    title: "La enfilada en la octava",
    prompt: "Juegan blancas y ganan la torre",
    kind: EXERCISE_KIND.SEQUENCE,
    mateIn: null,
    difficulty: 1000,
    topics: [TOPIC.SKEWER],
    hints: [],
    explanation: "Dd8+ pone al rey y a la torre en la misma fila: el rey tiene que apartarse y la torre de h8 cae.",
    solutionPgn: setUp("k6r/8/8/8/8/8/8/K2Q4 w - - 0 1", "1. Qd8+ Ka7 (1... Kb7 2. Qxh8) 2. Qxh8"),
  },
];

/** «Mates y golpes tácticos», the academy's series with its four, published for every student (D32). */
export const ACADEMY_SERIES = {
  id: EXERCISE_IDS.academySeries,
  title: "Mates y golpes tácticos",
  description: "Cuatro posiciones de la biblioteca para empezar: dos mates, una horquilla y una enfilada.",
  items: [
    EXERCISE_IDS.academyBackRank,
    EXERCISE_IDS.academySkewer,
    EXERCISE_IDS.academyFork,
    EXERCISE_IDS.academySmothered,
  ],
  publishedDaysAgo: 4,
} as const;

/** «Táctica de la semana», the teacher's series with the five, given to the demo student. */
export const DEMO_SERIES = {
  id: EXERCISE_IDS.series,
  title: "Táctica de la semana",
  description: "Cinco posiciones para calentar antes de la clase: mates en una y en dos, una horquilla y una enfilada.",
  items: [
    EXERCISE_IDS.backRank,
    EXERCISE_IDS.smothered,
    EXERCISE_IDS.blackBackRank,
    EXERCISE_IDS.knightFork,
    EXERCISE_IDS.skewer,
  ],
  shareId: EXERCISE_IDS.seriesShare,
  sharedDaysAgo: 5,
} as const;

export interface DemoExerciseAttempt {
  id: string;
  exerciseId: string;
  daysAgo: number;
  /** The player's moves up to the decision, as the solve screen sends them. */
  moves: PlayedMove[];
  hintsUsed: number;
  solutionShown: boolean;
  durationMs: number;
  /** The fixed id of its mistake, when it has one. */
  mistakeId?: string;
  /** The fixed id of its EXERCISE_PASSED activity, when it was the first pass. */
  activityId?: string;
}

/** Three of the five, in the series: so two of them are still untried by the student. */
export const DEMO_EXERCISE_ATTEMPTS: DemoExerciseAttempt[] = [
  {
    id: EXERCISE_IDS.attemptClean,
    exerciseId: EXERCISE_IDS.backRank,
    daysAgo: 3,
    moves: [{ san: "Rd8#", hintsBefore: 0 }],
    hintsUsed: 0,
    solutionShown: false,
    durationMs: 14_000,
    activityId: EXERCISE_IDS.activityClean,
  },
  {
    // The knight first: check, but the king escapes to g8. The first wrong move decides (D19).
    id: EXERCISE_IDS.attemptFailed,
    exerciseId: EXERCISE_IDS.smothered,
    daysAgo: 2,
    moves: [{ san: "Nf7+", hintsBefore: 0 }],
    hintsUsed: 0,
    solutionShown: false,
    durationMs: 41_000,
    mistakeId: EXERCISE_IDS.mistakeFailed,
  },
  {
    id: EXERCISE_IDS.attemptHinted,
    exerciseId: EXERCISE_IDS.knightFork,
    daysAgo: 1,
    moves: [
      { san: "Nc7+", hintsBefore: 1 },
      { san: "Nxa8", hintsBefore: 1 },
    ],
    hintsUsed: 1,
    solutionShown: false,
    durationMs: 52_000,
    activityId: EXERCISE_IDS.activityHinted,
  },
];

/** The outcome the server's replay gives an attempt's moves, or null when it would refuse them. */
export function demoAttemptOutcome(attempt: DemoExerciseAttempt): AttemptOutcome | null {
  const exercise = DEMO_EXERCISES.find((candidate) => candidate.id === attempt.exerciseId);
  if (!exercise) return null;
  const solution = readSolution(exercise);
  if (!solution) return null;
  const replay = replayAttempt(solution, attempt);
  return replay.ok ? replay.outcome : null;
}

function idOf(ids: ReadonlyMap<string, number>, code: string, catalog: string): number {
  const id = ids.get(code);
  if (id === undefined) throw new Error(`${catalog} not seeded: ${code}`);
  return id;
}

/**
 * Seeds the exercises demo. Idempotent: every row by its fixed id (the series'
 * items and share by their keys), so seeding again rewrites the same rows.
 * Runs after the catalogs, the topics, the teacher and his assignment with
 * the demo student, and before `rebuildDailyStats`.
 */
export async function seedExercises(
  db: PrismaClient,
  now: Date,
  catalogs: {
    exerciseStatus: ReadonlyMap<string, number>;
    attemptResult: ReadonlyMap<string, number>;
    attemptContext: ReadonlyMap<string, number>;
    activityType: ReadonlyMap<string, number>;
    subjectType: ReadonlyMap<string, number>;
  },
): Promise<void> {
  const kindIds = await exerciseKindIds(db);
  const statusId = (code: string) => idOf(catalogs.exerciseStatus, code, "ExerciseStatus");
  const ago = (days: number) => new Date(now.getTime() - days * DAY_MS);

  /** The review's columns of a teacher's exercise (phase 4, D16): proposed and waiting, returned with a note, or neither. */
  const reviewOf = (exerciseId: string) => {
    if (exerciseId === DEMO_REVIEW.inReview.exerciseId) {
      return {
        statusId: statusId(EXERCISE_STATUS.IN_REVIEW),
        submittedAt: ago(DEMO_REVIEW.inReview.submittedDaysAgo),
        reviewedAt: null,
        reviewedById: null,
        reviewNote: null,
      };
    }
    if (exerciseId === DEMO_REVIEW.returned.exerciseId) {
      return {
        statusId: statusId(EXERCISE_STATUS.READY),
        submittedAt: ago(DEMO_REVIEW.returned.submittedDaysAgo),
        reviewedAt: ago(DEMO_REVIEW.returned.reviewedDaysAgo),
        reviewedById: IDS.staffUser,
        reviewNote: DEMO_REVIEW.returned.note,
      };
    }
    // The seeded fact: ready for his students, never proposed to the library.
    return {
      statusId: statusId(EXERCISE_STATUS.READY),
      submittedAt: null,
      reviewedAt: null,
      reviewedById: null,
      reviewNote: null,
    };
  };

  const contentOf = (exercise: DemoExercise) => ({
    ...exerciseSolutionColumns(
      { solutionPgn: exercise.solutionPgn, kind: exercise.kind, mateIn: exercise.mateIn },
      kindIds,
    ),
    title: exercise.title,
    prompt: exercise.prompt,
    difficulty: exercise.difficulty,
    hints: exercise.hints,
    explanation: exercise.explanation,
    sourceWhite: exercise.sourceWhite ?? null,
    sourceBlack: exercise.sourceBlack ?? null,
    sourceYear: exercise.sourceYear ?? null,
  });

  for (const exercise of DEMO_EXERCISES) {
    const data = {
      ...contentOf(exercise),
      teacherId: IDS.teacher,
      authorUserId: IDS.teacherUser,
      ...reviewOf(exercise.id),
    };
    await db.exercise.upsert({ where: { id: exercise.id }, update: data, create: { id: exercise.id, ...data } });
    await syncCatalogJoin(db.exerciseTopic, db.topic, {
      parent: { exerciseId: exercise.id },
      catalogColumn: "topicId",
      codes: exercise.topics,
    });
  }

  // The academy's four, in the library (D32): PUBLISHED as seeded data, with the first publication's stamp.
  for (const [index, exercise] of ACADEMY_EXERCISES.entries()) {
    const data = {
      ...contentOf(exercise),
      teacherId: null,
      authorUserId: IDS.staffUser,
      statusId: statusId(EXERCISE_STATUS.PUBLISHED),
      publishedAt: ago(ACADEMY_SERIES.publishedDaysAgo + index + 1),
      reviewedAt: ago(ACADEMY_SERIES.publishedDaysAgo + index + 1),
      reviewedById: IDS.staffUser,
    };
    await db.exercise.upsert({ where: { id: exercise.id }, update: data, create: { id: exercise.id, ...data } });
    await syncCatalogJoin(db.exerciseTopic, db.topic, {
      parent: { exerciseId: exercise.id },
      catalogColumn: "topicId",
      codes: exercise.topics,
    });
  }

  const academySeriesData = {
    teacherId: null,
    title: ACADEMY_SERIES.title,
    description: ACADEMY_SERIES.description,
    createdById: IDS.staffUser,
    publishedAt: ago(ACADEMY_SERIES.publishedDaysAgo),
  };
  await db.exerciseSeries.upsert({
    where: { id: ACADEMY_SERIES.id },
    update: academySeriesData,
    create: { id: ACADEMY_SERIES.id, ...academySeriesData },
  });
  await db.exerciseSeriesItem.deleteMany({ where: { seriesId: ACADEMY_SERIES.id } });
  await db.exerciseSeriesItem.createMany({
    data: ACADEMY_SERIES.items.map((exerciseId, index) => ({
      seriesId: ACADEMY_SERIES.id,
      exerciseId,
      order: index + 1,
    })),
  });

  const seriesData = {
    teacherId: IDS.teacher,
    title: DEMO_SERIES.title,
    description: DEMO_SERIES.description,
    createdById: IDS.teacherUser,
  };
  await db.exerciseSeries.upsert({
    where: { id: DEMO_SERIES.id },
    update: seriesData,
    create: { id: DEMO_SERIES.id, ...seriesData },
  });
  // The items are rewritten whole: an order left by an earlier seed would collide with `seriesId_order`.
  await db.exerciseSeriesItem.deleteMany({ where: { seriesId: DEMO_SERIES.id } });
  await db.exerciseSeriesItem.createMany({
    data: DEMO_SERIES.items.map((exerciseId, index) => ({ seriesId: DEMO_SERIES.id, exerciseId, order: index + 1 })),
  });
  await db.exerciseSeriesShare.upsert({
    where: { seriesId_userId: { seriesId: DEMO_SERIES.id, userId: IDS.demoUser } },
    update: { teacherId: IDS.teacher },
    create: {
      id: DEMO_SERIES.shareId,
      seriesId: DEMO_SERIES.id,
      userId: IDS.demoUser,
      teacherId: IDS.teacher,
      createdAt: ago(DEMO_SERIES.sharedDaysAgo),
    },
  });

  const [topicRows, exerciseTopics] = await Promise.all([
    db.topic.findMany({ select: { id: true, parentId: true, order: true } }),
    db.exerciseTopic.findMany({
      where: { exerciseId: { in: DEMO_EXERCISES.map((exercise) => exercise.id) } },
      select: { exerciseId: true, topicId: true },
    }),
  ]);

  for (const attempt of DEMO_EXERCISE_ATTEMPTS) {
    const outcome = demoAttemptOutcome(attempt);
    if (!outcome) throw new Error(`The demo attempt ${attempt.id} does not replay`);
    const createdAt = ago(attempt.daysAgo);
    const data = {
      userId: IDS.demoUser,
      exerciseId: attempt.exerciseId,
      seriesId: DEMO_SERIES.id,
      resultId: idOf(catalogs.attemptResult, outcome.result, "AttemptResult"),
      contextId: idOf(catalogs.attemptContext, ATTEMPT_CONTEXT.SERIES, "AttemptContext"),
      mistakes: outcome.mistake ? 1 : 0,
      durationMs: attempt.durationMs,
      requiredMoves: outcome.requiredMoves,
      correctMoves: outcome.correctMoves,
      reachedPly: outcome.reachedPly,
      hintsUsed: outcome.hintsUsed,
      solutionShown: outcome.solutionShown,
      isPerfect: outcome.isPerfect,
      createdAt,
    };
    await db.trainingAttempt.upsert({ where: { id: attempt.id }, update: data, create: { id: attempt.id, ...data } });

    if (outcome.mistake && attempt.mistakeId) {
      const mistake = {
        attemptId: attempt.id,
        positionHash: createPositionHash(outcome.mistake.fen),
        fen: outcome.mistake.fen,
        expectedSan: outcome.mistake.expectedSan,
        playedSan: outcome.mistake.playedSan,
        ply: outcome.mistake.ply,
        usedHint: outcome.mistake.hintShownBefore,
        createdAt,
      };
      await db.trainingMistake.upsert({
        where: { id: attempt.mistakeId },
        update: mistake,
        create: { id: attempt.mistakeId, ...mistake },
      });
    }

    if (outcome.result === "PASSED" && attempt.activityId) {
      const activity = {
        userId: IDS.demoUser,
        typeId: idOf(catalogs.activityType, ACTIVITY_TYPE.EXERCISE_PASSED, "ActivityType"),
        subjectTypeId: idOf(catalogs.subjectType, SUBJECT_TYPE.EXERCISE, "SubjectType"),
        subjectId: attempt.exerciseId,
        topicId: exerciseActivityTopic(
          exerciseTopics.filter((row) => row.exerciseId === attempt.exerciseId).map((row) => row.topicId),
          topicRows,
        ),
        occurredAt: createdAt,
      };
      await db.userActivity.upsert({
        where: { id: attempt.activityId },
        update: activity,
        create: { id: attempt.activityId, ...activity },
      });
    }
  }

  // The student's standing with each exercise, folded from the attempts with the writer's own rules.
  await rebuildUserExerciseState(db, IDS.demoUser);
}
