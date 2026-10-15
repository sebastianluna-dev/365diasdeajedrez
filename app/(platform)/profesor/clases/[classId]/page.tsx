import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon.comp";
import { TeacherClassDetailSection } from "@/components/platform/sections/teacher/classes/teacher-class-detail.section";
import { TopicButton } from "@/components/platform/sections/teacher/classes/topic-popup/topic-popup.comp";
import { ClassJoinBar } from "@/components/platform/shared/class-join-bar/class-join-bar.comp";
import { ClassStatusTag } from "@/components/platform/shared/class-status-tag/class-status-tag.comp";
import { FinalizeClassButton } from "@/components/platform/shared/finalize-class-popup/finalize-class-popup.comp";
import { meetingJoinState } from "@/components/platform/shared/meeting-join-card/meeting-join-card.comp";
import { CLASS_FIELD_ERRORS, readNotice, type ClassNotice } from "@/constants/platform/class-messages.const";
import { TEACHER_ERROR_MESSAGES } from "@/constants/platform/teacher-messages.const";
import { formatClassWhen } from "@/lib/format-class-when";
import { teacherRoutes } from "@/lib/platform-routes";
import { changeAttendance, finalizeClass, updateClassTopic } from "@/services/teacher-classes/teacher-classes.actions";
import { getTeacherClassDetail, listReferenceableGames } from "@/services/teacher-classes/teacher-classes.service";
import type { TeacherClassDetail } from "@/services/teacher-classes/teacher-classes.types";
import "./teacher-class-page.css";

interface TeacherClassPageProps {
  params: Promise<{ classId: string }>;
  searchParams: Promise<{ gameId?: string; finalizar?: string; aviso?: string; error?: string }>;
}

export async function generateMetadata({ params }: TeacherClassPageProps): Promise<Metadata> {
  const { classId } = await params;
  const classDetail = await getTeacherClassDetail(classId);
  return classDetail ? { title: classDetail.title } : {};
}

/** What the address's notice says here, composed with the class's own data where a name is needed (D10). */
function noticeText(notice: ClassNotice | null, classDetail: TeacherClassDetail): string | undefined {
  if (!notice) return undefined;
  if (notice.text) return notice.text;
  switch (notice.code) {
    case "classFinalized":
      return classDetail.isGroup
        ? "Clase finalizada. Tus alumnos ya ven tu resumen."
        : classDetail.afterNotes.summary
          ? `Clase finalizada. ${classDetail.students[0]?.displayName ?? "El alumno"} ya ve tu resumen.`
          : "Clase finalizada.";
    case "attendanceChanged":
      return "Asistencia guardada.";
    default:
      return undefined;
  }
}

/** The teacher's record of a class (PROF-2). */
export default async function TeacherClassPage({ params, searchParams }: TeacherClassPageProps) {
  const { classId } = await params;
  // The service opens with requireTeacher() and filters by teacherId in the where:
  // another teacher's class is a 404, not a row to be discarded.
  const [classDetail, games, { gameId, finalizar, aviso, error }] = await Promise.all([
    getTeacherClassDetail(classId),
    listReferenceableGames(),
    searchParams,
  ]);
  if (!classDetail) notFound();

  const now = new Date(classDetail.nowIso);
  const joinOpen = ["open", "live", "tail"].includes(meetingJoinState(classDetail.join));
  const errorMessage = error
    ? (CLASS_FIELD_ERRORS[error] ?? TEACHER_ERROR_MESSAGES[error] ?? TEACHER_ERROR_MESSAGES.invalid)
    : undefined;
  const people = classDetail.isGroup
    ? `${classDetail.students.filter((student) => !student.mark.moved).length} alumnos`
    : (classDetail.students[0]?.displayName ?? "Sin alumno");

  return (
    <>
      <div
        className={`platform-page platform-page_width_wide teacher-class-page${joinOpen ? " platform-page_foot_join-bar" : ""}`}
      >
        <header className="platform-page__head">
          <Link href={teacherRoutes.classes} className="platform-page__back">
            <ChevronLeftIcon variant="classic-solid" className="platform-page__back-icon" />
            Clases que imparto
          </Link>
          <p className="teacher-class-page__tags">
            <ClassStatusTag phase={classDetail.phase} audience="teacher" />
          </p>
          <div className="teacher-class-page__title-row">
            <h1 className="platform-page__title">{classDetail.title}</h1>
            {classDetail.editable.topic && (
              <TopicButton
                classId={classDetail.id}
                topic={classDetail.topic}
                description={classDetail.description}
                updateClassTopic={updateClassTopic}
              />
            )}
          </div>
          <p className="platform-page__subtitle">
            {formatClassWhen({
              start: new Date(classDetail.startIso),
              durationMin: classDetail.durationMin,
              timeZone: classDetail.timeZone,
              now,
              withZone: true,
            })}{" "}
            · {classDetail.durationMin} min · {classDetail.isGroup ? "Grupal" : "Individual"} · {people}
          </p>
          {classDetail.description && <p className="teacher-class-page__description">{classDetail.description}</p>}
          <div className="platform-page__actions">
            {classDetail.canFinalize && (
              <FinalizeClassButton
                variant="accent"
                mode="finalize"
                action={finalizeClass}
                openOnMount={finalizar === "1"}
                {...classDetail.finalize}
              />
            )}
            {classDetail.canChangeAttendance && (
              <FinalizeClassButton mode="change" action={changeAttendance} {...classDetail.finalize} />
            )}
          </div>
        </header>

        <TeacherClassDetailSection
          classDetail={classDetail}
          games={games}
          initialGameId={gameId}
          notice={noticeText(readNotice(aviso), classDetail)}
          errorMessage={errorMessage}
        />
      </div>
      {joinOpen && <ClassJoinBar {...classDetail.join} audience="teacher" />}
    </>
  );
}
