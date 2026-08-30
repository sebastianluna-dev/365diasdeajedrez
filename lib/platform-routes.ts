// Constructores de rutas de la plataforma autenticada. Centralizados para que
// un cambio de jerarquía no obligue a cazar template strings por la UI.

export const platformRoutes = {
  dashboard: "/dashboard",
  classes: "/classes",
  classDetail: (classId: string) => `/classes/${classId}`,
  studies: "/studies",
  studyDetail: (studyId: string) => `/studies/${studyId}`,
  gameDetail: (studyId: string, gameId: string) => `/studies/${studyId}/games/${gameId}`,
  courses: "/courses",
  courseDetail: (courseId: string) => `/courses/${courseId}`,
  chapterDetail: (courseId: string, chapterId: string) => `/courses/${courseId}/chapters/${chapterId}`,
  lessonDetail: (courseId: string, chapterId: string, lessonId: string) =>
    `/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}`,
  trainer: "/trainer",
} as const;
