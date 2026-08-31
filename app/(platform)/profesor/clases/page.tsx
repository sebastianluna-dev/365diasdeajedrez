import type { Metadata } from "next";
import { TeacherClassesSection } from "@/components/sections/platform/teacher/classes/teacher-classes.section";
import { CLASS_STATUS, type ClassStatusCode } from "@/constants/platform/class-codes.const";
import { requireTeacher } from "@/lib/platform-auth/roles";

export const metadata: Metadata = {
  title: "Clases que imparto",
};

interface TeacherClassesPageProps {
  searchParams: Promise<{ status?: string }>;
}

function toStatusCode(value: string | undefined): ClassStatusCode | undefined {
  return value && (Object.values(CLASS_STATUS) as string[]).includes(value) ? (value as ClassStatusCode) : undefined;
}

export default async function TeacherClassesPage({ searchParams }: TeacherClassesPageProps) {
  await requireTeacher();
  const { status } = await searchParams;

  return (
    <div className="platform-page teacher-classes-page">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Clases que imparto</h1>
        <p className="platform-page__subtitle">Programa clases, prepara su contenido y marca la asistencia.</p>
      </header>

      <TeacherClassesSection statusCode={toStatusCode(status)} />
    </div>
  );
}
