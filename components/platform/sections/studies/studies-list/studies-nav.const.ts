import type {
  PlatformSideNavGroup,
  PlatformSideNavIcon,
} from "@/components/platform/shared/platform-side-nav/platform-side-nav.comp";
import { DATABASE_KIND } from "@/constants/platform/study-codes.const";
import { platformRoutes } from "@/lib/platform-routes";
import type { StudySummary } from "@/services/studies/studies.types";

// The views of «Mis estudios» in the new design system (2026-10-23): which
// studies the page shows (`?tipo=`) and in what order (`?orden=`), each a link
// of the side column, so a view has an address, can be shared and the back
// button undoes it. «Todos» and «Recientes» carry no value.

/** The kinds of view, by the value `?tipo=` carries; «Todos» carries none. */
export const STUDY_VIEWS = [
  { value: undefined, label: "Todos", icon: "chess-board" },
  { value: "mis-partidas", label: "Mis partidas", icon: "user", kindCode: DATABASE_KIND.MY_GAMES },
  { value: "estudios", label: "Estudios", icon: "book-open", kindCode: DATABASE_KIND.STUDY },
  { value: "torneos", label: "Torneos", icon: "trophy", kindCode: DATABASE_KIND.TOURNAMENT },
  { value: "colecciones", label: "Colecciones", icon: "layer-group", kindCode: DATABASE_KIND.COLLECTION },
  { value: "recibidos", label: "Recibidos", icon: "books" },
] as const satisfies readonly { value?: string; label: string; icon: PlatformSideNavIcon; kindCode?: string }[];

export type StudyView = (typeof STUDY_VIEWS)[number]["value"];

/** The orders, by the value `?orden=` carries; «Recientes» carries none. */
export const STUDY_SORTS = [
  { value: undefined, label: "Recientes" },
  { value: "nombre", label: "Nombre" },
  { value: "partidas", label: "Más capítulos" },
] as const;

export type StudySort = (typeof STUDY_SORTS)[number]["value"];

/** The view an address asks for; anything else is «Todos». */
export function studyViewOf(value: string | undefined): StudyView {
  return STUDY_VIEWS.find((view) => view.value === value)?.value;
}

/** The order an address asks for; anything else is «Recientes». */
export function studySortOf(value: string | undefined): StudySort {
  return STUDY_SORTS.find((sort) => sort.value === value)?.value;
}

/** Whether a study is the viewer's own: what they may write, as opposed to what they received. */
export const isOwnStudy = (study: StudySummary) => study.permissions.canEditGames;

/** Whether a study belongs to a view. */
export function inStudyView(study: StudySummary, view: StudyView): boolean {
  if (view === undefined) return true;
  if (view === "recibidos") return !isOwnStudy(study);
  const entry = STUDY_VIEWS.find((one) => one.value === view);
  const kindCode = entry && "kindCode" in entry ? entry.kindCode : undefined;
  return isOwnStudy(study) && study.kindCode === kindCode;
}

const COMPARE: Record<NonNullable<StudySort> | "recientes", (left: StudySummary, right: StudySummary) => number> = {
  // By when they last opened it (or created it): ISO strings sort as the
  // moments they write.
  recientes: (left, right) => right.recentAt.localeCompare(left.recentAt),
  nombre: (left, right) => left.name.localeCompare(right.name, "es", { sensitivity: "base" }),
  partidas: (left, right) => right.gameCount - left.gameCount || left.name.localeCompare(right.name, "es"),
};

/** The studies a view shows, in its order. */
export function studiesOfView(studies: StudySummary[], view: StudyView, sort: StudySort): StudySummary[] {
  return studies.filter((study) => inStudyView(study, view)).sort(COMPARE[sort ?? "recientes"]);
}

/**
 * «Sigue donde ibas»: the study whose game was opened last, as long as that
 * game is still there to go on with.
 */
export function resumeStudyOf(studies: StudySummary[]): StudySummary | undefined {
  return studies.filter((study) => study.resume).sort(COMPARE.recientes)[0];
}

/** The address of a view and an order, each left out when it is the default. */
export function studiesHref(view: StudyView, sort: StudySort): string {
  const params = new URLSearchParams();
  if (view) params.set("tipo", view);
  if (sort) params.set("orden", sort);
  const query = params.toString();
  return query ? `${platformRoutes.studies}?${query}` : platformRoutes.studies;
}

/**
 * The side column's groups: the views with their counts — a kind they have
 * none of is left out, save the three every student has a place for — and
 * the orders, as a choice of one with its ring. The view and the order on
 * screen are lit.
 */
export function studiesNavGroups(studies: StudySummary[], view: StudyView, sort: StudySort): PlatformSideNavGroup[] {
  const always = new Set<StudyView>([undefined, "mis-partidas", "estudios", "torneos"]);
  return [
    {
      title: "Tipos",
      links: STUDY_VIEWS.map((entry) => ({
        entry,
        count: studies.filter((study) => inStudyView(study, entry.value)).length,
      }))
        .filter(({ entry, count }) => always.has(entry.value) || count > 0)
        .map(({ entry, count }) => ({
          label: entry.label,
          icon: entry.icon,
          href: studiesHref(entry.value, sort),
          count,
          current: entry.value === view,
        })),
    },
    {
      title: "Ordenar",
      links: STUDY_SORTS.map((entry) => ({
        label: entry.label,
        href: studiesHref(view, entry.value),
        choice: true,
        current: entry.value === sort,
      })),
    },
  ];
}
