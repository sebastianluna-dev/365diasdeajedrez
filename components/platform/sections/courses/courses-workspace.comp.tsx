import type { ReactNode } from "react";
import { PlatformHeaderContext } from "@/components/platform/sections/shell/platform-header-context.comp";
import {
  PlatformSideNav,
  type PlatformSideNavGroup,
} from "@/components/platform/shared/platform-side-nav/platform-side-nav.comp";
import { CourseSearch } from "./course-search.comp";

interface CoursesWorkspaceProps {
  /** The side column's groups (`coursesNavGroups`). */
  groups: PlatformSideNavGroup[];
  /** Where «Seguir donde iba» leads: the next lesson of the course to go on with, if there is one. */
  resumeHref?: string;
  /** What the search already holds, on the catalog's results. */
  query?: string;
  /** The panel: `.platform-workspace__panel`. */
  children: ReactNode;
}

/**
 * The frame of «Cursos» in the new design system, shared by «Mis cursos» and
 * the catalog so that moving between them feels like one page, as Gmail's
 * labels: the workspace, the side column with «Seguir donde iba» and the
 * views, the catalog's search in the bar, and the panel it is given. A
 * container: its job is to place the panel.
 */
export function CoursesWorkspace({ groups, resumeHref, query, children }: CoursesWorkspaceProps) {
  return (
    <div className="platform-workspace">
      <PlatformHeaderContext inlineClassName="courses-workspace__search">
        <CourseSearch defaultValue={query} />
      </PlatformHeaderContext>

      <div className="platform-workspace__side">
        <PlatformSideNav
          label="Cursos"
          action={resumeHref ? { label: "Seguir donde iba", href: resumeHref } : undefined}
          groups={groups}
        />
      </div>

      {children}
    </div>
  );
}
