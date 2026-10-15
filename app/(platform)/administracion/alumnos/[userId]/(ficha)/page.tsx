import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StudentAdminDetailSection } from "@/components/platform/sections/staff/students/student-admin-detail.section";
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

/** «Cuenta»: the first page of the record; the head and the tabs are the layout's. */
export default async function StaffStudentPage({ params, searchParams }: StaffStudentPageProps) {
  const { userId } = await params;
  // The service opens with requireStaff(): it is the panel's border.
  const student = await getStudentAdminDetail(userId);
  if (!student) notFound();

  const [teachers, { error }] = await Promise.all([listActiveTeachers(), searchParams]);

  return <StudentAdminDetailSection student={student} teachers={teachers} errorCode={error} />;
}
