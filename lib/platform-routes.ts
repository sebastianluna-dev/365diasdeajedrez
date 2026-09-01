// Constructores de rutas de la plataforma autenticada. Centralizados para que
// un cambio de jerarquía no obligue a cazar template strings por la UI.
//
// Las URLs son en español porque el producto lo es: lo que ve el alumno en la
// barra del navegador está en su idioma, hasta el último segmento. Lo único
// que queda en inglés son los NOMBRES de los parámetros dinámicos
// (`[courseId]`, `[studyId]`…), que no salen en la URL —lo que se ve ahí es su
// valor— y son identificadores del código, no texto para el usuario.

export const platformRoutes = {
  dashboard: "/inicio",
  classes: "/clases",
  classDetail: (classId: string) => `/clases/${classId}`,
  studies: "/estudios",
  /**
   * Colección derivada, no una base de datos: las partidas que el alumno ha
   * visto en sus clases. Segmento fijo, así que gana a `/estudios/[studyId]`.
   */
  classGames: "/estudios/clases",
  studyDetail: (studyId: string) => `/estudios/${studyId}`,
  gameDetail: (studyId: string, gameId: string) => `/estudios/${studyId}/partidas/${gameId}`,
  gameEdit: (studyId: string, gameId: string) => `/estudios/${studyId}/partidas/${gameId}/editar`,
  newStudyGame: (studyId: string) => `/estudios/${studyId}/partidas/nueva`,
  courses: "/cursos",
  /**
   * Las rutas del ALUMNO van por slug: son las que se comparten y se leen. El
   * panel de staff sigue yendo por id a propósito —allí el slug es un campo
   * editable, y cambiarlo dejaría al staff en una URL que ya no existe—.
   */
  courseDetail: (courseSlug: string) => `/cursos/${courseSlug}`,
  chapterDetail: (courseSlug: string, chapterSlug: string) => `/cursos/${courseSlug}/capitulos/${chapterSlug}`,
  lessonDetail: (courseSlug: string, chapterSlug: string, lessonId: string) =>
    `/cursos/${courseSlug}/capitulos/${chapterSlug}/lecciones/${lessonId}`,
  trainer: "/entrenador",
  /** Buscador de partidas por posición; lo comparten alumno y profesor. */
  explorer: "/explorador",
} as const;

/**
 * Panel del profesor. La llave es la existencia de una fila `Teacher` activa
 * (ver lib/platform-auth/roles.ts); un profesor sigue siendo además un usuario
 * normal, así que estas rutas conviven con las de `platformRoutes` aunque el
 * menú ya no las pinte juntas (ver constants/platform/nav-items.const.ts).
 */
export const teacherRoutes = {
  home: "/profesor",
  students: "/profesor/alumnos",
  studentDetail: (studentId: string) => `/profesor/alumnos/${studentId}`,
  studentStudy: (studentId: string, studyId: string) => `/profesor/alumnos/${studentId}/estudios/${studyId}`,
  studentGame: (studentId: string, studyId: string, gameId: string) =>
    `/profesor/alumnos/${studentId}/estudios/${studyId}/partidas/${gameId}`,
  classes: "/profesor/clases",
  newClass: "/profesor/clases/nuevo",
  classDetail: (classId: string) => `/profesor/clases/${classId}`,
  classEdit: (classId: string) => `/profesor/clases/${classId}/editar`,
  profile: "/profesor/perfil",
} as const;

/**
 * Panel del Administrador/Editor. Cuelga de `/administracion` y no de `/admin`
 * porque esa ruta es del panel de Payload (el CMS del sitio público, otra base
 * de datos y otro login: nada que ver con estos roles). Sin tilde a propósito:
 * una URL con caracteres no ASCII se transmite percent-encoded y se vuelve
 * ilegible al copiarla.
 */
export const staffRoutes = {
  home: "/administracion",
  students: "/administracion/alumnos",
  newStudent: "/administracion/alumnos/nuevo",
  studentDetail: (userId: string) => `/administracion/alumnos/${userId}`,
  teachers: "/administracion/profesores",
  newTeacher: "/administracion/profesores/nuevo",
  teacherDetail: (teacherId: string) => `/administracion/profesores/${teacherId}`,
  courses: "/administracion/cursos",
  newCourse: "/administracion/cursos/nuevo",
  courseDetail: (courseId: string) => `/administracion/cursos/${courseId}`,
  chapterDetail: (courseId: string, chapterId: string) =>
    `/administracion/cursos/${courseId}/capitulos/${chapterId}`,
  lessonDetail: (courseId: string, chapterId: string, lessonId: string) =>
    `/administracion/cursos/${courseId}/capitulos/${chapterId}/lecciones/${lessonId}`,
  authors: "/administracion/autores",
  classes: "/administracion/clases",
  staffClassDetail: (classId: string) => `/administracion/clases/${classId}`,
} as const;

/**
 * Portada que le toca a cada quien: con el menú excluyente por rol (ver
 * nav-items.const.ts) el dashboard del alumno deja de estar en el menú del
 * profesor y del staff, así que mandarlos ahí tras el login los dejaría en una
 * página sin salida. Mismo orden de precedencia que el menú.
 */
export function homeRouteFor(roles: { isTeacher: boolean; isStaff: boolean }): string {
  if (roles.isStaff) return staffRoutes.home;
  if (roles.isTeacher) return teacherRoutes.home;
  return platformRoutes.dashboard;
}
