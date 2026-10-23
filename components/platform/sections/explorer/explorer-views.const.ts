import type { PlatformSideNavIcon } from "@/components/platform/shared/platform-side-nav/platform-side-nav.comp";
import { platformRoutes } from "@/lib/platform-routes";
import { GAME_ORIGIN, type GameOriginCode } from "@/services/shared/game-origin";

/** The parameter that says where the explorer searches: `?origen=cursos`. */
export const EXPLORER_VIEW_PARAM = "origen";

export interface ExplorerView {
  /** The value of `?origen=`; none for every game. */
  value?: string;
  /** The origin it narrows the search to; none for every game. */
  origin?: GameOriginCode;
  label: string;
  icon: PlatformSideNavIcon;
}

/**
 * Where the explorer can search, as its side column offers it («Buscar en»):
 * every game the viewer may see, or the games of one origin
 * (`services/shared/game-origin`), the one filter the search has.
 */
export const EXPLORER_VIEWS: readonly ExplorerView[] = [
  { label: "Todas las partidas", icon: "chess-board" },
  { value: "alumnos", origin: GAME_ORIGIN.STUDENT_STUDY, label: "Estudios de alumnos", icon: "user-graduate" },
  { value: "cursos", origin: GAME_ORIGIN.COURSE, label: "Cursos", icon: "graduation-cap" },
  { value: "profesorado", origin: GAME_ORIGIN.EDITOR, label: "Profesorado", icon: "chalkboard-user" },
];

/** The origin a value of `?origen=` stands for; an unknown one, like none, searches everything. */
export function explorerOriginOf(value: string | string[] | undefined): GameOriginCode | undefined {
  if (typeof value !== "string") return undefined;
  return EXPLORER_VIEWS.find((view) => view.value === value)?.origin;
}

/** The address of a view. */
export function explorerViewHref(view: ExplorerView): string {
  return view.value ? `${platformRoutes.explorer}?${EXPLORER_VIEW_PARAM}=${view.value}` : platformRoutes.explorer;
}
