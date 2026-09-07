import {
  COURSE_STATUS,
  type AuthorRoleCode,
  type CourseStatusCode,
  type CourseTypeCode,
} from "@/constants/platform/course-codes.const";
import type { BoardOrientationCode } from "@/constants/platform/shared-codes.const";
import type { ExerciseModeCode } from "@/constants/platform/training-codes.const";
import { extractMainline } from "@/lib/chess/mainline";
import { formatSpanishDate } from "@/lib/format-spanish-date";
import { requireStaff } from "@/lib/platform-auth/roles";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { staffRoutes } from "@/lib/platform-routes";
import { sortByRole } from "@/services/shared/content-order";
import { lessonHasContent, lessonPgnOf, lessonPgnSelect } from "@/services/shared/lesson-pgn";
import { isExerciseStale } from "@/services/trainer/trainer.mapper";
import type {
  AuthorAdminRow,
  CatalogOption,
  ChapterAdminDetail,
  CourseAdminDetail,
  CourseAdminFilter,
  CourseAdminList,
  CourseGameRow,
  LessonAdminDetail,
  TopicOption,
} from "./staff-courses.types";

function isCourseStatusCode(value: string | undefined): value is CourseStatusCode {
  return value !== undefined && (Object.values(COURSE_STATUS) as string[]).includes(value);
}

// Editor de cursos del staff. A diferencia de `services/courses/` —que filtra
// siempre PUBLISHED porque es la vista del alumno— aquí se ven todos los
// estados: el borrador es precisamente lo que hay que poder editar.

/**
 * La lista del panel, filtrada por lo que se haya pedido en la URL.
 *
 * El filtro se resuelve en la CONSULTA y no en memoria: el catálogo crece con
 * los años y buscar en el cliente obligaría a traerlo entero para descartar
 * casi todo. Por eso también los totales se cuentan sobre lo que se ve —son el
 * pie de la búsqueda, no del catálogo—.
 *
 * Un `status` que no sea un code del catálogo se ignora en vez de dar cero
 * resultados: viene de la URL y una URL a mano no debería parecer una lista
 * vacía.
 */
export async function listCoursesAdmin(filter: CourseAdminFilter = {}): Promise<CourseAdminList> {
  await requireStaff();

  const query = filter.query?.trim();
  const status = isCourseStatusCode(filter.status) ? filter.status : undefined;

  const courses = await getPlatformDb().course.findMany({
    where: {
      ...(status ? { status: { code: status } } : {}),
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" as const } },
              { slug: { contains: query, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      name: true,
      slug: true,
      cover: true,
      publishedAt: true,
      status: { select: { code: true, label: true } },
      type: { select: { label: true } },
      chapters: { select: { _count: { select: { lessons: true } } } },
    },
    orderBy: [{ status: { order: "asc" } }, { name: "asc" }],
  });

  const rows = courses.map((course) => ({
    id: course.id,
    name: course.name,
    slug: course.slug,
    cover: course.cover ?? undefined,
    statusCode: course.status.code as CourseStatusCode,
    statusLabel: course.status.label,
    typeLabel: course.type.label,
    chapterCount: course.chapters.length,
    lessonCount: course.chapters.reduce((total, chapter) => total + chapter._count.lessons, 0),
    publishedAtLabel: course.publishedAt ? formatSpanishDate(course.publishedAt) : undefined,
    href: staffRoutes.courseDetail(course.id),
  }));

  return {
    courses: rows,
    chapterCount: rows.reduce((total, course) => total + course.chapterCount, 0),
    lessonCount: rows.reduce((total, course) => total + course.lessonCount, 0),
  };
}

export async function getCourseAdminDetail(courseId: string): Promise<CourseAdminDetail | null> {
  await requireStaff();

  const course = await getPlatformDb().course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      cover: true,
      publishedAt: true,
      type: { select: { code: true } },
      status: { select: { code: true, label: true } },
      courseLevels: { select: { level: { select: { code: true } } } },
      courseAuthors: {
        select: {
          authorId: true,
          order: true,
          author: { select: { name: true } },
          role: { select: { code: true, label: true } },
        },
        orderBy: { order: "asc" },
      },
      chapters: {
        select: {
          id: true,
          name: true,
          order: true,
          role: { select: { code: true, label: true } },
          _count: { select: { lessons: true, progresses: true } },
          lessons: { select: lessonPgnSelect },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!course) return null;

  // Requisito mínimo para publicar: al menos un capítulo con una lección que
  // tenga PGN. Publicar un curso vacío enseñaría lecciones en blanco.
  const canPublish = course.chapters.some((chapter) => chapter.lessons.some(lessonHasContent));

  return {
    id: course.id,
    name: course.name,
    slug: course.slug,
    description: course.description ?? undefined,
    cover: course.cover ?? undefined,
    typeCode: course.type.code as CourseTypeCode,
    statusCode: course.status.code as CourseStatusCode,
    statusLabel: course.status.label,
    publishedAtLabel: course.publishedAt ? formatSpanishDate(course.publishedAt) : undefined,
    levelCodes: course.courseLevels.map((courseLevel) => courseLevel.level.code),
    authors: course.courseAuthors.map((author) => ({
      authorId: author.authorId,
      authorName: author.author.name,
      roleCode: author.role.code as AuthorRoleCode,
      roleLabel: author.role.label,
      order: author.order,
    })),
    // La introducción delante y el cierre al final; el resto, en su orden.
    chapters: sortByRole(
      course.chapters.map((chapter) => ({
        roleCode: chapter.role?.code,
        roleLabel: chapter.role?.label,
        id: chapter.id,
        name: chapter.name,
        order: chapter.order,
        lessonCount: chapter._count.lessons,
        progressCount: chapter._count.progresses,
        href: staffRoutes.chapterDetail(course.id, chapter.id),
      })),
    ),
    canPublish,
  };
}

export async function getChapterAdmin(courseId: string, chapterId: string): Promise<ChapterAdminDetail | null> {
  await requireStaff();

  const chapter = await getPlatformDb().chapter.findFirst({
    where: { id: chapterId, courseId },
    select: {
      id: true,
      courseId: true,
      name: true,
      description: true,
      order: true,
      estimatedDuration: true,
      course: { select: { name: true, status: { select: { code: true } } } },
      lessons: {
        select: {
          id: true,
          name: true,
          order: true,
          isPriority: true,
          role: { select: { code: true, label: true } },
          ...lessonPgnSelect,
          _count: { select: { exercises: true, progresses: true } },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!chapter) return null;

  return {
    id: chapter.id,
    courseId: chapter.courseId,
    courseName: chapter.course.name,
    courseStatusCode: chapter.course.status.code as CourseStatusCode,
    name: chapter.name,
    description: chapter.description ?? undefined,
    order: chapter.order,
    estimatedDuration: chapter.estimatedDuration ?? undefined,
    lessons: sortByRole(
      chapter.lessons.map((lesson) => ({
        roleCode: lesson.role?.code,
        roleLabel: lesson.role?.label,
        id: lesson.id,
        name: lesson.name,
        order: lesson.order,
        isPriority: lesson.isPriority,
        hasPgn: lessonHasContent(lesson),
        exerciseCount: lesson._count.exercises,
        progressCount: lesson._count.progresses,
        href: staffRoutes.lessonDetail(chapter.courseId, chapter.id, lesson.id),
      })),
    ),
  };
}

/**
 * Partidas de una colección, para listarlas o vincularlas a una lección.
 *
 * Las colecciones son por CAPÍTULO. `scope` decide qué se pide: la de un
 * capítulo —lo que puede usar una lección suya— o todas las del curso, que es
 * la vista de conjunto de la ficha del curso.
 *
 * El texto libre casa contra los dos jugadores, el evento, la apertura y el
 * nombre, que es por lo que se busca una partida.
 *
 * `moveCount` sale de contar la línea principal del PGN. Se hace aquí y no en
 * la base porque el PGN es texto: es el precio de tener una sola fuente del
 * contenido, y una colección son decenas de partidas, no miles.
 */
/**
 * Cuántas partidas hay, sin traérselas.
 *
 * Lo pide la pestaña de la ficha, que sólo necesita el número: la lista de un
 * curso son cientos de filas y cada una arrastra su PGN entero para contar las
 * jugadas.
 */
export async function countCollectionGames(
  scope: { courseId: string } | { chapterId: string },
): Promise<number> {
  await requireStaff();
  return getPlatformDb().game.count({ where: { database: scope } });
}

export async function listCollectionGames(
  scope: { courseId: string } | { chapterId: string },
  query?: string,
): Promise<CourseGameRow[]> {
  await requireStaff();

  const search = query?.trim();
  const games = await getPlatformDb().game.findMany({
    where: {
      database: scope,
      ...(search
        ? {
            OR: [
              { white: { contains: search, mode: "insensitive" as const } },
              { black: { contains: search, mode: "insensitive" as const } },
              { event: { contains: search, mode: "insensitive" as const } },
              { eco: { contains: search, mode: "insensitive" as const } },
              { title: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      title: true,
      white: true,
      black: true,
      event: true,
      eco: true,
      playedAt: true,
      pgn: true,
      database: { select: { chapter: { select: { name: true, order: true } } } },
      _count: { select: { lessons: true } },
    },
    // En la vista del curso salen agrupadas por capítulo y en su orden; dentro
    // de uno, en el suyo.
    orderBy: [{ database: { chapter: { order: "asc" } } }, { order: "asc" }],
  });

  return games.map((game) => ({
    id: game.id,
    chapterName: game.database.chapter?.name,
    title: game.title ?? `${game.white} — ${game.black}`,
    detail: [game.event, game.playedAt?.getUTCFullYear(), game.eco].filter(Boolean).join(" · "),
    moveCount: extractMainline(game.pgn)?.sans.length ?? 0,
    lessonCount: game._count.lessons,
  }));
}

export async function getLessonAdmin(chapterId: string, lessonId: string): Promise<LessonAdminDetail | null> {
  await requireStaff();

  const lesson = await getPlatformDb().lesson.findFirst({
    where: { id: lessonId, chapterId },
    select: {
      id: true,
      chapterId: true,
      name: true,
      description: true,
      order: true,
      isPriority: true,
      isTrainable: true,
      trainingColor: { select: { code: true } },
      estimatedDuration: true,
      pgn: true,
      game: {
        select: { id: true, title: true, white: true, black: true, event: true, eco: true, playedAt: true, pgn: true },
      },
      gameId: true,
      pgnUpdatedAt: true,
      orientation: { select: { code: true } },
      chapter: {
        select: {
          name: true,
          courseId: true,
          course: { select: { name: true, status: { select: { code: true } } } },
        },
      },
      _count: { select: { progresses: true } },
      lessonTopics: { select: { topicId: true } },
      exercises: {
        select: {
          id: true,
          order: true,
          promptText: true,
          line: true,
          startPly: true,
          endPly: true,
          frozenAt: true,
          mode: { select: { code: true, label: true } },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!lesson) return null;

  return {
    id: lesson.id,
    chapterId: lesson.chapterId,
    chapterName: lesson.chapter.name,
    courseId: lesson.chapter.courseId,
    courseName: lesson.chapter.course.name,
    name: lesson.name,
    description: lesson.description ?? undefined,
    order: lesson.order,
    isPriority: lesson.isPriority,
    isTrainable: lesson.isTrainable,
    trainingColorCode: lesson.trainingColor?.code,
    estimatedDuration: lesson.estimatedDuration ?? undefined,
    orientationCode: lesson.orientation.code as BoardOrientationCode,
    canDelete:
      lesson.chapter.course.status.code === COURSE_STATUS.DRAFT && lesson._count.progresses === 0,
    pgn: lessonPgnOf(lesson),
    game: lesson.game
      ? {
          id: lesson.game.id,
          title: lesson.game.title ?? `${lesson.game.white} — ${lesson.game.black}`,
          detail: [lesson.game.event, lesson.game.playedAt?.getUTCFullYear(), lesson.game.eco]
            .filter(Boolean)
            .join(" · "),
          moveCount: extractMainline(lesson.game.pgn)?.sans.length ?? 0,
          lessonCount: 0,
        }
      : undefined,
    pgnUpdatedAtLabel: lesson.pgnUpdatedAt ? formatSpanishDate(lesson.pgnUpdatedAt) : undefined,
    topicIds: lesson.lessonTopics.map((lessonTopic) => lessonTopic.topicId),
    exercises: lesson.exercises.map((exercise) => ({
      id: exercise.id,
      order: exercise.order,
      modeCode: exercise.mode.code as ExerciseModeCode,
      modeLabel: exercise.mode.label,
      promptText: exercise.promptText ?? undefined,
      line: exercise.line,
      startPly: exercise.startPly,
      endPly: exercise.endPly,
      // Mismo criterio que el entrenador del alumno: una sola definición de
      // «desactualizado».
      isStale: isExerciseStale(exercise.frozenAt, lesson.pgnUpdatedAt),
    })),
  };
}

export async function listAuthors(): Promise<AuthorAdminRow[]> {
  await requireStaff();

  const authors = await getPlatformDb().author.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      bio: true,
      photo: true,
      _count: { select: { courseAuthors: true } },
    },
    orderBy: { name: "asc" },
  });

  return authors.map((author) => ({
    id: author.id,
    name: author.name,
    slug: author.slug,
    bio: author.bio ?? undefined,
    photo: author.photo ?? undefined,
    courseCount: author._count.courseAuthors,
  }));
}

// Catálogos: se LEEN para poblar selectores, nunca se editan desde la interfaz
// (sus códigos son estables y la lógica los compara por código).

export async function listCourseTypes(): Promise<CatalogOption[]> {
  await requireStaff();
  return getPlatformDb().courseType.findMany({ where: { isActive: true }, select: { code: true, label: true }, orderBy: { order: "asc" } });
}

export async function listLevels(): Promise<CatalogOption[]> {
  await requireStaff();
  return getPlatformDb().level.findMany({ where: { isActive: true }, select: { code: true, label: true }, orderBy: { order: "asc" } });
}

export async function listTopics(): Promise<TopicOption[]> {
  await requireStaff();
  return getPlatformDb().topic.findMany({ select: { id: true, code: true, label: true }, orderBy: { order: "asc" } });
}

export async function listExerciseModes(): Promise<CatalogOption[]> {
  await requireStaff();
  return getPlatformDb().exerciseMode.findMany({ select: { code: true, label: true }, orderBy: { order: "asc" } });
}

export async function listAuthorRoles(): Promise<CatalogOption[]> {
  await requireStaff();
  return getPlatformDb().authorRole.findMany({ select: { code: true, label: true }, orderBy: { order: "asc" } });
}
