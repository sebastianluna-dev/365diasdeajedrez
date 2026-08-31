import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AssignedStudentDetailSection } from "@/components/sections/platform/teacher/students/assigned-student-detail.section";
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
  // El servicio abre con requireTeacher() y sólo devuelve al alumno si la
  // asignación sigue activa: por URL directa, un alumno ajeno es un 404.
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
