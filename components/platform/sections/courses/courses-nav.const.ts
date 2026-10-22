import type { PlatformSideNavGroup } from "@/components/platform/shared/platform-side-nav/platform-side-nav.comp";
import { platformRoutes } from "@/lib/platform-routes";
import type { CourseLevelItem, CourseSummary, MyCourseItem } from "@/services/courses/courses.types";
import { MY_COURSES_FILTERS, courseStateOf, type MyCoursesFilter } from "./my-courses/my-courses-filter.const";

/**
 * The parameter that says which view of a collection is on screen: the
 * state on «Mis cursos», the level on the catalog. The catalog's other
 * filters (topic, search) narrow the view without changing it.
 */
const VIEW_PARAM: Record<string, string> = {
  [platformRoutes.courses]: "estado",
  [platformRoutes.courseCatalog]: "nivel",
};

/**
 * Whether a link of the side column is the view on screen: the same page and
 * the same value of its view's parameter (none on «Todos» and «Todo el
 * catálogo»).
 */
export function isCurrentView(href: string, pathname: string, params: URLSearchParams): boolean {
  const link = new URL(href, "https://x.invalid");
  if (link.pathname !== pathname) return false;
  const name = VIEW_PARAM[pathname];
  if (!name) return false;
  return (link.searchParams.get(name) ?? "") === (params.get(name) ?? "");
}

/** The six colours of the levels; a seventh level would repeat the last. */
const LEVEL_TONES = 6;

/**
 * The side column of «Cursos», the same on «Mis cursos» and on the catalog,
 * as Gmail's labels: the student's courses by state, and the catalog whole
 * and by level, each with its count. Which one is lit is the browser's to
 * say (`CoursesSideNav`, `isCurrentView`): the column lives in the layout,
 * which does not render again when the view changes.
 */
export function coursesNavGroups(
  mine: MyCourseItem[],
  catalog: CourseSummary[],
  levels: CourseLevelItem[],
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
        },
        ...levels.map((level, index) => ({
          label: level.name,
          href: platformRoutes.coursesOfLevel(level.slug),
          count: catalog.filter((course) => course.levels.some((one) => one.slug === level.slug)).length,
          level: Math.min(index + 1, LEVEL_TONES),
        })),
      ],
    },
  ];
}
