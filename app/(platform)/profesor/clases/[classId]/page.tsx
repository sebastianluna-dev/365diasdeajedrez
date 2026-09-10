import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TeacherClassDetailSection } from "@/components/platform/sections/teacher/classes/teacher-class-detail.section";
import {
  getTeacherClassDetail,
  getTeacherClassPreview,
  listReferenceableGames,
  listTeacherPositions,
} from "@/services/teacher-classes/teacher-classes.service";
import { getAssignedStudents } from "@/services/teacher-students/teacher-students.service";

interface TeacherClassPageProps {
  params: Promise<{ classId: string }>;
  searchParams: Promise<{ gameId?: string; error?: string }>;
}

export async function generateMetadata({ params }: TeacherClassPageProps): Promise<Metadata> {
  const { classId } = await params;
  const classDetail = await getTeacherClassDetail(classId);
  return classDetail ? { title: classDetail.title } : {};
}

export default async function TeacherClassPage({ params, searchParams }: TeacherClassPageProps) {
  const { classId } = await params;
  // The service opens with requireTeacher() and filters by teacherId in the where:
  // another teacher's class is a 404, not a row to be discarded.
  const classDetail = await getTeacherClassDetail(classId);
  if (!classDetail) notFound();

  // The editor's datasets are light lists (id + label): full PGNs are
  // requested one at a time only when a preview is needed.
  const [previewBlocks, students, games, positions, { gameId, error }] = await Promise.all([
    getTeacherClassPreview(classId),
    getAssignedStudents(),
    listReferenceableGames(),
    listTeacherPositions(),
    searchParams,
  ]);

  return (
    <div className="platform-page teacher-class-page">
      <header className="platform-page__head">
        <h1 className="platform-page__title">{classDetail.title}</h1>
        <p className="platform-page__subtitle">
          {classDetail.dateLabel} · {classDetail.timeLabel} · {classDetail.participants.length} alumno
          {classDetail.participants.length === 1 ? "" : "s"}
        </p>
      </header>

      <TeacherClassDetailSection
        classDetail={classDetail}
        previewBlocks={previewBlocks}
        students={students}
        blockOptions={{ games, positions }}
        initialGameId={gameId}
        errorCode={error}
      />
    </div>
  );
}
