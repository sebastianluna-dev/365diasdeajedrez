import type { PlatformSideNavGroup } from "@/components/platform/shared/platform-side-nav/platform-side-nav.comp";
import { platformRoutes } from "@/lib/platform-routes";
import type { CourseLevelItem, CourseSummary, MyCourseItem } from "@/services/courses/courses.types";
import { MY_COURSES_FILTERS, courseStateOf, type MyCoursesFilter } from "./my-courses/my-courses-filter.const";

/** Which of the two collections is on screen, and its view. */
export type CoursesView = { kind: "mine"; filter: MyCoursesFilter } | { kind: "catalog"; level?: string };

/** The six colours of the levels; a seventh level would repeat the last. */
const LEVEL_TONES = 6;

/**
 * The side column of «Cursos», the same on «Mis cursos» and on the catalog,
 * as Gmail's labels: the student's courses by state, and the catalog whole
 * and by level, each with its count, the view on screen lit.
 */
export function coursesNavGroups(
  mine: MyCourseItem[],
  catalog: CourseSummary[],
  levels: CourseLevelItem[],
  view: CoursesView,
): PlatformSideNavGroup[] {
  const mineOf = (value: MyCoursesFilter) =>
    value === undefined ? mine.length : mine.filter((course) => courseStateOf(course) === value).length;

  return [
    {
      title: "Tus cursos",
      links: MY_COURSES_FILTERS.map(({ value, label, icon }) => ({
        label,
        icon,
        href: value === undefined ? platformRoutes.courses : `${platformRoutes.courses}?estado=${value}`,
        count: mineOf(value),
        current: view.kind === "mine" && view.filter === value,
      })),
    },
    {
      title: "Catálogo",
      links: [
        {
          label: "Todo el catálogo",
          href: platformRoutes.courseCatalog,
          count: catalog.length,
          icon: "book-open",
          current: view.kind === "catalog" && view.level === undefined,
        },
        ...levels.map((level, index) => ({
          label: level.name,
          href: platformRoutes.coursesOfLevel(level.slug),
          count: catalog.filter((course) => course.levels.some((one) => one.slug === level.slug)).length,
          level: Math.min(index + 1, LEVEL_TONES),
          current: view.kind === "catalog" && view.level === level.slug,
        })),
      ],
    },
  ];
}
