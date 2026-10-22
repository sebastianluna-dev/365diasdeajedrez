import type { ReactNode } from "react";
import { PlatformHeaderContext } from "@/components/platform/sections/shell/platform-header-context.comp";
import type { PlatformSideNavGroup } from "@/components/platform/shared/platform-side-nav/platform-side-nav.comp";
import { CourseSearch } from "./course-search.comp";
import { CoursesSideNav } from "./courses-side-nav.comp";

interface CoursesWorkspaceProps {
  /** The side column's groups (`coursesNavGroups`). */
  groups: PlatformSideNavGroup[];
  /** Where «Seguir donde iba» leads: the next lesson of the course to go on with, if there is one. */
  resumeHref?: string;
  /** The page: its `.platform-workspace__panel`, or the loading skeleton of one. */
  children: ReactNode;
}

/**
 * The frame of «Cursos» in the new design system, drawn ONCE by the layout
 * «Mis cursos» and the catalog share (`app/(platform)/cursos/(lista)/
 * layout.tsx`), so moving between them keeps the side column and the bar's
 * search in place and only the panel changes, as Gmail's labels do: the
 * workspace, the side column with «Seguir donde iba» and the views, the
 * catalog's search in the bar, and the panel it is given. A container: its
 * job is to place the panel.
 */
export function CoursesWorkspace({ groups, resumeHref, children }: CoursesWorkspaceProps) {
  return (
    <div className="platform-workspace">
      <PlatformHeaderContext inlineClassName="courses-workspace__search">
        <CourseSearch />
      </PlatformHeaderContext>

      <div className="platform-workspace__side">
        <CoursesSideNav groups={groups} resumeHref={resumeHref} />
      </div>

      {children}
    </div>
  );
}
