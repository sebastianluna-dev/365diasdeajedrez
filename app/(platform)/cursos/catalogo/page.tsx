import type { Metadata } from "next";
import { catalogFiltersOf } from "@/components/platform/sections/courses/course-catalog/catalog-filters.const";
import { CourseCatalogSection } from "@/components/platform/sections/courses/course-catalog/course-catalog.section";
import { getCourseCatalog, getUserCourses, listCourseLevels } from "@/services/courses/courses.service";

export const metadata: Metadata = {
  title: "Catálogo de cursos",
};

interface CourseCatalogPageProps {
  /** `nivel` (a level's slug), `tema` (a topic's code), `nuevos=1` (not added yet) and `q` (the search). */
  searchParams: Promise<{ nivel?: string; tema?: string; nuevos?: string; q?: string }>;
}

export default async function CourseCatalogPage({ searchParams }: CourseCatalogPageProps) {
  // Border of the private area: the reads go through getCurrentUser. The
  // catalog and «Mis cursos» share one cached read of the published courses.
  const [courses, mine, levels, params] = await Promise.all([
    getCourseCatalog(),
    getUserCourses(),
    listCourseLevels(),
    searchParams,
  ]);

  return (
    <div className="platform-page platform-page_width_full platform-page_frame_bleed course-catalog-page">
      <CourseCatalogSection courses={courses} mine={mine} levels={levels} filters={catalogFiltersOf(params)} />
    </div>
  );
}
