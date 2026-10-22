// Rules of how a course is addressed and worded, shared by the student's pages
// and the staff panel. Pure: nothing here reads the server.

/** The id of a course: eight digits, set by `lib/numeric-id`. */
const COURSE_ID = /^\d{8}$/;

/**
 * Whether what comes in the URL is an id. `/cursos/10000004` is the course to
 * STUDY and `/cursos/mis-60-memorables-partidas` the one to read about: the
 * same segment, told apart by its shape.
 */
export function isCourseId(reference: string): boolean {
  return COURSE_ID.test(reference);
}

/** Segments of `/cursos/…` that are pages of their own and a slug cannot take. */
const RESERVED_SLUGS: readonly string[] = ["catalogo", "explorar"];

/**
 * Whether a slug would never be reached. One that names a page of `/cursos`
 * is shadowed by that page, and one shaped like an id is read as an id.
 */
export function isReservedCourseSlug(slug: string): boolean {
  return RESERVED_SLUGS.includes(slug) || isCourseId(slug);
}

/**
 * Minutes as a length of study is said: "45 min", "20 h", "1 h 30 min".
 * From an hour on the minutes that do not make a quarter are dropped: the
 * figure is an estimate, and "20 h 20 min" claims a precision it does not have.
 */
export function formatDuration(minutes: number): string {
  const total = Math.max(0, Math.round(minutes));
  if (total < 60) return `${total} min`;

  const hours = Math.floor(total / 60);
  const rest = total % 60;
  const quarter = Math.round(rest / 15) * 15;
  if (quarter === 60) return `${hours + 1} h`;
  // Past ten hours nobody plans by the quarter.
  if (quarter === 0 || hours >= 10) return `${hours} h`;
  return `${hours} h ${quarter} min`;
}

/** "lección" or "lecciones", with its figure: the plural loses the accent. */
export function countLessons(count: number): string {
  return `${count} ${count === 1 ? "lección" : "lecciones"}`;
}

/** "capítulo" or "capítulos", with its figure. */
export function countChapters(count: number): string {
  return `${count} ${count === 1 ? "capítulo" : "capítulos"}`;
}
