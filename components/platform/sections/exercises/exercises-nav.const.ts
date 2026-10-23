import type {
  PlatformSideNavAction,
  PlatformSideNavGroup,
  PlatformSideNavLink,
} from "@/components/platform/shared/platform-side-nav/platform-side-nav.comp";
import { platformRoutes } from "@/lib/platform-routes";
import type { PracticeTopicOption } from "@/services/exercises/practice.types";

/** The parameter of the series' page that says which view is on screen: `?de=academia`. */
export const SERIES_VIEW_PARAM = "de";
export const ACADEMY_SERIES_VIEW = "academia";

/** How many subtopics an opened topic shows before «Ver los N subtemas». */
export const SUBTOPIC_LIMIT = 5;

/** What the side column of «Ejercicios» counts and lights, as the server reads it. */
export interface ExercisesNavData {
  /** The topics that have a library exercise (`getPracticeFilters`): the first level and their children. */
  topics: PracticeTopicOption[];
  /** The series the student's teacher gave them, and the academy's published ones, by id: a series' pages light their view. */
  teacherSeriesIds: string[];
  academySeriesIds: string[];
}

/** Where the student is: the address, as the browser has it. */
export interface ExercisesNavLocation {
  pathname: string;
  params: URLSearchParams;
}

/** The series' id in `/ejercicios/series/<id>` and under it, or null. */
function seriesIdOf(pathname: string): string | null {
  return /^\/ejercicios\/series\/([^/]+)/.exec(pathname)?.[1] ?? null;
}

/** «Puzzle Rush», the column's action: filled while it is the page on screen. */
export function exercisesNavAction({ pathname }: ExercisesNavLocation): PlatformSideNavAction {
  return {
    label: "Puzzle Rush",
    href: platformRoutes.exerciseStorm,
    icon: "stopwatch",
    current: pathname === platformRoutes.exerciseStorm,
  };
}

/**
 * The side column of «Ejercicios» (2026-10-23, the owner's «M4»), the same on
 * every page of it and on «Puzzle Rush», as Gmail's labels: «Temas» — every
 * topic, then each first-level topic, the one open showing its subtopics (the
 * first five, the one on screen always among them, unless `expanded`) — and
 * «Tuyo»: what the teacher gave, the academy's series when there are any,
 * and the history. A topic keeps the level chosen (`nivel`). Which link is lit
 * follows the address: the layout draws the column once, so the browser
 * lights it (`ExercisesSideNav`).
 */
export function exercisesNavGroups(
  data: ExercisesNavData,
  { pathname, params }: ExercisesNavLocation,
  expanded: boolean,
): { groups: PlatformSideNavGroup[]; hiddenSubtopics: number } {
  const onTrainer = pathname === platformRoutes.exercises;
  const topicCode = onTrainer ? params.get("tema") : null;
  const level = params.get("nivel") ?? undefined;
  const hrefOf = (code?: string) =>
    platformRoutes.exerciseTrainer({ tema: code, nivel: onTrainer ? level : undefined });
  const roots = data.topics.filter((topic) => topic.parentCode === null);
  const childrenOf = (code: string) => data.topics.filter((topic) => topic.parentCode === code);
  const openRoot = roots.find(
    (root) => root.code === topicCode || childrenOf(root.code).some((child) => child.code === topicCode),
  );
  let hiddenSubtopics = 0;

  const topicLinks = roots.map((root): PlatformSideNavLink => {
    const link: PlatformSideNavLink = {
      label: root.label,
      href: hrefOf(root.code),
      icon: "tag",
      current: root.code === topicCode,
    };
    const children = childrenOf(root.code);
    if (root !== openRoot || children.length === 0) return link;
    const currentIndex = children.findIndex((child) => child.code === topicCode);
    const showAll = expanded || children.length <= SUBTOPIC_LIMIT || currentIndex >= SUBTOPIC_LIMIT;
    const shown = showAll ? children : children.slice(0, SUBTOPIC_LIMIT);
    hiddenSubtopics = children.length - shown.length;
    return {
      ...link,
      subLinks: shown.map((child) => ({
        label: child.label,
        href: hrefOf(child.code),
        current: child.code === topicCode,
      })),
    };
  });

  const seriesId = seriesIdOf(pathname);
  const onSeriesList = pathname === platformRoutes.exerciseOverview;
  const academyView = params.get(SERIES_VIEW_PARAM) === ACADEMY_SERIES_VIEW;
  const teacherCurrent =
    (onSeriesList && !academyView) || (seriesId !== null && data.teacherSeriesIds.includes(seriesId));
  const academyCurrent =
    (onSeriesList && academyView) || (seriesId !== null && data.academySeriesIds.includes(seriesId));

  return {
    hiddenSubtopics,
    groups: [
      {
        title: "Temas",
        links: [
          {
            label: "Todos los temas",
            href: hrefOf(),
            icon: "shuffle",
            current: (onTrainer && !topicCode) || pathname.startsWith("/ejercicios/biblioteca/"),
          },
          ...topicLinks,
        ],
      },
      {
        title: "Tuyo",
        links: [
          {
            label: "De tu profesor",
            href: platformRoutes.exerciseOverview,
            icon: "chalkboard-user",
            count: data.teacherSeriesIds.length > 0 ? data.teacherSeriesIds.length : undefined,
            current: teacherCurrent,
          },
          ...(data.academySeriesIds.length > 0
            ? [
                {
                  label: "Series de la academia",
                  href: platformRoutes.exerciseAcademySeries,
                  icon: "books" as const,
                  current: academyCurrent,
                },
              ]
            : []),
          {
            label: "Historial",
            href: platformRoutes.exerciseHistory,
            icon: "rotate-left",
            current: pathname === platformRoutes.exerciseHistory,
          },
        ],
      },
    ],
  };
}
