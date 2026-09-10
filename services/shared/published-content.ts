import { COURSE_STATUS } from "@/constants/platform/course-codes.const";
import type { Prisma } from "@/lib/platform-db/generated/client";

// Lo que el ALUMNO puede ver o tocar es sólo el contenido de cursos publicados.
// Las lecturas ya lo aplicaban (`getPublishedCourse`, `getTrainerData`), pero
// las escrituras de progreso y el entrenador aceptaban ids sueltos: un POST con
// el id de una lección en borrador sembraba progreso —o devolvía sus
// ejercicios— sin que nada lo parase. Un solo `where` para las tres alturas,
// que se encadena en la consulta en vez de «leer y luego comprobar».

export const publishedCourseWhere = {
  status: { code: COURSE_STATUS.PUBLISHED },
} satisfies Prisma.CourseWhereInput;

export const publishedChapterWhere = {
  course: publishedCourseWhere,
} satisfies Prisma.ChapterWhereInput;

export const publishedLessonWhere = {
  chapter: publishedChapterWhere,
} satisfies Prisma.LessonWhereInput;
