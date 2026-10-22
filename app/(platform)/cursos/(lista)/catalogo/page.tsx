import type { Metadata } from "next";
import { catalogFiltersOf } from "@/components/platform/sections/courses/course-catalog/catalog-filters.const";
import { CourseCatalogSection } from "@/components/platform/sections/courses/course-catalog/course-catalog.section";
import { getCourseCatalog, listCourseLevels } from "@/services/courses/courses.service";

export const metadata: Metadata = {
  title: "Catálogo de cursos",
};

interface CourseCatalogPageProps {
  /** `nivel` (a level's slug), `tema` (a topic's code), `nuevos=1` (not added yet) and `q` (the search). */
  searchParams: Promise<{ nivel?: string; tema?: string; nuevos?: string; q?: string }>;
}

export default async function CourseCatalogPage({ searchParams }: CourseCatalogPageProps) {
  // Border of the private area: the reads go through getCurrentUser. The
  // layout reads the same courses, cached for the request; the frame is its.
  const [courses, levels, params] = await Promise.all([getCourseCatalog(), listCourseLevels(), searchParams]);

  return <CourseCatalogSection courses={courses} levels={levels} filters={catalogFiltersOf(params)} />;
}
