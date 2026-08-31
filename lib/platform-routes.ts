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

/**
 * Panel del profesor. La llave es la existencia de una fila `Teacher` activa
 * (ver lib/platform-auth/roles.ts); un profesor sigue siendo además un usuario
 * normal, así que estas rutas conviven con las de `platformRoutes`.
 */
export const teacherRoutes = {
  home: "/teacher",
  students: "/teacher/students",
  studentDetail: (studentId: string) => `/teacher/students/${studentId}`,
  studentStudy: (studentId: string, studyId: string) => `/teacher/students/${studentId}/studies/${studyId}`,
  studentGame: (studentId: string, studyId: string, gameId: string) =>
    `/teacher/students/${studentId}/studies/${studyId}/games/${gameId}`,
  classes: "/teacher/classes",
  newClass: "/teacher/classes/new",
  classDetail: (classId: string) => `/teacher/classes/${classId}`,
  classEdit: (classId: string) => `/teacher/classes/${classId}/edit`,
  profile: "/teacher/profile",
} as const;

/**
 * Panel del Administrador/Editor. Cuelga de `/staff` y no de `/admin` porque
 * esa ruta es del panel de Payload (el CMS del sitio público, otra base de
 * datos y otro login: nada que ver con estos roles).
 */
export const staffRoutes = {
  home: "/staff",
  students: "/staff/students",
  newStudent: "/staff/students/new",
  studentDetail: (userId: string) => `/staff/students/${userId}`,
  teachers: "/staff/teachers",
  newTeacher: "/staff/teachers/new",
  teacherDetail: (teacherId: string) => `/staff/teachers/${teacherId}`,
  courses: "/staff/courses",
  newCourse: "/staff/courses/new",
  courseDetail: (courseId: string) => `/staff/courses/${courseId}`,
  chapterDetail: (courseId: string, chapterId: string) => `/staff/courses/${courseId}/chapters/${chapterId}`,
  lessonDetail: (courseId: string, chapterId: string, lessonId: string) =>
    `/staff/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}`,
  authors: "/staff/authors",
  classes: "/staff/classes",
  staffClassDetail: (classId: string) => `/staff/classes/${classId}`,
} as const;
