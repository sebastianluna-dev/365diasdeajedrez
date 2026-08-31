import type { Metadata } from "next";
import { AssignedStudentsSection } from "@/components/sections/platform/teacher/students/assigned-students.section";
import { requireTeacher } from "@/lib/platform-auth/roles";

export const metadata: Metadata = {
  title: "Mis alumnos",
};

interface TeacherStudentsPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function TeacherStudentsPage({ searchParams }: TeacherStudentsPageProps) {
  await requireTeacher();
  const { q } = await searchParams;

  return (
    <div className="platform-page teacher-students-page">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Mis alumnos</h1>
        <p className="platform-page__subtitle">
          Los alumnos que tienes asignados ahora mismo. Las asignaciones las gestiona el equipo de administración.
        </p>
      </header>

      <AssignedStudentsSection query={q} />
    </div>
  );
}
