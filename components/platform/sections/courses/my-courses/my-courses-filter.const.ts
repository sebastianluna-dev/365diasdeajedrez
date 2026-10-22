import type { MyCourseItem } from "@/services/courses/courses.types";

/** The views of «Mis cursos», by the value `?estado=` carries; «Todos» carries none. */
export const MY_COURSES_FILTERS = [
  { value: undefined, label: "Todos", icon: "graduation-cap" },
  { value: "en-curso", label: "En curso", icon: "play" },
  { value: "completados", label: "Completados", icon: "circle-check" },
  { value: "sin-empezar", label: "Sin empezar", icon: "clock" },
] as const;

export type MyCoursesFilter = (typeof MY_COURSES_FILTERS)[number]["value"];

/** The view an address asks for; anything else is «Todos». */
export function myCoursesFilterOf(value: string | undefined): MyCoursesFilter {
  return MY_COURSES_FILTERS.find((filter) => filter.value === value)?.value;
}

/** Which view a course belongs to: finished, begun, or with no lesson learned yet. */
export function courseStateOf(course: MyCourseItem): Exclude<MyCoursesFilter, undefined> {
  if (course.isCompleted) return "completados";
  return course.progress.completedLessons > 0 ? "en-curso" : "sin-empezar";
}

/** The courses a view shows, in the list's order. */
export function filterMyCourses(courses: MyCourseItem[], filter: MyCoursesFilter): MyCourseItem[] {
  return filter === undefined ? courses : courses.filter((course) => courseStateOf(course) === filter);
}

/**
 * The course «Sigue donde ibas» offers: the first one begun and not finished
 * that has a lesson to open, in the list's order (by name, as the dashboard's
 * «Continuar estudiando»).
 */
export function resumeCourseOf(courses: MyCourseItem[]): MyCourseItem | undefined {
  return courses.find((course) => courseStateOf(course) === "en-curso" && course.learnHref);
}
