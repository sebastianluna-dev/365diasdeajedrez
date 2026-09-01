import type {
  AuthorRoleCode,
  CourseStatusCode,
  CourseTypeCode,
  InitialPositionTypeCode,
  PresentationModeCode,
} from "@/constants/platform/course-codes.const";
import type { BoardOrientationCode } from "@/constants/platform/shared-codes.const";
import type { ExerciseModeCode } from "@/constants/platform/training-codes.const";
import { formatSpanishDate } from "@/lib/format-spanish-date";
import { requireStaff } from "@/lib/platform-auth/roles";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { staffRoutes } from "@/lib/platform-routes";
import { isExerciseStale } from "@/services/trainer/trainer.mapper";
import type {
  AuthorAdminRow,
  CatalogOption,
  ChapterAdminDetail,
  CourseAdminDetail,
  CourseAdminSummary,
  LessonAdminDetail,
  TopicOption,
} from "./staff-courses.types";

// Editor de cursos del staff. A diferencia de `services/courses/` —que filtra
// siempre PUBLISHED porque es la vista del alumno— aquí se ven todos los
// estados: el borrador es precisamente lo que hay que poder editar.

export async function listCoursesAdmin(): Promise<CourseAdminSummary[]> {
  await requireStaff();

  const courses = await getPlatformDb().course.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      publishedAt: true,
      status: { select: { code: true, label: true } },
      type: { select: { label: true } },
      chapters: { select: { _count: { select: { lessons: true } } } },
    },
    orderBy: [{ status: { order: "asc" } }, { name: "asc" }],
  });

  return courses.map((course) => ({
    id: course.id,
    name: course.name,
    slug: course.slug,
    statusCode: course.status.code as CourseStatusCode,
    statusLabel: course.status.label,
    typeLabel: course.type.label,
    chapterCount: course.chapters.length,
    lessonCount: course.chapters.reduce((total, chapter) => total + chapter._count.lessons, 0),
    publishedAtLabel: course.publishedAt ? formatSpanishDate(course.publishedAt) : undefined,
    href: staffRoutes.courseDetail(course.id),
  }));
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
          _count: { select: { lessons: true, progresses: true } },
          lessons: { select: { pgn: true } },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!course) return null;

  // Requisito mínimo para publicar: al menos un capítulo con una lección que
  // tenga PGN. Publicar un curso vacío enseñaría lecciones en blanco.
  const canPublish = course.chapters.some((chapter) =>
    chapter.lessons.some((lesson) => lesson.pgn.trim().length > 0),
  );

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
    chapters: course.chapters.map((chapter) => ({
      id: chapter.id,
      name: chapter.name,
      order: chapter.order,
      lessonCount: chapter._count.lessons,
      progressCount: chapter._count.progresses,
      href: staffRoutes.chapterDetail(course.id, chapter.id),
    })),
    canPublish,
  };
}

export async function getChapterAdmin(courseId: string, chapterId: string): Promise<ChapterAdminDetail | null> {
  await requireStaff();

  const chapter = await getPlatformDb().chapter.findFirst({
    where: { id: chapterId, courseId },
    select: {
      id: true,
      slug: true,
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
          pgn: true,
          _count: { select: { exercises: true, progresses: true } },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!chapter) return null;

  return {
    id: chapter.id,
    slug: chapter.slug,
    courseId: chapter.courseId,
    courseName: chapter.course.name,
    courseStatusCode: chapter.course.status.code as CourseStatusCode,
    name: chapter.name,
    description: chapter.description ?? undefined,
    order: chapter.order,
    estimatedDuration: chapter.estimatedDuration ?? undefined,
    lessons: chapter.lessons.map((lesson) => ({
      id: lesson.id,
      name: lesson.name,
      order: lesson.order,
      isPriority: lesson.isPriority,
      hasPgn: lesson.pgn.trim().length > 0,
      exerciseCount: lesson._count.exercises,
      progressCount: lesson._count.progresses,
      href: staffRoutes.lessonDetail(chapter.courseId, chapter.id, lesson.id),
    })),
  };
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
      estimatedDuration: true,
      initialFen: true,
      pgn: true,
      pgnUpdatedAt: true,
      presentationMode: { select: { code: true } },
      initialPositionType: { select: { code: true } },
      orientation: { select: { code: true } },
      chapter: { select: { name: true, courseId: true, course: { select: { name: true } } } },
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
    estimatedDuration: lesson.estimatedDuration ?? undefined,
    presentationModeCode: lesson.presentationMode.code as PresentationModeCode,
    initialPositionTypeCode: lesson.initialPositionType.code as InitialPositionTypeCode,
    initialFen: lesson.initialFen ?? undefined,
    orientationCode: lesson.orientation.code as BoardOrientationCode,
    pgn: lesson.pgn,
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

export async function listPresentationModes(): Promise<CatalogOption[]> {
  await requireStaff();
  return getPlatformDb().presentationMode.findMany({ select: { code: true, label: true }, orderBy: { order: "asc" } });
}

export async function listInitialPositionTypes(): Promise<CatalogOption[]> {
  await requireStaff();
  return getPlatformDb().initialPositionType.findMany({ select: { code: true, label: true }, orderBy: { order: "asc" } });
}

export async function listExerciseModes(): Promise<CatalogOption[]> {
  await requireStaff();
  return getPlatformDb().exerciseMode.findMany({ select: { code: true, label: true }, orderBy: { order: "asc" } });
}

export async function listAuthorRoles(): Promise<CatalogOption[]> {
  await requireStaff();
  return getPlatformDb().authorRole.findMany({ select: { code: true, label: true }, orderBy: { order: "asc" } });
}
