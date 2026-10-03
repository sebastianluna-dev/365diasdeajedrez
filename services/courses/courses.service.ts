import { cache } from "react";
import { COURSE_STATUS } from "@/constants/platform/course-codes.const";
import { MOVE_TRAINER_ENABLED } from "@/constants/platform/features.const";
import { PROGRESS_STATUS, type ProgressStatusCode } from "@/constants/platform/shared-codes.const";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { gameMoves, type GameMoves } from "@/lib/chess/game-moves";
import { lessonPgnOf, lessonPgnSelect } from "@/services/shared/lesson-pgn";
import { isCourseId } from "./course-rules";
import {
  courseContentInclude,
  courseDetailInclude,
  mapChapterOutline,
  mapChapterView,
  mapCourseDetail,
  mapCourseLevel,
  mapCourseSummary,
  mapLessonView,
  mapMyCourse,
  type UserCourseState,
} from "./courses.mapper";
import type {
  ChapterOutline,
  ChapterView,
  CourseDetail,
  CourseLevelItem,
  CourseSummary,
  LessonView,
  MyCourseItem,
} from "./courses.types";

// Full listing: "Mis cursos" and the catalog use it, and both need them all —
// the first keeps the ones the student added, which is known once it is read.
const getPublishedCourses = cache(async () => {
  const db = getPlatformDb();
  return db.course.findMany({
    where: { status: { code: COURSE_STATUS.PUBLISHED } },
    orderBy: { name: "asc" },
    include: courseContentInclude,
    // One round trip for the course and its eleven nested relations, not twelve.
    relationLoadStrategy: "join",
  });
});

// Targeted query for the single-course views (detail, chapter and lesson):
// cache() deduplicates by slug within the same request. The detail include is
// a superset of the content one, so the chapter and lesson mappers take it too.
const getPublishedCourse = cache(async (courseId: string) => {
  const db = getPlatformDb();
  return db.course.findFirst({
    where: { id: courseId, status: { code: COURSE_STATUS.PUBLISHED } },
    include: courseDetailInclude,
    relationLoadStrategy: "join",
  });
});

/** The same course by its slug, which is how its information page is addressed. */
const getPublishedCourseBySlug = cache(async (slug: string) => {
  const db = getPlatformDb();
  return db.course.findFirst({
    where: { slug, status: { code: COURSE_STATUS.PUBLISHED } },
    include: courseDetailInclude,
    relationLoadStrategy: "join",
  });
});

/** The user's progress narrowed to one course, for the detail views. */
const getCourseProgressState = cache(async (courseId: string): Promise<UserCourseState> => {
  const db = getPlatformDb();
  const user = await getCurrentUser();

  const [lessonRows, courseRow, settings] = await Promise.all([
    db.lessonProgress.findMany({
      where: { userId: user.id, lesson: { chapter: { courseId } } },
      select: { lessonId: true, status: { select: { code: true } } },
      relationLoadStrategy: "join",
    }),
    db.courseProgress.findUnique({
      where: { userId_courseId: { userId: user.id, courseId } },
      select: { lastLessonId: true, status: { select: { code: true } } },
      relationLoadStrategy: "join",
    }),
    // The course settings go into the STATE and are not queried separately: they
    // are "what this student has in this course", just like their progress, and
    // that way there is a single place that reads them.
    db.userCourseSettings.findUnique({
      where: { userId_courseId: { userId: user.id, courseId } },
      select: { onlyPriorityLessons: true, boardOrientation: { select: { code: true } } },
      relationLoadStrategy: "join",
    }),
  ]);

  return {
    lessonStatus: new Map(lessonRows.map((row) => [row.lessonId, row.status.code as ProgressStatusCode])),
    courseStatus: courseRow?.status.code as ProgressStatusCode | undefined,
    lastLessonId: courseRow?.lastLessonId ?? undefined,
    onlyPriorityLessons: settings?.onlyPriorityLessons ?? false,
    boardOrientationCode: settings?.boardOrientation.code,
  };
});

const getUserProgressState = cache(async (): Promise<Map<string, UserCourseState>> => {
  const db = getPlatformDb();
  const user = await getCurrentUser();

  const [lessonRows, courseRows, settingsRows] = await Promise.all([
    db.lessonProgress.findMany({
      where: { userId: user.id },
      select: {
        lessonId: true,
        status: { select: { code: true } },
        lesson: { select: { chapter: { select: { courseId: true } } } },
      },
      relationLoadStrategy: "join",
    }),
    db.courseProgress.findMany({
      where: { userId: user.id },
      select: { courseId: true, lastLessonId: true, status: { select: { code: true } } },
      relationLoadStrategy: "join",
    }),
    db.userCourseSettings.findMany({
      where: { userId: user.id },
      select: { courseId: true, onlyPriorityLessons: true, boardOrientation: { select: { code: true } } },
      relationLoadStrategy: "join",
    }),
  ]);

  const byCourse = new Map<string, UserCourseState>();
  const stateFor = (courseId: string): UserCourseState => {
    let state = byCourse.get(courseId);
    if (!state) {
      state = { lessonStatus: new Map(), onlyPriorityLessons: false };
      byCourse.set(courseId, state);
    }
    return state;
  };

  for (const row of settingsRows) {
    const state = stateFor(row.courseId);
    state.onlyPriorityLessons = row.onlyPriorityLessons;
    state.boardOrientationCode = row.boardOrientation.code;
  }
  for (const row of courseRows) {
    const state = stateFor(row.courseId);
    state.courseStatus = row.status.code as ProgressStatusCode;
    state.lastLessonId = row.lastLessonId ?? undefined;
  }
  for (const row of lessonRows) {
    stateFor(row.lesson.chapter.courseId).lessonStatus.set(row.lessonId, row.status.code as ProgressStatusCode);
  }
  return byCourse;
});

const EMPTY_STATE: UserCourseState = { lessonStatus: new Map(), onlyPriorityLessons: false };

/**
 * Every published course, each with what the student has in it: the catalog
 * where the ones to add are found. The ones already added come too, marked,
 * so a course does not vanish from where it was found the day it is added.
 */
export async function getCourseCatalog(): Promise<CourseSummary[]> {
  const [courses, progress] = await Promise.all([getPublishedCourses(), getUserProgressState()]);
  return courses.map((course) => mapCourseSummary(course, progress.get(course.id) ?? EMPTY_STATE));
}

/**
 * What «Repasar» trains in each course, by course id: `getReviewCount` for
 * every course at once. One query over the lessons the student learned that
 * have exercises, added up by course, instead of a count per row of the list.
 */
async function getReviewCounts(): Promise<Map<string, number>> {
  // With the trainer off there is nothing to review: no course has a count.
  if (!MOVE_TRAINER_ENABLED) return new Map();

  const user = await getCurrentUser();
  const lessons = await getPlatformDb().lesson.findMany({
    where: {
      exercises: { some: {} },
      progresses: { some: { userId: user.id, status: { code: PROGRESS_STATUS.COMPLETED } } },
    },
    select: { chapter: { select: { courseId: true } }, _count: { select: { exercises: true } } },
    relationLoadStrategy: "join",
  });

  const counts = new Map<string, number>();
  for (const lesson of lessons) {
    const { courseId } = lesson.chapter;
    counts.set(courseId, (counts.get(courseId) ?? 0) + lesson._count.exercises);
  }
  return counts;
}

/**
 * "Mis cursos": of the published courses, the ones the student added, each
 * with its next lesson to learn and what there is to review in it.
 */
export async function getUserCourses(): Promise<MyCourseItem[]> {
  const [courses, progress, reviewCounts] = await Promise.all([
    getPublishedCourses(),
    getUserProgressState(),
    getReviewCounts(),
  ]);
  return courses
    .map((course) =>
      mapMyCourse(course, progress.get(course.id) ?? EMPTY_STATE, { reviewCount: reviewCounts.get(course.id) }),
    )
    .filter((course) => course.isAdded);
}

/**
 * The levels the catalog can be filtered by: the ones in use, the easiest
 * first. They are read whole and not only the ones some course has, so the
 * filter reads the same every day; a level without courses says so when chosen.
 *
 * Nothing here looks at the student's rating: the levels guide whoever
 * chooses, they do not decide what anybody may open.
 */
export async function listCourseLevels(): Promise<CourseLevelItem[]> {
  // Session border, like every read of the private area.
  await getCurrentUser();
  const levels = await getPlatformDb().level.findMany({
    where: { isActive: true },
    select: { slug: true, name: true, description: true, eloMin: true, eloMax: true },
    orderBy: [{ order: "asc" }, { eloMin: "asc" }, { name: "asc" }],
  });
  return levels.map(mapCourseLevel);
}

/**
 * The "Continuar estudiando" course of the dashboard: the first one in
 * progress, by name, which is the same order as "Mis cursos". It is located
 * with a query targeted at the progress and then ONLY that course is loaded,
 * instead of bringing the whole catalog with chapters and lessons to keep one.
 */
export async function getContinueStudyingCourse(): Promise<(CourseSummary & { lastLessonName?: string }) | null> {
  const db = getPlatformDb();
  const user = await getCurrentUser();

  const row = await db.courseProgress.findFirst({
    where: {
      userId: user.id,
      status: { code: PROGRESS_STATUS.IN_PROGRESS },
      course: { status: { code: COURSE_STATUS.PUBLISHED } },
    },
    orderBy: { course: { name: "asc" } },
    select: { courseId: true, lastLesson: { select: { name: true } } },
    relationLoadStrategy: "join",
  });
  if (!row) return null;

  const [course, progress] = await Promise.all([
    getPublishedCourse(row.courseId),
    getCourseProgressState(row.courseId),
  ]);
  if (!course) return null;
  return { ...mapCourseSummary(course, progress), lastLessonName: row.lastLesson?.name };
}

/**
 * What «Repasar» trains: the exercises of the lessons of the course the
 * student has already LEARNED. It counts what CAN be reviewed, not what is
 * due: the trainer's review schedule (`UserLessonTraining`) is not looked at
 * here, so the figure does not go down after a session.
 */
const getReviewCount = cache(async (courseId: string): Promise<number> => {
  // With the trainer off there is nothing to review, and «Repasar» is only
  // drawn for a count above zero.
  if (!MOVE_TRAINER_ENABLED) return 0;

  const user = await getCurrentUser();
  return getPlatformDb().trainingExercise.count({
    where: {
      lesson: {
        chapter: { courseId },
        progresses: { some: { userId: user.id, status: { code: PROGRESS_STATUS.COMPLETED } } },
      },
    },
  });
});

/**
 * A course's information page, by its slug. It is read by whoever has not
 * added the course — that is what it is for — so nothing here depends on
 * having progress in it.
 */
export async function getCourseInfo(slug: string): Promise<CourseDetail | null> {
  const course = await getPublishedCourseBySlug(slug);
  if (!course) return null;
  return mapCourseDetail(course, await getCourseProgressState(course.id));
}

/** The course to study, by its id: its chapters with the student's progress in each. */
export async function getCourseStudy(courseId: string): Promise<CourseDetail | null> {
  const [course, progress, reviewCount] = await Promise.all([
    getPublishedCourse(courseId),
    getCourseProgressState(courseId),
    getReviewCount(courseId),
  ]);
  if (!course) return null;
  return mapCourseDetail(course, progress, { reviewCount });
}

/**
 * Where `/cursos/<reference>` leads. The segment is an id or a slug and its
 * shape says which, but a slug may happen to be eight digits of a course
 * created before that was refused: an id nobody has is tried again as a slug.
 */
export async function resolveCourseReference(
  reference: string,
): Promise<{ kind: "study"; course: CourseDetail } | { kind: "info"; course: CourseDetail } | null> {
  if (isCourseId(reference)) {
    const course = await getCourseStudy(reference);
    if (course) return { kind: "study", course };
  }
  const course = await getCourseInfo(reference);
  return course ? { kind: "info", course } : null;
}

/**
 * The column beside a lesson: the chapter's lessons and the course around
 * them. It is what the chapter's own segment loads, once, while each lesson
 * loads its PGN underneath.
 *
 * It costs the course and the student's state and nothing else — neither the
 * PGNs of the chapter (which `getChapterView` does read, to show the moves of
 * each lesson) nor the lesson being read, which is not known here.
 */
export async function getChapterOutline(courseId: string, chapterOrder: number): Promise<ChapterOutline | null> {
  const [course, progress] = await Promise.all([getPublishedCourse(courseId), getCourseProgressState(courseId)]);
  return course ? mapChapterOutline(course, chapterOrder, progress) : null;
}

export async function getChapterView(courseId: string, chapterOrder: number): Promise<ChapterView | null> {
  const db = getPlatformDb();
  const [course, progress, reviewCount] = await Promise.all([
    getPublishedCourse(courseId),
    getCourseProgressState(courseId),
    getReviewCount(courseId),
  ]);
  if (!course) return null;

  // The chapter comes from the already loaded course: the include brings all of
  // its chapters, so resolving its order number does not cost one more query.
  const chapterId = course.chapters.find((chapter) => chapter.order === chapterOrder)?.id;
  if (!chapterId) return null;

  // The course is loaded WITHOUT the PGN of its lessons, which is most of its
  // weight; the list shows the moves of each lesson, so those of this chapter
  // alone are read here.
  const contents = await db.lesson.findMany({
    where: { chapterId },
    select: { id: true, ...lessonPgnSelect },
    relationLoadStrategy: "join",
  });
  const games = new Map<string, GameMoves>();
  for (const lesson of contents) {
    const game = gameMoves(lessonPgnOf(lesson));
    if (game) games.set(lesson.id, game);
  }

  return mapChapterView(course, chapterId, progress, { games, reviewCount });
}

/**
 * The lesson addresses itself (`/lecciones/02482009`), so the course does not
 * arrive through the URL: it is deduced from the lesson itself.
 *
 * That forces two round trips instead of one — first the lesson, then its
 * course — but it is the price of a link to a lesson not having to drag course
 * and chapter along. If the course is not published, the lesson is not served
 * either.
 */
export async function getLessonView(lessonId: string): Promise<LessonView | null> {
  const db = getPlatformDb();
  // Session border: the lesson is looked up by its bare id, so who is asking has
  // to be known BEFORE querying it. The student's settings are no longer read
  // here — they travel inside the course's state — but the border stays.
  await getCurrentUser();

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    select: {
      id: true,
      chapterId: true,
      name: true,
      description: true,
      order: true,
      isPriority: true,
      estimatedDuration: true,
      ...lessonPgnSelect,
      orientation: { select: { code: true } },
      exercises: { select: { id: true } },
      chapter: { select: { courseId: true } },
    },
    relationLoadStrategy: "join",
  });
  if (!lesson) return null;

  const courseId = lesson.chapter.courseId;
  // The settings already come inside the state; before they were queried separately here.
  const [course, progress] = await Promise.all([getPublishedCourse(courseId), getCourseProgressState(courseId)]);
  if (!course) return null;

  const view = mapLessonView(course, lesson, progress);
  // With the trainer off the lesson has nowhere to be trained.
  return view && !MOVE_TRAINER_ENABLED ? { ...view, trainerHref: undefined } : view;
}
