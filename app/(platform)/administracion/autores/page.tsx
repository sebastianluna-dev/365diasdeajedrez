import type { Metadata } from "next";
import { AuthorsAdminSection } from "@/components/platform/sections/staff/authors/authors-admin.section";
import { requireStaff } from "@/lib/platform-auth/roles";
import { listAuthors } from "@/services/staff-courses/staff-courses.service";

// The title is resolved with the role, like the page itself: without it the
// response carries not even the panel's name (IMPROVEMENTS #26).
export async function generateMetadata(): Promise<Metadata> {
  await requireStaff();
  return { title: "Autores" };
}

interface StaffAuthorsPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function StaffAuthorsPage({ searchParams }: StaffAuthorsPageProps) {
  await requireStaff();
  const [authors, { error }] = await Promise.all([listAuthors(), searchParams]);

  return (
    <div className="platform-page staff-authors-page">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Autores</h1>
        <p className="platform-page__subtitle">
          Quiénes firman los cursos. El resto de catálogos (temas, niveles, tipos…) se gestionan por seed.
        </p>
      </header>

      <AuthorsAdminSection authors={authors} errorCode={error} />
    </div>
  );
}
