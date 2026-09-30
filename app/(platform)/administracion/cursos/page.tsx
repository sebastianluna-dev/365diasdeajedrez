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
  /**
   * `q` is the search, `estado` and `nivel` the filters; the three live in the
   * URL. `error` is what `createCourse` bounced back with: its dialog lives on
   * this page.
   */
  searchParams: Promise<{ q?: string; estado?: string; nivel?: string; error?: string }>;
}

export default async function StaffCoursesPage({ searchParams }: StaffCoursesPageProps) {
  await requireStaff();
  const { q, estado, nivel, error } = await searchParams;

  // The header goes INSIDE the section: it carries the search box, and that
  // needs to know what is being filtered.
  return (
    <div className="platform-page staff-courses-page">
      <CoursesAdminSection query={q} status={estado} level={nivel} errorCode={error} />
    </div>
  );
}
