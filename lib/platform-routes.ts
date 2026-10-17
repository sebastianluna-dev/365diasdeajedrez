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
  /** "Mis cursos": the ones the student added. */
  courses: "/cursos",
  /**
   * Every published course, to find the ones to add. Fixed segment, so it
   * wins over `/cursos/[courseRef]`; no course can take "explorar" as its slug
   * (`isReservedCourseSlug`).
   */
  courseCatalog: "/cursos/explorar",
  /** The catalog narrowed to the courses aimed at a level, by the level's slug. */
  coursesOfLevel: (levelSlug: string) => `/cursos/explorar?nivel=${encodeURIComponent(levelSlug)}`,
  /**
   * What a course is, for whoever has not added it yet: addressed by its SLUG,
   * which is the one of the two that can be read and shared.
   */
  courseInfo: (slug: string) => `/cursos/${slug}`,
  /**
   * The STUDENT's routes go by an 8-digit numeric identifier. The staff panel
   * keeps its own: they are two areas with different identifiers on purpose.
   *
   * The chapter is addressed by its ORDER NUMBER within the course, which is the
   * one the student sees on screen. Reordering chapters in the panel reassigns
   * those URLs among them, which is exactly what is expected of an order number.
   */
  /**
   * The course to STUDY, by its id. It shares its segment with `courseInfo`:
   * eight digits are an id and anything else a slug (`isCourseId`).
   */
  courseDetail: (courseId: string) => `/cursos/${courseId}`,
  chapterDetail: (courseId: string, chapterOrder: number) => `/cursos/${courseId}/${chapterOrder}`,
  /**
   * The lesson by its id, under the chapter it belongs to. The id and not an
   * order number: the chapter's own segment is what the layout hangs from, and
   * the lesson is resolved in one query by what identifies it.
   */
  lessonDetail: (courseId: string, chapterOrder: number, lessonId: string) =>
    `/cursos/${courseId}/${chapterOrder}/${lessonId}`,
  /**
   * The lesson's route as the App Router spells it — route groups included,
   * as `revalidatePath(pattern, "page")` wants it (its docs: `/(main)/blog/[slug]`;
   * without the groups it matched nothing, found 2026-10-16) — for
   * revalidating every lesson at once: what the staff panel changes reaches
   * whichever lessons show it, and from there the chapter's order number is
   * not at hand. `lib/platform-routes.test.ts` holds it to the page file.
   */
  lessonPattern: "/(platform)/cursos/[courseRef]/[chapterOrder]/(lesson)/[lessonId]",
  /**
   * The n-th exercise of a lesson (1-based, among the ones in play), solved
   * from the lesson («Ahora practica», D25): behind `EXERCISES_ENABLED`.
   */
  lessonPractice: (courseId: string, chapterOrder: number, lessonId: string, n: number) =>
    `/cursos/${courseId}/${chapterOrder}/${lessonId}/practica/${n}`,
  /** The practice route as the App Router spells it (groups included, like `lessonPattern`), for revalidating every practice page at once. */
  lessonPracticePattern: "/(platform)/cursos/[courseRef]/[chapterOrder]/(practice)/[lessonId]/practica/[n]",
  /**
   * The account: what is the person's own and the one thing they set. It hangs
   * from the root and not from a role's panel, because it is everyone's.
   */
  settings: "/ajustes",
  trainer: "/entrenador",
  /** The Move Trainer over what the student already learned of a course. */
  courseReview: (courseId: string) => `/entrenador?course=${courseId}`,
  /** Game search by position; shared by student and teacher. */
  explorer: "/explorador",
  /** «Jugar»: the way in. It is the gallery of bots until the adventure's cover replaces it. */
  play: "/jugar",
  /** «Partida libre»: choose a bot and a colour. `?rival=<slug>` opens that bot's sheet. */
  freePlay: "/jugar/partida-libre",
  playAgainst: (botSlug: string) => `/jugar/partida-libre?rival=${encodeURIComponent(botSlug)}`,
  /** The adventure shelf: the notebooks to open and the ones that are coming. */
  adventures: "/jugar/aventura",
  /**
   * An adventure's map, by the adventure's slug. `victoria` is the order of the
   * encounter just beaten for the first time: the map plays its victory once
   * and takes the parameter off the address.
   */
  adventureMap: (slug: string, query?: { victoria?: number }) =>
    `/jugar/aventura/${slug}${query?.victoria ? `?victoria=${query.victoria}` : ""}`,
  /** A played game, live or finished: ONE address for both, read-only for whoever holds no seat. */
  playedGame: (gameId: string) => `/jugar/partidas/${gameId}`,
  /**
   * «Ejercicios» (D17, D35): what the student's teacher gave them; from phase 4
   * the library's practice and series too.
   */
  exercises: "/ejercicios",
  /** A series given to the student: its exercises and their marks. */
  exerciseSeries: (seriesId: string) => `/ejercicios/series/${seriesId}`,
  /** The n-th exercise of a series (1-based), counted among the ones the student may solve. */
  exerciseSeriesItem: (seriesId: string, n: number) => `/ejercicios/series/${seriesId}/${n}`,
  /** The own profile: it redirects to `/perfil/<slug>`, so a menu needs no user name. */
  profile: "/perfil",
  /** A person's profile, by their user name. */
  userProfile: (slug: string) => `/perfil/${slug}`,
  /** Every game of a person, a page at a time, filtered by rival and result. */
  userProfileGames: (slug: string, query?: { pagina?: number; rival?: string; resultado?: string }) => {
    const params = new URLSearchParams();
    if (query?.pagina && query.pagina > 1) params.set("pagina", String(query.pagina));
    if (query?.rival) params.set("rival", query.rival);
    if (query?.resultado) params.set("resultado", query.resultado);
    const search = params.toString();
    return `/perfil/${slug}/partidas${search ? `?${search}` : ""}`;
  },
  /** «Herramientas»: the analysis board, with a position, a played game or a study's game to start from. */
  analysisBoard: (source?: { fen?: string; partida?: string; estudio?: string }) => {
    const params = new URLSearchParams();
    if (source?.fen) params.set("fen", source.fen);
    if (source?.partida) params.set("partida", source.partida);
    if (source?.estudio) params.set("estudio", source.estudio);
    const search = params.toString();
    return `/herramientas/tablero-de-analisis${search ? `?${search}` : ""}`;
  },
} as const;

/**
 * Teacher panel. The key is the existence of an active `Teacher` row (see
 * lib/platform-auth/roles.ts); a teacher is also still an ordinary user, so
 * these routes coexist with those of `platformRoutes` even though the menu no
 * longer renders them together (see constants/platform/nav-items.const.ts).
 */
/** `/profesor/ejercicios/nuevo?estudio=…&partida=…`: a new exercise from a game, the move still to be appended. */
function newExerciseFromGame(studyId: string, gameId: string): string {
  const params = new URLSearchParams({ estudio: studyId, partida: gameId });
  return `/profesor/ejercicios/nuevo?${params.toString()}`;
}

export const teacherRoutes = {
  home: "/profesor",
  students: "/profesor/alumnos",
  studentDetail: (studentId: string) => `/profesor/alumnos/${studentId}`,
  studentStudy: (studentId: string, studyId: string) => `/profesor/alumnos/${studentId}/estudios/${studyId}`,
  studentGame: (studentId: string, studyId: string, gameId: string) =>
    `/profesor/alumnos/${studentId}/estudios/${studyId}/partidas/${gameId}`,
  /** The student's exercise attempts, the latest first, a page at a time («Ver más»): D24, behind `EXERCISES_ENABLED`. */
  studentExercises: (studentId: string, query?: { pagina?: number }) =>
    `/profesor/alumnos/${studentId}/ejercicios${query?.pagina && query.pagina > 1 ? `?pagina=${query.pagina}` : ""}`,
  /** The teacher's classes: `?vista=proximas|por-finalizar|pasadas|canceladas&q=&pagina=`. */
  classes: "/profesor/clases",
  classesFiltered: (filters: { vista?: string; q?: string; pagina?: number }) => {
    const params = new URLSearchParams();
    if (filters.vista && filters.vista !== "proximas") params.set("vista", filters.vista);
    if (filters.q) params.set("q", filters.q);
    if (filters.pagina && filters.pagina > 1) params.set("pagina", String(filters.pagina));
    const query = params.toString();
    return query ? `/profesor/clases?${query}` : "/profesor/clases";
  },
  classDetail: (classId: string) => `/profesor/clases/${classId}`,
  /** The teacher's bank: `?vista=archivados` lists the archived ones, `?vista=series` the series. */
  exercises: "/profesor/ejercicios",
  archivedExercises: "/profesor/ejercicios?vista=archivados",
  exerciseSeriesList: "/profesor/ejercicios?vista=series",
  /**
   * A new exercise; `from` opens it on a move of one of the teacher's study
   * games («Crear ejercicio desde aquí», D11): the game's address plus
   * `&jugada=<path>`.
   */
  newExercise: (from?: { studyId: string; gameId: string; path: string }) => {
    if (!from) return "/profesor/ejercicios/nuevo";
    return `${newExerciseFromGame(from.studyId, from.gameId)}&jugada=${encodeURIComponent(from.path)}`;
  },
  /**
   * The game a new exercise starts from, without the move: what the game
   * viewer is given, so it can append `&jugada=<path>` for whichever move the
   * menu or the «Compartir» tab is on.
   */
  newExerciseFromGame,
  exerciseDetail: (exerciseId: string) => `/profesor/ejercicios/${exerciseId}`,
  /** A series of the teacher's: its exercises in order, who has it, its title. */
  exerciseSeries: (seriesId: string) => `/profesor/ejercicios/series/${seriesId}`,
  /** The same series on «Progreso»: who solved what (D24). */
  exerciseSeriesProgress: (seriesId: string) => `/profesor/ejercicios/series/${seriesId}?vista=progreso`,
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
  /** The student's payments and the classes they cover, the second tab of their record. */
  studentPayments: (userId: string) => `/administracion/alumnos/${userId}/pagos`,
  teachers: "/administracion/profesores",
  newTeacher: "/administracion/profesores/nuevo",
  teacherDetail: (teacherId: string) => `/administracion/profesores/${teacherId}`,
  courses: "/administracion/cursos",
  courseDetail: (courseId: string) => `/administracion/cursos/${courseId}`,
  /** The course's chapters, on a page of their own: the list takes the whole width. */
  courseSyllabus: (courseId: string) => `/administracion/cursos/${courseId}/temario`,
  /** The course's games: read-only, they are edited in their chapter. */
  courseGames: (courseId: string) => `/administracion/cursos/${courseId}/partidas`,
  chapterDetail: (courseId: string, chapterId: string) => `/administracion/cursos/${courseId}/capitulos/${chapterId}`,
  /** The chapter's lessons, on a page of their own: the list takes the whole width. */
  chapterLessons: (courseId: string, chapterId: string) =>
    `/administracion/cursos/${courseId}/capitulos/${chapterId}/lecciones`,
  /** The chapter's collection: here the PGN does get pasted. */
  chapterGames: (courseId: string, chapterId: string) =>
    `/administracion/cursos/${courseId}/capitulos/${chapterId}/partidas`,
  /** One game of the collection, on the board: where it is read and edited. */
  chapterGame: (courseId: string, chapterId: string, gameId: string) =>
    `/administracion/cursos/${courseId}/capitulos/${chapterId}/partidas/${gameId}`,
  lessonDetail: (courseId: string, chapterId: string, lessonId: string) =>
    `/administracion/cursos/${courseId}/capitulos/${chapterId}/lecciones/${lessonId}`,
  /** A new exercise of the lesson, in the exercise editor (phase 2 of «Ejercicios»; not behind the flag). */
  lessonExerciseNew: (courseId: string, chapterId: string, lessonId: string) =>
    `/administracion/cursos/${courseId}/capitulos/${chapterId}/lecciones/${lessonId}/ejercicios/nuevo`,
  /** One of the lesson's exercises, in the editor. */
  lessonExercise: (courseId: string, chapterId: string, lessonId: string, exerciseId: string) =>
    `/administracion/cursos/${courseId}/capitulos/${chapterId}/lecciones/${lessonId}/ejercicios/${exerciseId}`,
  classes: "/administracion/clases",
  /** The agenda with its filters in the address: `?vista=proximas|pasadas|canceladas&profesor=&q=&hasta=&pagina=`. */
  classesFiltered: (filters: { vista?: string; profesor?: string; q?: string; hasta?: string; pagina?: number }) => {
    const params = new URLSearchParams();
    if (filters.vista && filters.vista !== "proximas") params.set("vista", filters.vista);
    if (filters.profesor) params.set("profesor", filters.profesor);
    if (filters.q) params.set("q", filters.q);
    if (filters.hasta) params.set("hasta", filters.hasta);
    if (filters.pagina && filters.pagina > 1) params.set("pagina", String(filters.pagina));
    const query = params.toString();
    return query ? `/administracion/clases?${query}` : "/administracion/clases";
  },
  /** «Crear clase»: `?formato=grupal`, `?alumno=<userId>`, `?duplicar=<classId>`. */
  newClass: (params: { formato?: "grupal"; alumno?: string; duplicar?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.formato) query.set("formato", params.formato);
    if (params.alumno) query.set("alumno", params.alumno);
    if (params.duplicar) query.set("duplicar", params.duplicar);
    const text = query.toString();
    return text ? `/administracion/clases/nueva?${text}` : "/administracion/clases/nueva";
  },
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
