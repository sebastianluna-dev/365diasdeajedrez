import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StudentGameViewSection } from "@/components/platform/sections/teacher/students/student-game-view.section";
import { CLASS_STATUS } from "@/constants/platform/class-codes.const";
import { getTeacherClasses } from "@/services/teacher-classes/teacher-classes.service";
import { getAssignedStudentDetail, getStudentGame } from "@/services/teacher-students/teacher-students.service";

interface StudentGamePageProps {
  params: Promise<{ studentId: string; studyId: string; gameId: string }>;
}

export async function generateMetadata({ params }: StudentGamePageProps): Promise<Metadata> {
  const { studentId, studyId, gameId } = await params;
  const game = await getStudentGame(studentId, studyId, gameId);
  return game ? { title: `${game.white} – ${game.black}` } : {};
}

export default async function StudentGamePage({ params }: StudentGamePageProps) {
  const { studentId, studyId, gameId } = await params;
  const [game, student, scheduledClasses] = await Promise.all([
    getStudentGame(studentId, studyId, gameId),
    getAssignedStudentDetail(studentId),
    getTeacherClasses(CLASS_STATUS.SCHEDULED),
  ]);
  if (!game || !student) notFound();

  return (
    <div className="platform-page teacher-student-game-page">
      <StudentGameViewSection
        studentId={studentId}
        studentName={student.displayName}
        game={game}
        scheduledClasses={scheduledClasses}
      />
    </div>
  );
}
