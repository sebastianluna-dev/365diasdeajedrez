import { BOARD_ORIENTATION, PROGRESS_STATUS, type ProgressStatusCode } from "@/constants/platform/shared-codes.const";
import type { LessonPractice } from "@/services/exercises/lesson-practice.types";
import type { GameMoves } from "@/lib/chess/game-moves";
import type { Prisma } from "@/lib/platform-db/generated/client";
import { withCoverCrop } from "@/lib/cloudinary-url";
import { platformRoutes } from "@/lib/platform-routes";
import { sortByRole } from "@/services/shared/content-order";
import { lessonHasContent, lessonPgnOf } from "@/services/shared/lesson-pgn";
import { formatEloRange } from "./level-rules";
import type {
  ChapterLessonItem,
  ChapterLink,
  CourseOutline,
  ChapterView,
  CourseChapterItem,
  CourseContentTypeItem,
  CourseCta,
  CourseDetail,
  CourseLevelItem,
  CourseReview,
  CourseSourceItem,
  CourseProgressSummary,
  CourseSummary,
  LessonSibling,
  LessonView,
  MyCourseItem,
} from "./courses.types";

// Includes shared between service and mapper: the mapper owns the shape it
// needs and the service only queries it.
export const courseContentInclude = {
  courseContentTypes: { include: { contentType: true }, orderBy: { contentType: { order: "asc" } } },
  // Only the levels in use: one switched off (`isActive`) keeps its row but
  // the student does not see it. By difficulty, and by range when two share a position.
  courseLevels: {
    where: { level: { isActive: true } },
    include: { level: true },
    orderBy: [{ level: { order: "asc" } }, { level: { eloMin: "asc" } }],
  },
  courseAuthors: { include: { author: true, role: true }, orderBy: { order: "asc" } },
  chapters: {
    orderBy: { order: "asc" },
    include: {
      role: { select: { code: true, label: true } },
      lessons: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          chapterId: true,
          name: true,
          description: true,
          order: true,
          isPriority: true,
          estimatedDuration: true,
          role: { select: { code: true, label: true } },
        },
      },
    },
  },
} satisfies Prisma.CourseInclude;

export type CourseWithContent = Prisma.CourseGetPayload<{ include: typeof courseContentInclude }>;

// The course page also cites where the material comes from; the list does
// not, so the sources only join on the single-course read.
export const courseDetailInclude = {
  ...courseContentInclude,
  sources: {
    select: {
      id: true,
      originalTitle: true,
      authors: true,
      url: true,
      publicationYear: true,
      edition: true,
      specificReference: true,
      sourceType: { select: { label: true } },
    },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  },
} satisfies Prisma.CourseInclude;

export type CourseWithDetail = Prisma.CourseGetPayload<{ include: typeof courseDetailInclude }>;

export function mapCourseSources(sources: CourseWithDetail["sources"]): CourseSourceItem[] {
  return sources.map((source) => ({
    id: source.id,
    typeLabel: source.sourceType.label,
    originalTitle: source.originalTitle ?? undefined,
    authors: source.authors ?? undefined,
    url: source.url ?? undefined,
    publicationYear: source.publicationYear ?? undefined,
    edition: source.edition ?? undefined,
    specificReference: source.specificReference ?? undefined,
  }));
}

export interface UserCourseState {
  /** statusCode of LessonProgress by lessonId. */
  lessonStatus: Map<string, ProgressStatusCode>;
  /**
   * Absent = the student has no `CourseProgress` row for this course, which
   * is what "has not added it" means: see `isAdded`.
   */
  courseStatus?: ProgressStatusCode;
  lastLessonId?: string;
  /** The student asked to see only what the staff marked as priority in this course. */
  onlyPriorityLessons: boolean;
  /** Orientation the student fixed; `AUTO` or absent = the lesson's rules. */
  boardOrientationCode?: string;
}

function asStatus(code: string | undefined): ProgressStatusCode {
  return (code as ProgressStatusCode | undefined) ?? PROGRESS_STATUS.NOT_STARTED;
}

/**
 * Whether the course is one of the student's.
 *
 * There is no table of enrolments: a course is theirs from the moment it has
 * a progress row, which is written by the button of the information page
 * (`addCourse`, not started) and by opening any of its lessons
 * (`touchLesson`, in progress). Reading it off the same row is what keeps
 * "I have progress in it" and "it is in my courses" from ever disagreeing.
 */
function isAdded(state: UserCourseState): boolean {
  return state.courseStatus !== undefined;
}

/**
 * Whether the lesson is part of the path the student asked to see.
 *
 * With the filter on, only the priority ones pass: a lesson is priority by its
 * own mark or by its chapter's — a chapter the staff marked is priority whole,
 * and would otherwise open onto an empty list. Having opened or finished a
 * lesson does NOT keep it in view (Sebastian's call, 2026-10-07): until then
 * the touched ones passed too, so that switching the filter on never hid what
 * was done, but a list of priority lessons with others among them, untagged,
 * read as a mistake. The price is known: while the filter is on, the course's
 * progress counts the priority lessons only, so a student who had done other
 * lessons sees the figure drop, and come back when the filter goes off.
 */
function isVisible(
  lesson: { id: string; isPriority: boolean },
  chapter: { isPriority: boolean },
  state: UserCourseState,
): boolean {
  if (!state.onlyPriorityLessons) return true;
  return lesson.isPriority || chapter.isPriority;
}

/**
 * Every lesson of the course in the order they are read, unfiltered.
 *
 * Within each chapter, and between chapters, the introduction and the closing
 * — which are fixed — rule over the order number. It is the SAME function the
 * staff panel uses, so author and student see the same sequence.
 */
function allLessons(course: CourseWithContent) {
  return sortByRole(course.chapters.map((chapter) => ({ ...chapter, roleCode: chapter.role?.code }))).flatMap(
    (chapter) =>
      sortByRole(chapter.lessons.map((lesson) => ({ ...lesson, roleCode: lesson.role?.code }))).map((lesson) => ({
        ...lesson,
        chapterId: chapter.id,
        // The chapter's OWN order number, which is what addresses it in the
        // URL — not where it falls when read, which the introduction and the
        // closing move around and which is already given by this list's order.
        chapterOrder: chapter.order,
        chapterIsPriority: chapter.isPriority,
      })),
  );
}

/**
 * The square image of a course, and while it has none its cover cropped
 * square: the reframing is written in the URL, so it costs no upload.
 */
function thumbnailOf(course: { thumbnail: string | null; cover: string | null }): string | undefined {
  return course.thumbnail ?? (course.cover ? withCoverCrop(course.cover, "auto", "1:1") : undefined);
}

/** The ones the student sees, which are what is counted and navigated over. */
function flattenLessons(course: CourseWithContent, state: UserCourseState) {
  return allLessons(course).filter((lesson) => isVisible(lesson, { isPriority: lesson.chapterIsPriority }, state));
}

export function mapCourseProgress(course: CourseWithContent, state: UserCourseState): CourseProgressSummary {
  const lessons = flattenLessons(course, state);
  const completedLessons = lessons.filter(
    (lesson) => state.lessonStatus.get(lesson.id) === PROGRESS_STATUS.COMPLETED,
  ).length;
  const totalLessons = lessons.length;

  const completedMinutes = minutesOf(
    lessons.filter((lesson) => state.lessonStatus.get(lesson.id) === PROGRESS_STATUS.COMPLETED),
  );
  const totalMinutes = minutesOf(lessons);

  return {
    statusCode: asStatus(state.courseStatus),
    completedLessons,
    totalLessons,
    percent: percentOf(completedLessons, totalLessons),
    completedMinutes,
    totalMinutes,
    minutesPercent: percentOf(completedMinutes, totalMinutes),
  };
}

/**
 * Where the course carries on.
 *
 * Where they left off, IF it is still in view; if the filter hid it, the first
 * visible unfinished one; and if they are all done, the first, which is what
 * comes next for review. With none visible, the course page.
 */
function continueTarget(course: CourseWithContent, state: UserCourseState) {
  const lessons = flattenLessons(course, state);
  const last = lessons.find((lesson) => lesson.id === state.lastLessonId);
  const pending = lessons.find((lesson) => state.lessonStatus.get(lesson.id) !== PROGRESS_STATUS.COMPLETED);
  const target = last ?? pending ?? lessons[0];
  return target
    ? platformRoutes.lessonDetail(course.id, target.chapterOrder, target.id)
    : platformRoutes.courseDetail(course.id);
}

/**
 * The next lesson to LEARN, which is not always where the course carries on.
 *
 * `continueTarget` goes back to where they left off even if that lesson is
 * done, because a dashboard's «Continuar» takes them back to their place.
 * «Aprender» promises something new: the lesson they left unfinished, and
 * otherwise the first unfinished one in the order the course is read. When
 * every lesson in view is done there is nothing left to learn, and it says so
 * by answering nothing: it is what marks ONE lesson of the course as the
 * next. Where the button leads is `learnTarget`, which always answers.
 */
function nextLesson(course: CourseWithContent, state: UserCourseState) {
  const lessons = flattenLessons(course, state);
  const isPending = (lesson: { id: string }) => state.lessonStatus.get(lesson.id) !== PROGRESS_STATUS.COMPLETED;
  const last = lessons.find((lesson) => lesson.id === state.lastLessonId);
  return last && isPending(last) ? last : lessons.find(isPending);
}

/**
 * Where «Aprender» leads. The next lesson to learn and, in a course that is
 * finished, its first lesson: the button is not switched off for having
 * learned it all, it starts the course over. Only a course with no lesson in
 * view has nowhere to lead.
 */
function learnTarget(course: CourseWithContent, state: UserCourseState): string | undefined {
  const target = nextLesson(course, state) ?? flattenLessons(course, state)[0];
  return target ? platformRoutes.lessonDetail(course.id, target.chapterOrder, target.id) : undefined;
}

/**
 * What the course's button says.
 *
 * It is decided with the VISIBLE count, not with the stored state: if the
 * student filtered and has already done every priority lesson, the bar is at
 * 100 % and a "Continuar" there would make no sense, even though
 * `CourseProgress` is still in progress — and it is still in progress on
 * purpose: the filter is a lens, not a change in what the course is.
 */
function mapContentTypes(course: CourseWithContent): CourseContentTypeItem[] {
  return course.courseContentTypes.map(({ contentType }) => ({
    code: contentType.code,
    label: contentType.label,
    shortLabel: contentType.shortLabel,
    description: contentType.description,
  }));
}

/** A level row as the student reads it, with its range already worded. */
export function mapCourseLevel(level: {
  slug: string;
  name: string;
  description: string;
  eloMin: number;
  eloMax: number | null;
}): CourseLevelItem {
  return {
    slug: level.slug,
    name: level.name,
    description: level.description,
    eloRange: formatEloRange(level),
    eloMin: level.eloMin,
    eloMax: level.eloMax,
  };
}

/** Every lesson in view is learned, and there is at least one. */
function isCompleted(progress: CourseProgressSummary): boolean {
  return progress.totalLessons > 0 && progress.completedLessons === progress.totalLessons;
}

function ctaLabelFor(progress: CourseProgressSummary): CourseCta {
  if (isCompleted(progress)) return "Repasar";
  if (progress.completedLessons > 0 || progress.statusCode === PROGRESS_STATUS.IN_PROGRESS) return "Continuar";
  return "Empezar";
}

/** Whole percentage 0–100; zero of zero is zero, never NaN. */
function percentOf(done: number, total: number): number {
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

/** The minutes of a list of lessons; the ones without a figure count as zero. */
function minutesOf(lessons: readonly { estimatedDuration: number | null }[]): number {
  return lessons.reduce((total, lesson) => total + (lesson.estimatedDuration ?? 0), 0);
}

export function mapCourseSummary(course: CourseWithContent, state: UserCourseState): CourseSummary {
  const progress = mapCourseProgress(course, state);
  return {
    id: course.id,
    name: course.name,
    slug: course.slug,
    description: course.description ?? undefined,
    cover: course.cover ?? undefined,
    thumbnail: thumbnailOf(course),
    contentTypes: mapContentTypes(course),
    levels: course.courseLevels.map((courseLevel) => mapCourseLevel(courseLevel.level)),
    authorNames: course.courseAuthors.map((courseAuthor) => courseAuthor.author.name),
    isAdded: isAdded(state),
    progress,
    isCompleted: isCompleted(progress),
    continueHref: continueTarget(course, state),
    ctaLabel: ctaLabelFor(progress),
    href: platformRoutes.courseDetail(course.id),
    infoHref: platformRoutes.courseInfo(course.slug),
  };
}

/**
 * What the course's pages need that is not in the course nor in the student's
 * progress: what its «Repasar» says, which the trainer's schedule decides.
 * Absent, there is nothing to review.
 */
export type CourseExtras = Partial<CourseReview>;

/** The summary of a course the student added, with what its row of "Mis cursos" does. */
export function mapMyCourse(
  course: CourseWithContent,
  state: UserCourseState,
  { reviewCount = 0, isReviewUpToDate = false }: CourseExtras = {},
): MyCourseItem {
  return {
    ...mapCourseSummary(course, state),
    learnHref: learnTarget(course, state),
    reviewCount,
    isReviewUpToDate,
    reviewHref: platformRoutes.courseReview(course.id),
  };
}

function mapChapterItem(
  course: CourseWithContent,
  chapter: CourseWithContent["chapters"][number],
  state: UserCourseState,
): CourseChapterItem {
  // Over the visible ones: the chapter's count has to match the list that
  // opens when it is pressed.
  const lessons = chapter.lessons.filter((lesson) => isVisible(lesson, chapter, state));
  const completedLessons = lessons.filter(
    (lesson) => state.lessonStatus.get(lesson.id) === PROGRESS_STATUS.COMPLETED,
  ).length;
  return {
    id: chapter.id,
    order: chapter.order,
    name: chapter.name,
    description: chapter.description ?? undefined,
    // The cached sum of its lessons' minutes (`syncChapterDuration`): a
    // chapter's duration is one column and not a walk over its lessons. Nothing
    // there says how long it takes, so there is no duration — not a zero, which
    // would read as "it takes no time".
    durationMin: chapter.estimatedDuration || undefined,
    isPriority: chapter.isPriority,
    lessonCount: chapter.lessons.length,
    totalLessons: lessons.length,
    completedLessons,
    isCompleted: lessons.length > 0 && completedLessons === lessons.length,
    href: platformRoutes.chapterDetail(course.id, chapter.order),
  };
}

export function mapCourseDetail(
  course: CourseWithDetail,
  state: UserCourseState,
  { reviewCount = 0, isReviewUpToDate = false }: CourseExtras = {},
): CourseDetail {
  const progress = mapCourseProgress(course, state);
  const every = allLessons(course);
  return {
    id: course.id,
    slug: course.slug,
    name: course.name,
    description: course.description ?? undefined,
    cover: course.cover ?? undefined,
    thumbnail: thumbnailOf(course),
    contentTypes: mapContentTypes(course),
    levels: course.courseLevels.map((courseLevel) => mapCourseLevel(courseLevel.level)),
    authors: course.courseAuthors.map((courseAuthor) => ({
      name: courseAuthor.author.name,
      roleLabel: courseAuthor.role.label,
    })),
    isAdded: isAdded(state),
    progress,
    isCompleted: isCompleted(progress),
    ctaLabel: ctaLabelFor(progress),
    learnHref: learnTarget(course, state),
    reviewCount,
    isReviewUpToDate,
    reviewHref: platformRoutes.courseReview(course.id),
    onlyPriorityLessons: state.onlyPriorityLessons,
    hiddenLessons: every.length - progress.totalLessons,
    lessonCount: every.length,
    totalMinutes: minutesOf(every),
    infoHref: platformRoutes.courseInfo(course.slug),
    studyHref: platformRoutes.courseDetail(course.id),
    chapters: sortByRole(course.chapters.map((chapter) => ({ ...chapter, roleCode: chapter.role?.code }))).map(
      (chapter) => mapChapterItem(course, chapter, state),
    ),
    sources: mapCourseSources(course.sources),
  };
}

/** What the chapter's page needs besides the course's. */
export interface ChapterExtras extends CourseExtras {
  /** The moves of each lesson and how its game ended, by lesson id: see `gameMoves`. */
  games?: ReadonlyMap<string, GameMoves>;
}

export function mapChapterView(
  course: CourseWithDetail,
  chapterId: string,
  state: UserCourseState,
  { games, ...courseExtras }: ChapterExtras = {},
): ChapterView | null {
  const chapter = course.chapters.find((candidate) => candidate.id === chapterId);
  if (!chapter) return null;

  const detail = mapCourseDetail(course, state, courseExtras);
  const nextId = nextLesson(course, state)?.id;

  // `order` is still the REAL one (1, 4, 7 with the filter on), though the
  // pages no longer draw it: renumbering would break each one's
  // identity within the course.
  const lessons: ChapterLessonItem[] = sortByRole(
    chapter.lessons.map((lesson) => ({ ...lesson, roleCode: lesson.role?.code })),
  )
    .filter((lesson) => isVisible(lesson, chapter, state))
    .map((lesson) => ({
      id: lesson.id,
      order: lesson.order,
      name: lesson.name,
      description: lesson.description ?? undefined,
      isPriority: lesson.isPriority,
      estimatedDuration: lesson.estimatedDuration ?? undefined,
      statusCode: asStatus(state.lessonStatus.get(lesson.id)),
      isNext: lesson.id === nextId,
      line: games?.get(lesson.id)?.line,
      result: games?.get(lesson.id)?.result,
      href: platformRoutes.lessonDetail(course.id, chapter.order, lesson.id),
    }));

  const hiddenLessons = chapter.lessons.length - lessons.length;

  // The neighbours come from the course's own list, which is already in the
  // order the chapters are read: the introduction first, the closing last.
  const position = detail.chapters.findIndex((candidate) => candidate.id === chapter.id);
  const linkTo = (neighbour: CourseDetail["chapters"][number] | undefined): ChapterLink | undefined =>
    neighbour ? { name: neighbour.name, href: neighbour.href } : undefined;

  // Counted over ALL its lessons and not over the visible ones: with the
  // «Prioridad» filter on, a finished lesson can be hidden, and what there is
  // to erase cannot depend on the lens the student is looking through.
  const completedLessons = chapter.lessons.filter(
    (lesson) => state.lessonStatus.get(lesson.id) === PROGRESS_STATUS.COMPLETED,
  ).length;

  return {
    course: detail,
    id: chapter.id,
    order: chapter.order,
    name: chapter.name,
    completedLessons,
    hiddenLessons,
    lessons,
    previous: position > 0 ? linkTo(detail.chapters[position - 1]) : undefined,
    next: position >= 0 ? linkTo(detail.chapters[position + 1]) : undefined,
  };
}

/**
 * The column beside a lesson, from the course and the student's state alone:
 * the course's head and the chapter the lesson is in, with the lessons it
 * shows (2026-10-23; until then every chapter of the course). No lesson is
 * named here, because the column is the same for every lesson of the
 * chapter and the segment that draws it does not know which one is open.
 * Null when the course has no chapter of that order, which is what the
 * chapter's layout answers with a 404.
 */
export function mapCourseOutline(
  course: CourseWithContent,
  chapterOrder: number,
  state: UserCourseState,
): CourseOutline | null {
  const chapter = course.chapters.find((candidate) => candidate.order === chapterOrder);
  if (!chapter) return null;

  const visible = flattenLessons(course, state);

  return {
    courseId: course.id,
    chapter: {
      id: chapter.id,
      order: chapter.order,
      name: chapter.name,
      href: platformRoutes.chapterDetail(course.id, chapter.order),
      lessons: visible
        .filter((candidate) => candidate.chapterId === chapter.id)
        .map((candidate): LessonSibling => ({
          id: candidate.id,
          name: candidate.name,
          href: platformRoutes.lessonDetail(course.id, chapter.order, candidate.id),
          statusCode: asStatus(state.lessonStatus.get(candidate.id)),
        })),
    },
  };
}

export interface LessonRowForView {
  id: string;
  chapterId: string;
  name: string;
  description: string | null;
  order: number;
  isPriority: boolean;
  estimatedDuration: number | null;
  pgn: string;
  /** The game of the course collection, if the lesson references it. */
  game: { pgn: string } | null;
  orientation: { code: string };
  /** The line trainer's derived drills (`TrainingExercise`), not the lesson's exercises. */
  trainingExercises: { id: string }[];
}

export function mapLessonView(
  course: CourseWithContent,
  lesson: LessonRowForView,
  state: UserCourseState,
  practice: LessonPractice | null = null,
): LessonView | null {
  const chapter = course.chapters.find((candidate) => candidate.id === lesson.chapterId);
  if (!chapter) return null;

  // Previous and next are looked up BY PLACE IN THE COURSE, not by membership:
  // a lesson hidden by the filter is still served by URL — a link from a class
  // cannot break over a display preference — and there, looking for it in the
  // visible list would give -1, leaving it without a previous AND without a
  // next. That place is its index in the unfiltered reading order, which is
  // the one sequence author and student share.
  const rank = new Map(allLessons(course).map((candidate, index) => [candidate.id, index]));
  const here = rank.get(lesson.id) ?? -1;
  const placeOf = (candidate: { id: string }) => rank.get(candidate.id) ?? -1;

  const visible = flattenLessons(course, state);
  const prev = [...visible].reverse().find((candidate) => placeOf(candidate) < here);
  const next = visible.find((candidate) => placeOf(candidate) > here);

  // The content's orientation rules unless the user forces one in their course
  // settings (AUTO or the absence of a row = the lesson's).
  const settingsOrientationCode = state.boardOrientationCode;
  const forced =
    settingsOrientationCode && settingsOrientationCode !== BOARD_ORIENTATION.AUTO ? settingsOrientationCode : undefined;
  const effective = forced ?? lesson.orientation.code;

  return {
    courseId: course.id,
    courseName: course.name,
    chapterId: chapter.id,
    chapterOrder: chapter.order,
    chapterName: chapter.name,
    id: lesson.id,
    order: lesson.order,
    name: lesson.name,
    description: lesson.description ?? undefined,
    isPriority: lesson.isPriority,
    estimatedDuration: lesson.estimatedDuration ?? undefined,
    pgn: lessonPgnOf(lesson),
    orientation: effective === BOARD_ORIENTATION.BLACK ? "black" : "white",
    statusCode: asStatus(state.lessonStatus.get(lesson.id)),
    practice,
    // Derived, never stored (D25): a lesson with nothing to read and something to solve.
    isPracticeOnly: !lessonHasContent(lesson) && practice !== null,
    prevLessonHref: prev ? platformRoutes.lessonDetail(course.id, prev.chapterOrder, prev.id) : undefined,
    nextLessonHref: next ? platformRoutes.lessonDetail(course.id, next.chapterOrder, next.id) : undefined,
    href: platformRoutes.lessonDetail(course.id, chapter.order, lesson.id),
    chapterHref: platformRoutes.chapterDetail(course.id, chapter.order),
    trainerHref: lesson.trainingExercises.length > 0 ? `${platformRoutes.trainer}?lesson=${lesson.id}` : undefined,
  };
}
