import type { ReactNode } from "react";
import { coursesNavGroups } from "@/components/platform/sections/courses/courses-nav.const";
import { CoursesWorkspace } from "@/components/platform/sections/courses/courses-workspace.comp";
import { resumeCourseOf } from "@/components/platform/sections/courses/my-courses/my-courses-filter.const";
import { getCourseCatalog, getUserCourses, listCourseLevels } from "@/services/courses/courses.service";

/**
 * «Mis cursos» (`/cursos`) and the catalog (`/cursos/catalogo`) share this
 * layout, so the side column and the bar's search are drawn once and stay
 * while the student moves between views; only the page — the panel — is
 * drawn again, with `loading.tsx` in its place meanwhile. Its first await is a
 * data service, which resolves the user (the platform's rule for its pages;
 * the pages under it ask again).
 */
export default async function CoursesListLayout({ children }: { children: ReactNode }) {
  // The pages read the same courses: the reads are cached per request.
  const [mine, catalog, levels] = await Promise.all([getUserCourses(), getCourseCatalog(), listCourseLevels()]);

  return (
    <div className="platform-page platform-page_width_full platform-page_frame_bleed courses-page">
      <CoursesWorkspace groups={coursesNavGroups(mine, catalog, levels)} resumeHref={resumeCourseOf(mine)?.learnHref}>
        {children}
      </CoursesWorkspace>
    </div>
  );
}
