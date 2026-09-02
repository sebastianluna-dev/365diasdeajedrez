import { BOARD_ORIENTATION, PROGRESS_STATUS, type ProgressStatusCode } from "@/constants/platform/shared-codes.const";
import type { Prisma } from "@/lib/platform-db/generated/client";
import { platformRoutes } from "@/lib/platform-routes";
import type {
  ChapterLessonItem,
  ChapterView,
  CourseChapterItem,
  CourseDetail,
  CourseProgressSummary,
  CourseSummary,
  LessonView,
} from "./courses.types";

// Includes compartidos entre servicio y mapper: el mapper es dueño de la forma
// que necesita y el servicio sólo la consulta.
export const courseContentInclude = {
  type: true,
  courseLevels: { include: { level: true }, orderBy: { level: { order: "asc" } } },
  courseAuthors: { include: { author: true, role: true }, orderBy: { order: "asc" } },
  chapters: {
    orderBy: { order: "asc" },
    include: {
      lessons: {
        orderBy: { order: "asc" },
        select: { id: true, chapterId: true, name: true, description: true, order: true, isPriority: true, estimatedDuration: true },
      },
    },
  },
} satisfies Prisma.CourseInclude;

export type CourseWithContent = Prisma.CourseGetPayload<{ include: typeof courseContentInclude }>;

export interface UserCourseState {
  /** statusCode de LessonProgress por lessonId. */
  lessonStatus: Map<string, ProgressStatusCode>;
  courseStatus?: ProgressStatusCode;
  lastLessonId?: string;
}

function asStatus(code: string | undefined): ProgressStatusCode {
  return (code as ProgressStatusCode | undefined) ?? PROGRESS_STATUS.NOT_STARTED;
}

function flattenLessons(course: CourseWithContent) {
  return course.chapters.flatMap((chapter) =>
    chapter.lessons.map((lesson) => ({ ...lesson, chapterId: chapter.id, chapterOrder: chapter.order })),
  );
}

export function mapCourseProgress(course: CourseWithContent, state: UserCourseState): CourseProgressSummary {
  const lessons = flattenLessons(course);
  const completedLessons = lessons.filter(
    (lesson) => state.lessonStatus.get(lesson.id) === PROGRESS_STATUS.COMPLETED,
  ).length;
  const totalLessons = lessons.length;
  return {
    statusCode: asStatus(state.courseStatus),
    completedLessons,
    totalLessons,
    percent: totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100),
  };
}

function continueTarget(course: CourseWithContent, state: UserCourseState) {
  const lessons = flattenLessons(course);
  const target = lessons.find((lesson) => lesson.id === state.lastLessonId) ?? lessons[0];
  return target ? platformRoutes.lessonDetail(target.id) : platformRoutes.courseDetail(course.id);
}

function ctaLabelFor(statusCode: ProgressStatusCode): CourseSummary["ctaLabel"] {
  if (statusCode === PROGRESS_STATUS.COMPLETED) return "Revisar";
  if (statusCode === PROGRESS_STATUS.IN_PROGRESS) return "Continuar";
  return "Comenzar";
}

export function mapCourseSummary(course: CourseWithContent, state: UserCourseState): CourseSummary {
  const progress = mapCourseProgress(course, state);
  return {
    id: course.id,
    name: course.name,
    slug: course.slug,
    description: course.description ?? undefined,
    cover: course.cover ?? undefined,
    typeLabel: course.type.label,
    levelLabels: course.courseLevels.map((courseLevel) => courseLevel.level.label),
    authorNames: course.courseAuthors.map((courseAuthor) => courseAuthor.author.name),
    progress,
    continueHref: continueTarget(course, state),
    ctaLabel: ctaLabelFor(progress.statusCode),
    href: platformRoutes.courseDetail(course.id),
  };
}

function mapChapterItem(course: CourseWithContent, chapter: CourseWithContent["chapters"][number], state: UserCourseState): CourseChapterItem {
  const completedLessons = chapter.lessons.filter(
    (lesson) => state.lessonStatus.get(lesson.id) === PROGRESS_STATUS.COMPLETED,
  ).length;
  return {
    id: chapter.id,
    order: chapter.order,
    name: chapter.name,
    description: chapter.description ?? undefined,
    estimatedDuration: chapter.estimatedDuration ?? undefined,
    totalLessons: chapter.lessons.length,
    completedLessons,
    href: platformRoutes.chapterDetail(course.id, chapter.order),
  };
}

export function mapCourseDetail(course: CourseWithContent, state: UserCourseState): CourseDetail {
  const progress = mapCourseProgress(course, state);
  return {
    id: course.id,
    name: course.name,
    description: course.description ?? undefined,
    typeLabel: course.type.label,
    levelLabels: course.courseLevels.map((courseLevel) => courseLevel.level.label),
    authors: course.courseAuthors.map((courseAuthor) => ({
      name: courseAuthor.author.name,
      roleLabel: courseAuthor.role.label,
    })),
    progress,
    continueHref: continueTarget(course, state),
    ctaLabel: ctaLabelFor(progress.statusCode),
    chapters: course.chapters.map((chapter) => mapChapterItem(course, chapter, state)),
  };
}

export function mapChapterView(
  course: CourseWithContent,
  chapterId: string,
  state: UserCourseState,
  options: { hasExercises: boolean; inTrainer: boolean },
): ChapterView | null {
  const chapter = course.chapters.find((candidate) => candidate.id === chapterId);
  if (!chapter) return null;

  const lessons: ChapterLessonItem[] = chapter.lessons.map((lesson) => ({
    id: lesson.id,
    order: lesson.order,
    name: lesson.name,
    description: lesson.description ?? undefined,
    isPriority: lesson.isPriority,
    estimatedDuration: lesson.estimatedDuration ?? undefined,
    statusCode: asStatus(state.lessonStatus.get(lesson.id)),
    href: platformRoutes.lessonDetail(lesson.id),
  }));

  return {
    courseId: course.id,
    courseName: course.name,
    courseHref: platformRoutes.courseDetail(course.id),
    id: chapter.id,
    order: chapter.order,
    name: chapter.name,
    description: chapter.description ?? undefined,
    estimatedDuration: chapter.estimatedDuration ?? undefined,
    completedLessons: lessons.filter((lesson) => lesson.statusCode === PROGRESS_STATUS.COMPLETED).length,
    totalLessons: lessons.length,
    lessons,
    hasExercises: options.hasExercises,
    inTrainer: options.inTrainer,
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
  initialFen: string | null;
  pgn: string;
  orientation: { code: string };
  exercises: { id: string }[];
}

export function mapLessonView(
  course: CourseWithContent,
  lesson: LessonRowForView,
  state: UserCourseState,
  settingsOrientationCode: string | undefined,
): LessonView | null {
  const chapter = course.chapters.find((candidate) => candidate.id === lesson.chapterId);
  if (!chapter) return null;

  const flat = flattenLessons(course);
  const index = flat.findIndex((candidate) => candidate.id === lesson.id);
  const prev = index > 0 ? flat[index - 1] : undefined;
  const next = index >= 0 && index < flat.length - 1 ? flat[index + 1] : undefined;

  // La orientación del contenido manda salvo que el usuario fuerce una en sus
  // ajustes del curso (AUTO o ausencia de fila = la de la lección).
  const forced = settingsOrientationCode && settingsOrientationCode !== BOARD_ORIENTATION.AUTO ? settingsOrientationCode : undefined;
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
    initialFen: lesson.initialFen,
    pgn: lesson.pgn,
    orientation: effective === BOARD_ORIENTATION.BLACK ? "black" : "white",
    statusCode: asStatus(state.lessonStatus.get(lesson.id)),
    exerciseCount: lesson.exercises.length,
    prevLessonHref: prev ? platformRoutes.lessonDetail(prev.id) : undefined,
    nextLessonHref: next ? platformRoutes.lessonDetail(next.id) : undefined,
    chapterHref: platformRoutes.chapterDetail(course.id, chapter.order),
    trainerHref: lesson.exercises.length > 0 ? `${platformRoutes.trainer}?lesson=${lesson.id}` : undefined,
  };
}
