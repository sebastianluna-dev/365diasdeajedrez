import type { Metadata } from "next";
import { TeacherFormSection } from "@/components/platform/sections/staff/teachers/teacher-form.section";
import { requireStaff } from "@/lib/platform-auth/roles";
import { listLinkableUsers } from "@/services/staff-teachers/staff-teachers.service";

// The title is resolved with the role, like the page itself: without it the
// response carries not even the panel's name (IMPROVEMENTS #26).
export async function generateMetadata(): Promise<Metadata> {
  await requireStaff();
  return { title: "Registrar profesor" };
}

interface NewTeacherPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function NewTeacherPage({ searchParams }: NewTeacherPageProps) {
  await requireStaff();
  const [linkableUsers, { error }] = await Promise.all([listLinkableUsers(), searchParams]);

  return (
    <div className="platform-page staff-new-teacher-page">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Registrar profesor</h1>
        <p className="platform-page__subtitle">Vincula una cuenta existente o crea cuenta y ficha a la vez.</p>
      </header>

      <TeacherFormSection linkableUsers={linkableUsers} errorCode={error} />
    </div>
  );
}
