import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TeacherClassDetailSection } from "@/components/sections/platform/teacher/classes/teacher-class-detail.section";
import {
  getTeacherClassDetail,
  getTeacherClassPreview,
  listPublishedLessons,
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
  // El servicio abre con requireTeacher() y filtra por teacherId en el where:
  // la clase de otro profesor es un 404, no una fila que haya que descartar.
  const classDetail = await getTeacherClassDetail(classId);
  if (!classDetail) notFound();

  // Los datasets del editor son listas ligeras (id + etiqueta): los PGN
  // completos se piden uno a uno sólo cuando hay que previsualizar.
  const [previewBlocks, students, games, lessons, positions, { gameId, error }] = await Promise.all([
    getTeacherClassPreview(classId),
    getAssignedStudents(),
    listReferenceableGames(),
    listPublishedLessons(),
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
        blockOptions={{ games, lessons, positions }}
        initialGameId={gameId}
        errorCode={error}
      />
    </div>
  );
}
