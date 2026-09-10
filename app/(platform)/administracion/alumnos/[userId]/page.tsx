import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StudentAdminDetailSection } from "@/components/sections/platform/staff/students/student-admin-detail.section";
import { getStudentAdminDetail } from "@/services/staff-students/staff-students.service";
import { listActiveTeachers } from "@/services/staff-teachers/staff-teachers.service";

interface StaffStudentPageProps {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ error?: string }>;
}

export async function generateMetadata({ params }: StaffStudentPageProps): Promise<Metadata> {
  const { userId } = await params;
  const student = await getStudentAdminDetail(userId);
  return student ? { title: student.displayName } : {};
}

export default async function StaffStudentPage({ params, searchParams }: StaffStudentPageProps) {
  const { userId } = await params;
  // The service opens with requireStaff(): it is the panel's border.
  const student = await getStudentAdminDetail(userId);
  if (!student) notFound();

  const [teachers, { error }] = await Promise.all([listActiveTeachers(), searchParams]);

  return (
    <div className="platform-page staff-student-page">
      <header className="platform-page__head">
        <h1 className="platform-page__title">{student.displayName}</h1>
        <p className="platform-page__subtitle">{student.email}</p>
      </header>

      <StudentAdminDetailSection student={student} teachers={teachers} errorCode={error} />
    </div>
  );
}
