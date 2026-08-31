import type { Metadata } from "next";
import { ClassFormSection } from "@/components/sections/platform/teacher/classes/class-form.section";
import { requireTeacher } from "@/lib/platform-auth/roles";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";
import { safeTimeZone } from "@/lib/timezone";
import { listMeetingProviders } from "@/services/teacher-classes/teacher-classes.service";
import { getAssignedStudents } from "@/services/teacher-students/teacher-students.service";

export const metadata: Metadata = {
  title: "Nueva clase",
};

interface NewClassPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function NewClassPage({ searchParams }: NewClassPageProps) {
  const { teacher } = await requireTeacher();

  const [students, providers, teacherRow, { error }] = await Promise.all([
    getAssignedStudents(),
    listMeetingProviders(),
    getPlatformDb().teacher.findUnique({ where: { id: teacher.id }, select: { timezone: true } }),
    searchParams,
  ]);

  return (
    <div className="platform-page teacher-new-class-page">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Nueva clase</h1>
        <p className="platform-page__subtitle">Programa la sesión; el contenido se prepara después, en su ficha.</p>
      </header>

      <ClassFormSection
        students={students}
        providers={providers}
        timeZone={safeTimeZone(teacherRow?.timezone)}
        errorCode={error}
      />
    </div>
  );
}
