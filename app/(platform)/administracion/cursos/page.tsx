import type { Metadata } from "next";
import { CoursesAdminSection } from "@/components/platform/sections/staff/courses/courses-admin.section";
import { requireStaff } from "@/lib/platform-auth/roles";

// The title is resolved with the role, like the page itself: without it the
// response carries not even the panel's name (IMPROVEMENTS #26).
export async function generateMetadata(): Promise<Metadata> {
  await requireStaff();
  return { title: "Cursos" };
}

interface StaffCoursesPageProps {
  /** `q` is the search and `estado` the filter; both live in the URL. */
  searchParams: Promise<{ q?: string; estado?: string }>;
}

export default async function StaffCoursesPage({ searchParams }: StaffCoursesPageProps) {
  await requireStaff();
  const { q, estado } = await searchParams;

  // The header goes INSIDE the section: it carries the search box, and that
  // needs to know what is being filtered.
  return (
    <div className="platform-page staff-courses-page">
      <CoursesAdminSection query={q} status={estado} />
    </div>
  );
}
