import { BOARD_ORIENTATION, PROGRESS_STATUS, type ProgressStatusCode } from "@/constants/platform/shared-codes.const";
import type { Prisma } from "@/lib/platform-db/generated/client";
import { platformRoutes } from "@/lib/platform-routes";
import { sortByRole } from "@/services/shared/content-order";
import { lessonPgnOf } from "@/services/shared/lesson-pgn";
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

export interface UserCourseState {
  /** statusCode de LessonProgress por lessonId. */
  lessonStatus: Map<string, ProgressStatusCode>;
  courseStatus?: ProgressStatusCode;
  lastLessonId?: string;
  /** El alumno pidió ver sólo las lecciones imprescindibles de este curso. */
  onlyPriorityLessons: boolean;
  /** Orientación que fijó el alumno; `AUTO` o ausente = manda la de la lección. */
  boardOrientationCode?: string;
}

function asStatus(code: string | undefined): ProgressStatusCode {
  return (code as ProgressStatusCode | undefined) ?? PROGRESS_STATUS.NOT_STARTED;
}

/**
 * Si la lección entra en el recorrido que el alumno pidió ver.
 *
 * Con el filtro puesto pasan las prioritarias **y las que ya tocó**. Esa
 * segunda mitad es la que evita el peor efecto del filtro: sin ella, activarlo
 * escondería lecciones ya completadas y el contador de hechas BAJARÍA. Con
 * ella, el porcentaje nunca retrocede y «ya la hice» nunca se vuelve «¿dónde
 * está?».
 */
function isVisible(lesson: { id: string; isPriority: boolean }, state: UserCourseState): boolean {
  return !state.onlyPriorityLessons || lesson.isPriority || state.lessonStatus.has(lesson.id);
}

/**
 * Todas las lecciones del curso en el orden en que se leen, sin filtrar.
 *
 * Dentro de cada capítulo, y entre capítulos, mandan la introducción y el
 * cierre —que van fijos— sobre el número de orden. Es la MISMA función que usa
 * el panel del staff, así que autor y alumno ven la misma secuencia.
 */
function allLessons(course: CourseWithContent) {
  return sortByRole(
    course.chapters.map((chapter) => ({ ...chapter, roleCode: chapter.role?.code })),
  ).flatMap((chapter, chapterIndex) =>
    sortByRole(chapter.lessons.map((lesson) => ({ ...lesson, roleCode: lesson.role?.code }))).map(
      (lesson) => ({ ...lesson, chapterId: chapter.id, chapterOrder: chapterIndex + 1 }),
    ),
  );
}

/** Las que el alumno ve, que es sobre las que se cuenta y se navega. */
function flattenLessons(course: CourseWithContent, state: UserCourseState) {
  return allLessons(course).filter((lesson) => isVisible(lesson, state));
}

export function mapCourseProgress(course: CourseWithContent, state: UserCourseState): CourseProgressSummary {
  const lessons = flattenLessons(course, state);
  const completedLessons = lessons.filter(
    (lesson) => state.lessonStatus.get(lesson.id) === PROGRESS_STATUS.COMPLETED,
  ).length;
  const totalLessons = lessons.length;

  const minutesOf = (list: typeof lessons) =>
    list.reduce((total, lesson) => total + (lesson.estimatedDuration ?? 0), 0);
  const completedMinutes = minutesOf(
    lessons.filter((lesson) => state.lessonStatus.get(lesson.id) === PROGRESS_STATUS.COMPLETED),
  );
  const totalMinutes = minutesOf(lessons);

  return {
    statusCode: asStatus(state.courseStatus),
    completedLessons,
    totalLessons,
    percent: totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100),
    completedMinutes,
    totalMinutes,
    minutesPercent: totalMinutes === 0 ? 0 : Math.round((completedMinutes / totalMinutes) * 100),
  };
}

/**
 * Por dónde sigue el curso.
 *
 * Donde se quedó, SI sigue a la vista; si el filtro la escondió, la primera
 * visible sin terminar; y si están todas hechas, la primera, que es lo que toca
 * para repasar. Sin ninguna visible, la ficha del curso.
 */
function continueTarget(course: CourseWithContent, state: UserCourseState) {
  const lessons = flattenLessons(course, state);
  const last = lessons.find((lesson) => lesson.id === state.lastLessonId);
  const pending = lessons.find((lesson) => state.lessonStatus.get(lesson.id) !== PROGRESS_STATUS.COMPLETED);
  const target = last ?? pending ?? lessons[0];
  return target ? platformRoutes.lessonDetail(target.id) : platformRoutes.courseDetail(course.id);
}

/**
 * Qué dice el botón del curso.
 *
 * Se decide con el recuento VISIBLE, no con el estado guardado: si el alumno
 * filtró y ya hizo todas las prioritarias, la barra está al 100 % y un
 * «Continuar» ahí no tendría sentido, aunque `CourseProgress` siga en curso —y
 * sigue en curso a propósito: el filtro es una lente, no un cambio en lo que el
 * curso es—.
 */
function ctaLabelFor(progress: CourseProgressSummary): CourseSummary["ctaLabel"] {
  if (progress.totalLessons > 0 && progress.completedLessons === progress.totalLessons) return "Revisar";
  if (progress.completedLessons > 0 || progress.statusCode === PROGRESS_STATUS.IN_PROGRESS) return "Continuar";
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
    ctaLabel: ctaLabelFor(progress),
    href: platformRoutes.courseDetail(course.id),
  };
}

function mapChapterItem(
  course: CourseWithContent,
  chapter: CourseWithContent["chapters"][number],
  state: UserCourseState,
): CourseChapterItem {
  // Sobre las visibles: la barra del capítulo tiene que cuadrar con la lista
  // que se abre al pulsarla.
  const lessons = chapter.lessons.filter((lesson) => isVisible(lesson, state));
  const completedLessons = lessons.filter(
    (lesson) => state.lessonStatus.get(lesson.id) === PROGRESS_STATUS.COMPLETED,
  ).length;
  return {
    id: chapter.id,
    order: chapter.order,
    name: chapter.name,
    description: chapter.description ?? undefined,
    estimatedDuration: chapter.estimatedDuration ?? undefined,
    totalLessons: lessons.length,
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
    cover: course.cover ?? undefined,
    typeLabel: course.type.label,
    levelLabels: course.courseLevels.map((courseLevel) => courseLevel.level.label),
    authors: course.courseAuthors.map((courseAuthor) => ({
      name: courseAuthor.author.name,
      roleLabel: courseAuthor.role.label,
    })),
    progress,
    continueHref: continueTarget(course, state),
    ctaLabel: ctaLabelFor(progress),
    onlyPriorityLessons: state.onlyPriorityLessons,
    hiddenLessons: allLessons(course).length - progress.totalLessons,
    chapters: sortByRole(
      course.chapters.map((chapter) => ({ ...chapter, roleCode: chapter.role?.code })),
    ).map((chapter) => mapChapterItem(course, chapter, state)),
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

  // El número que se pinta sigue siendo el REAL (1, 4, 7 con el filtro puesto):
  // renumerar escondería que faltan lecciones y rompería la identidad de cada
  // una dentro del curso.
  const lessons: ChapterLessonItem[] = sortByRole(
    chapter.lessons.map((lesson) => ({ ...lesson, roleCode: lesson.role?.code })),
  )
    .filter((lesson) => isVisible(lesson, state))
    .map((lesson) => ({
      id: lesson.id,
      order: lesson.order,
      name: lesson.name,
      description: lesson.description ?? undefined,
      isPriority: lesson.isPriority,
      estimatedDuration: lesson.estimatedDuration ?? undefined,
      statusCode: asStatus(state.lessonStatus.get(lesson.id)),
      href: platformRoutes.lessonDetail(lesson.id),
    }));

  const hiddenLessons = chapter.lessons.length - lessons.length;
  const completedLessons = lessons.filter((lesson) => lesson.statusCode === PROGRESS_STATUS.COMPLETED).length;

  // El botón del capítulo abre por donde se quedó: la primera sin completar.
  // Si ya están todas, la primera, que es lo que toca para repasar.
  const target = lessons.find((lesson) => lesson.statusCode !== PROGRESS_STATUS.COMPLETED) ?? lessons[0];
  const allDone = lessons.length > 0 && completedLessons === lessons.length;
  const untouched = lessons.every((lesson) => lesson.statusCode === PROGRESS_STATUS.NOT_STARTED);

  return {
    courseId: course.id,
    courseName: course.name,
    courseHref: platformRoutes.courseDetail(course.id),
    id: chapter.id,
    order: chapter.order,
    name: chapter.name,
    description: chapter.description ?? undefined,
    estimatedDuration: chapter.estimatedDuration ?? undefined,
    completedLessons,
    totalLessons: lessons.length,
    hiddenLessons,
    onlyPriorityLessons: state.onlyPriorityLessons,
    lessons,
    continueHref: target ? target.href : platformRoutes.courseDetail(course.id),
    ctaLabel: allDone ? "Revisar" : untouched ? "Comenzar" : "Continuar",
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
  pgn: string;
  /** La partida de la colección del curso, si la lección la referencia. */
  game: { pgn: string } | null;
  orientation: { code: string };
  exercises: { id: string }[];
}

export function mapLessonView(
  course: CourseWithContent,
  lesson: LessonRowForView,
  state: UserCourseState,
): LessonView | null {
  const chapter = course.chapters.find((candidate) => candidate.id === lesson.chapterId);
  if (!chapter) return null;

  // Anterior y siguiente se buscan POR POSICIÓN, no por pertenencia: una
  // lección escondida por el filtro se sigue sirviendo por URL —un enlace de
  // una clase no puede romperse por una preferencia de visualización— y ahí
  // buscarla en la lista visible daría -1, dejándola sin anterior Y sin
  // siguiente.
  const position = (candidate: { chapterOrder: number; order: number }) =>
    candidate.chapterOrder * 100000 + candidate.order;
  const here = position({ chapterOrder: chapter.order, order: lesson.order });

  const visible = flattenLessons(course, state);
  const prev = [...visible].reverse().find((candidate) => position(candidate) < here);
  const next = visible.find((candidate) => position(candidate) > here);

  // La orientación del contenido manda salvo que el usuario fuerce una en sus
  // ajustes del curso (AUTO o ausencia de fila = la de la lección).
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
    chapterLessonCount: chapter.lessons.length,
    id: lesson.id,
    order: lesson.order,
    name: lesson.name,
    description: lesson.description ?? undefined,
    isPriority: lesson.isPriority,
    estimatedDuration: lesson.estimatedDuration ?? undefined,
    pgn: lessonPgnOf(lesson),
    orientation: effective === BOARD_ORIENTATION.BLACK ? "black" : "white",
    statusCode: asStatus(state.lessonStatus.get(lesson.id)),
    exerciseCount: lesson.exercises.length,
    prevLessonHref: prev ? platformRoutes.lessonDetail(prev.id) : undefined,
    nextLessonHref: next ? platformRoutes.lessonDetail(next.id) : undefined,
    chapterHref: platformRoutes.chapterDetail(course.id, chapter.order),
    trainerHref: lesson.exercises.length > 0 ? `${platformRoutes.trainer}?lesson=${lesson.id}` : undefined,
  };
}
