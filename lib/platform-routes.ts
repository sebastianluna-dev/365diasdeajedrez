// Route builders for the authenticated platform. Centralised so that a change
// of hierarchy does not force hunting template strings through the UI.
//
// The URLs are in Spanish because the product is: what the student sees in the
// browser bar is in their language, down to the last segment. The only thing
// left in English are the NAMES of the dynamic parameters (`[courseId]`,
// `[studyId]`…), which do not appear in the URL — what is seen there is their
// value — and are code identifiers, not text for the user.

export const platformRoutes = {
  dashboard: "/inicio",
  classes: "/clases",
  classDetail: (classId: string) => `/clases/${classId}`,
  studies: "/estudios",
  /**
   * Derived collection, not a database: the games the student has seen in their
   * classes. Fixed segment, so it wins over `/estudios/[studyId]`.
   */
  classGames: "/estudios/clases",
  studyDetail: (studyId: string) => `/estudios/${studyId}`,
  /**
   * The game is read and annotated on the SAME screen: its owner plays on the
   * board and uses each move's menu. That is why there is no longer an `/editar`
   * route to maintain in parallel.
   */
  gameDetail: (studyId: string, gameId: string) => `/estudios/${studyId}/partidas/${gameId}`,
  newStudyGame: (studyId: string) => `/estudios/${studyId}/partidas/nueva`,
  courses: "/cursos",
  /**
   * The STUDENT's routes go by an 8-digit numeric identifier. The staff panel
   * keeps its own: they are two areas with different identifiers on purpose.
   *
   * The chapter is addressed by its ORDER NUMBER within the course, which is the
   * one the student sees on screen. Reordering chapters in the panel reassigns
   * those URLs among them, which is exactly what is expected of an order number.
   *
   * The lesson hangs from the root and not from the course: its identifier
   * already locates it, and nesting it forced dragging course and chapter into
   * every link.
   */
  courseDetail: (courseId: string) => `/cursos/${courseId}`,
  chapterDetail: (courseId: string, chapterOrder: number) => `/cursos/${courseId}/${chapterOrder}`,
  lessonDetail: (lessonId: string) => `/lecciones/${lessonId}`,
  trainer: "/entrenador",
  /** Game search by position; shared by student and teacher. */
  explorer: "/explorador",
} as const;

/**
 * Teacher panel. The key is the existence of an active `Teacher` row (see
 * lib/platform-auth/roles.ts); a teacher is also still an ordinary user, so
 * these routes coexist with those of `platformRoutes` even though the menu no
 * longer renders them together (see constants/platform/nav-items.const.ts).
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
 * Administrator/Editor panel. It hangs from `/administracion` and not from
 * `/admin` because that route belongs to Payload's panel (the public site's
 * CMS, another database and another login: nothing to do with these roles).
 * Without an accent on purpose: a URL with non-ASCII characters is transmitted
 * percent-encoded and becomes unreadable when copied.
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
  /** The course's games: read-only, they are edited in their chapter. */
  courseGames: (courseId: string) => `/administracion/cursos/${courseId}/partidas`,
  chapterDetail: (courseId: string, chapterId: string) => `/administracion/cursos/${courseId}/capitulos/${chapterId}`,
  /** The chapter's collection: here the PGN does get pasted. */
  chapterGames: (courseId: string, chapterId: string) =>
    `/administracion/cursos/${courseId}/capitulos/${chapterId}/partidas`,
  lessonDetail: (courseId: string, chapterId: string, lessonId: string) =>
    `/administracion/cursos/${courseId}/capitulos/${chapterId}/lecciones/${lessonId}`,
  authors: "/administracion/autores",
  classes: "/administracion/clases",
  staffClassDetail: (classId: string) => `/administracion/clases/${classId}`,
} as const;

/**
 * The home each person gets: with the menu exclusive by role (see
 * nav-items.const.ts) the student dashboard stops being in the teacher's and
 * the staff's menu, so sending them there after login would leave them on a
 * page with no way out. Same precedence order as the menu.
 */
export function homeRouteFor(roles: { isTeacher: boolean; isStaff: boolean }): string {
  if (roles.isStaff) return staffRoutes.home;
  if (roles.isTeacher) return teacherRoutes.home;
  return platformRoutes.dashboard;
}
