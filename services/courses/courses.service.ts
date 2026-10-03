import { cache } from "react";
import { COURSE_STATUS } from "@/constants/platform/course-codes.const";
import { MOVE_TRAINER_ENABLED } from "@/constants/platform/features.const";
import { PROGRESS_STATUS, type ProgressStatusCode } from "@/constants/platform/shared-codes.const";
import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { gameMoves, type GameMoves } from "@/lib/chess/game-moves";
import { dueReviewExerciseWhere, reviewExerciseWhere } from "@/services/shared/course-review.service";
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
  CourseReview,
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
  });
});

/** The same course by its slug, which is how its information page is addressed. */
const getPublishedCourseBySlug = cache(async (slug: string) => {
  const db = getPlatformDb();
  return db.course.findFirst({
    where: { slug, status: { code: COURSE_STATUS.PUBLISHED } },
    include: courseDetailInclude,
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
    }),
    db.courseProgress.findUnique({
      where: { userId_courseId: { userId: user.id, courseId } },
      select: { lastLessonId: true, status: { select: { code: true } } },
    }),
    // The course settings go into the STATE and are not queried separately: they
    // are "what this student has in this course", just like their progress, and
    // that way there is a single place that reads them.
    db.userCourseSettings.findUnique({
      where: { userId_courseId: { userId: user.id, courseId } },
      select: { onlyPriorityLessons: true, boardOrientation: { select: { code: true } } },
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
    }),
    db.courseProgress.findMany({
      where: { userId: user.id },
      select: { courseId: true, lastLessonId: true, status: { select: { code: true } } },
    }),
    db.userCourseSettings.findMany({
      where: { userId: user.id },
      select: { courseId: true, onlyPriorityLessons: true, boardOrientation: { select: { code: true } } },
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

/** The course an exercise belongs to, which is all «Mis cursos» needs of it to add it up. */
const exerciseCourseSelect = { lesson: { select: { chapter: { select: { courseId: true } } } } } as const;

/**
 * What «Repasar» says in each course, by course id: `getCourseReview` for
 * every course at once, with the same `where` (`dueReviewExerciseWhere`)
 * without a course in it, added up by course instead of a count per row of
 * the list. A course with nothing learned to review is not in the map.
 */
async function getCourseReviews(): Promise<Map<string, CourseReview>> {
  // With the trainer off there is nothing to review: no course has a count.
  if (!MOVE_TRAINER_ENABLED) return new Map();

  const db = getPlatformDb();
  const user = await getCurrentUser();
  const scope = { userId: user.id };
  const [dueWhere, learned] = await Promise.all([
    dueReviewExerciseWhere(db, scope, new Date()),
    // One row per lesson is enough to know which courses have something learned.
    db.trainingExercise.findMany({
      where: reviewExerciseWhere(scope),
      select: { lessonId: true, ...exerciseCourseSelect },
      distinct: ["lessonId"],
    }),
  ]);
  const due = await db.trainingExercise.findMany({ where: dueWhere, select: exerciseCourseSelect });

  const reviews = new Map<string, CourseReview>();
  for (const row of learned) {
    reviews.set(row.lesson.chapter.courseId, { reviewCount: 0, isReviewUpToDate: true });
  }
  for (const row of due) {
    const { courseId } = row.lesson.chapter;
    reviews.set(courseId, { reviewCount: (reviews.get(courseId)?.reviewCount ?? 0) + 1, isReviewUpToDate: false });
  }
  return reviews;
}

/**
 * "Mis cursos": of the published courses, the ones the student added, each
 * with its next lesson to learn and what there is to review in it today.
 */
export async function getUserCourses(): Promise<MyCourseItem[]> {
  const [courses, progress, reviews] = await Promise.all([
    getPublishedCourses(),
    getUserProgressState(),
    getCourseReviews(),
  ]);
  return courses
    .map((course) => mapMyCourse(course, progress.get(course.id) ?? EMPTY_STATE, reviews.get(course.id)))
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
  });
  if (!row) return null;

  const [course, progress] = await Promise.all([
    getPublishedCourse(row.courseId),
    getCourseProgressState(row.courseId),
  ]);
  if (!course) return null;
  return { ...mapCourseSummary(course, progress), lastLessonName: row.lastLesson?.name };
}

/** Nothing to review: what a course says while the trainer is off. */
const NO_REVIEW: CourseReview = { reviewCount: 0, isReviewUpToDate: false };

/**
 * What «Repasar» says in a course: the exercises of the lessons the student
 * already learned whose review is DUE — the trainer's schedule
 * (`UserLessonTraining.nextReviewAt`) says so, or the lesson was never
 * trained —, counted with the very `where` the session it opens is served
 * with (`dueReviewExerciseWhere`), so the figure and the session agree. With
 * none due, whether something learned has exercises at all: the course is
 * then up to date («Al día»), not a course with nothing to review.
 */
const getCourseReview = cache(async (courseId: string): Promise<CourseReview> => {
  // With the trainer off there is nothing to review, and «Repasar» is not drawn.
  if (!MOVE_TRAINER_ENABLED) return NO_REVIEW;

  const db = getPlatformDb();
  const user = await getCurrentUser();
  const scope = { userId: user.id, courseId };
  const [dueWhere, learned] = await Promise.all([
    dueReviewExerciseWhere(db, scope, new Date()),
    db.trainingExercise.findFirst({ where: reviewExerciseWhere(scope), select: { id: true } }),
  ]);
  const reviewCount = await db.trainingExercise.count({ where: dueWhere });
  return { reviewCount, isReviewUpToDate: reviewCount === 0 && learned !== null };
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
  const [course, progress, review] = await Promise.all([
    getPublishedCourse(courseId),
    getCourseProgressState(courseId),
    getCourseReview(courseId),
  ]);
  if (!course) return null;
  return mapCourseDetail(course, progress, review);
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
  const [course, progress, review] = await Promise.all([
    getPublishedCourse(courseId),
    getCourseProgressState(courseId),
    getCourseReview(courseId),
  ]);
  if (!course) return null;

  // The chapter comes from the already loaded course: the include brings all of
  // its chapters, so resolving its order number does not cost one more query.
  const chapterId = course.chapters.find((chapter) => chapter.order === chapterOrder)?.id;
  if (!chapterId) return null;

  // The course is loaded WITHOUT the PGN of its lessons, which is most of its
  // weight; the list shows the moves of each lesson, so those of this chapter
  // alone are read here.
  const contents = await db.lesson.findMany({ where: { chapterId }, select: { id: true, ...lessonPgnSelect } });
  const games = new Map<string, GameMoves>();
  for (const lesson of contents) {
    const game = gameMoves(lessonPgnOf(lesson));
    if (game) games.set(lesson.id, game);
  }

  return mapChapterView(course, chapterId, progress, { games, ...review });
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
