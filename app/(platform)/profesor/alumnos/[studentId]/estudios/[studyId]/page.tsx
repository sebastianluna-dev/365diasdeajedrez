import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StudentStudyViewSection } from "@/components/platform/sections/teacher/students/student-study-view.section";
import { getAssignedStudentDetail, getStudentStudy } from "@/services/teacher-students/teacher-students.service";

interface StudentStudyPageProps {
  params: Promise<{ studentId: string; studyId: string }>;
}

export async function generateMetadata({ params }: StudentStudyPageProps): Promise<Metadata> {
  const { studentId, studyId } = await params;
  const study = await getStudentStudy(studentId, studyId);
  return study ? { title: study.name } : {};
}

export default async function StudentStudyPage({ params }: StudentStudyPageProps) {
  const { studentId, studyId } = await params;
  const [study, student] = await Promise.all([
    getStudentStudy(studentId, studyId),
    getAssignedStudentDetail(studentId),
  ]);
  if (!study || !student) notFound();

  return (
    <div className="platform-page teacher-student-study-page">
      <header className="platform-page__head">
        <h1 className="platform-page__title">{study.name}</h1>
        <p className="platform-page__subtitle">Estudio de {student.displayName}</p>
      </header>

      <StudentStudyViewSection studentId={studentId} studentName={student.displayName} study={study} />
    </div>
  );
}
