import { Suspense, type ReactNode } from "react";
import { PlatformHeaderContext } from "@/components/platform/sections/shell/platform-header-context.comp";
import { CourseSearch } from "./course-search.comp";
import { CoursesSideSkeleton } from "./courses-side-skeleton.comp";
import { CoursesSideSection } from "./courses-side.section";

interface CoursesWorkspaceProps {
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
 *
 * It waits for nothing: the side column's data streams in behind
 * `CoursesSideSkeleton` and the page behind its own `loading.tsx`, so the
 * frame is on screen from the first paint — the canvas under the bar, and
 * the bar's three bars, which the shell shows only where there is a side
 * column (2026-10-22: while the whole layout waited, a reload showed the
 * platform's loading without a column, the bars were hidden and the page's
 * name jumped when they came).
 */
export function CoursesWorkspace({ children }: CoursesWorkspaceProps) {
  return (
    <div className="platform-workspace">
      <PlatformHeaderContext inlineClassName="courses-workspace__search">
        <CourseSearch />
      </PlatformHeaderContext>

      <div className="platform-workspace__side">
        <Suspense fallback={<CoursesSideSkeleton />}>
          <CoursesSideSection />
        </Suspense>
      </div>

      {children}
    </div>
  );
}
