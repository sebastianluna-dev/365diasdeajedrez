import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AssignedStudentDetailSection } from "@/components/platform/sections/teacher/students/assigned-student-detail.section";
import { getAssignedStudentDetail } from "@/services/teacher-students/teacher-students.service";

interface TeacherStudentPageProps {
  params: Promise<{ studentId: string }>;
}

export async function generateMetadata({ params }: TeacherStudentPageProps): Promise<Metadata> {
  const { studentId } = await params;
  const student = await getAssignedStudentDetail(studentId);
  return student ? { title: student.displayName } : {};
}

export default async function TeacherStudentPage({ params }: TeacherStudentPageProps) {
  const { studentId } = await params;
  // The service opens with requireTeacher() and only returns the student when
  // the assignment is still active: by direct URL, someone else's student is a 404.
  const student = await getAssignedStudentDetail(studentId);
  if (!student) notFound();

  return (
    <div className="platform-page teacher-student-page">
      <header className="platform-page__head">
        <h1 className="platform-page__title">{student.displayName}</h1>
        <p className="platform-page__subtitle">{student.email}</p>
      </header>

      <AssignedStudentDetailSection student={student} />
    </div>
  );
}
