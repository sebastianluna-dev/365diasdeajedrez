import type { Metadata } from "next";
import { CourseCatalogSection } from "@/components/platform/sections/courses/course-catalog/course-catalog.section";
import { getCourseCatalog, listCourseLevels } from "@/services/courses/courses.service";

export const metadata: Metadata = {
  title: "Explorar cursos",
};

interface CourseCatalogPageProps {
  /** `nivel`: the slug of the level the list is narrowed to. */
  searchParams: Promise<{ nivel?: string }>;
}

export default async function CourseCatalogPage({ searchParams }: CourseCatalogPageProps) {
  // Border of the private area: both reads go through getCurrentUser.
  const [courses, levels, { nivel }] = await Promise.all([getCourseCatalog(), listCourseLevels(), searchParams]);

  return (
    <div className="platform-page course-catalog-page">
      <CourseCatalogSection courses={courses} levels={levels} levelSlug={nivel} />
    </div>
  );
}
