import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TeacherAdminDetailSection } from "@/components/platform/sections/staff/teachers/teacher-admin-detail.section";
import { getTeacherAdminDetail, listAssignableStudents } from "@/services/staff-teachers/staff-teachers.service";

interface StaffTeacherPageProps {
  params: Promise<{ teacherId: string }>;
  searchParams: Promise<{ error?: string }>;
}

export async function generateMetadata({ params }: StaffTeacherPageProps): Promise<Metadata> {
  const { teacherId } = await params;
  const teacher = await getTeacherAdminDetail(teacherId);
  return teacher ? { title: teacher.displayName } : {};
}

export default async function StaffTeacherPage({ params, searchParams }: StaffTeacherPageProps) {
  const { teacherId } = await params;
  const teacher = await getTeacherAdminDetail(teacherId);
  if (!teacher) notFound();

  const [assignable, { error }] = await Promise.all([listAssignableStudents(), searchParams]);

  return (
    <div className="platform-page staff-teacher-page">
      <header className="platform-page__head">
        <h1 className="platform-page__title">{teacher.displayName}</h1>
        <p className="platform-page__subtitle">{teacher.title ?? teacher.email}</p>
      </header>

      <TeacherAdminDetailSection teacher={teacher} assignable={assignable} errorCode={error} />
    </div>
  );
}
