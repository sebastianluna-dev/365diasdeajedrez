import { foldForSearch } from "@/lib/fold-for-search";
import { platformRoutes } from "@/lib/platform-routes";
import type { CourseSummary } from "@/services/courses/courses.types";

/** What narrows the catalog, as its address carries it. */
export interface CatalogFilters {
  /** `nivel`: a level's slug. */
  level?: string;
  /** `tema`: a content type's code. */
  topic?: string;
  /** `nuevos=1`: only the courses the student has not added. */
  notAdded: boolean;
  /** `q`: what the bar's search holds. */
  query?: string;
}

/** The filters an address asks for; an empty value is no filter. */
export function catalogFiltersOf(params: {
  nivel?: string;
  tema?: string;
  nuevos?: string;
  q?: string;
}): CatalogFilters {
  return {
    level: params.nivel || undefined,
    topic: params.tema || undefined,
    notAdded: params.nuevos === "1",
    query: params.q?.trim() || undefined,
  };
}

/** The catalog's address for these filters, so a chip is a link that adds or takes one away. */
export function catalogHref(filters: CatalogFilters): string {
  const params = new URLSearchParams();
  if (filters.level) params.set("nivel", filters.level);
  if (filters.topic) params.set("tema", filters.topic);
  if (filters.notAdded) params.set("nuevos", "1");
  if (filters.query) params.set("q", filters.query);
  const search = params.toString();
  return search ? `${platformRoutes.courseCatalog}?${search}` : platformRoutes.courseCatalog;
}

/** What a course is searched by: its name, what it is about, who wrote it, its topics and levels. */
function searchTextOf(course: CourseSummary): string {
  return foldForSearch(
    [
      course.name,
      course.description,
      ...course.authorNames,
      ...course.contentTypes.map((contentType) => contentType.label),
      ...course.levels.map((level) => level.name),
    ]
      .filter(Boolean)
      .join(" "),
  );
}

/** The courses the filters let through, in the catalog's order. */
export function filterCatalog(courses: CourseSummary[], filters: CatalogFilters): CourseSummary[] {
  const wanted = filters.query ? foldForSearch(filters.query) : undefined;
  return courses.filter(
    (course) =>
      (!filters.level || course.levels.some((level) => level.slug === filters.level)) &&
      (!filters.topic || course.contentTypes.some((contentType) => contentType.code === filters.topic)) &&
      (!filters.notAdded || !course.isAdded) &&
      (!wanted || searchTextOf(course).includes(wanted)),
  );
}
