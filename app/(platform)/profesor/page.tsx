import type { Metadata } from "next";
import { CircleInfoIcon } from "@/components/icons/circle-info-icon.comp";
import { TeacherDashboardSection } from "@/components/platform/sections/teacher/dashboard/teacher-dashboard.section";
import { ClassJoinBar } from "@/components/platform/shared/class-join-bar/class-join-bar.comp";
import { meetingJoinState } from "@/components/platform/shared/meeting-join-card/meeting-join-card.comp";
import { CLASS_FIELD_ERRORS, readNotice } from "@/constants/platform/class-messages.const";
import { TEACHER_ERROR_MESSAGES } from "@/constants/platform/teacher-messages.const";
import { requireTeacher } from "@/lib/platform-auth/roles";
import { teacherGreeting } from "@/services/teacher/teacher.mapper";
import { getTeacherDashboard } from "@/services/teacher/teacher.service";
import "./teacher-page.css";

// The title is resolved with the role, like the page itself: without it the
// response carries not even the panel's name (IMPROVEMENTS #26).
export async function generateMetadata(): Promise<Metadata> {
  await requireTeacher();
  return { title: "Panel del profesor" };
}

interface TeacherPageProps {
  searchParams: Promise<{ aviso?: string; error?: string }>;
}

/** The teacher's panel (PROF-1). */
export default async function TeacherPage({ searchParams }: TeacherPageProps) {
  await requireTeacher();
  const [dashboard, { aviso, error }] = await Promise.all([getTeacherDashboard(), searchParams]);
  const notice = readNotice(aviso);
  const noticeText = notice?.text ?? (notice?.code === "classFinalized" ? "Clase finalizada." : undefined);
  const errorMessage = error
    ? (CLASS_FIELD_ERRORS[error] ?? TEACHER_ERROR_MESSAGES[error] ?? TEACHER_ERROR_MESSAGES.invalid)
    : undefined;
  const joinOpen = dashboard.next ? ["open", "live", "tail"].includes(meetingJoinState(dashboard.next.join)) : false;

  return (
    <>
      <div className={`platform-page teacher-page${joinOpen ? " platform-page_foot_join-bar" : ""}`}>
        <header className="platform-page__head">
          <h1 className="platform-page__title">Panel del profesor</h1>
          <p className="platform-page__subtitle">{teacherGreeting(dashboard.displayName, dashboard.todayCount)}</p>
          <p className="teacher-page__line">
            <CircleInfoIcon variant="classic-light" className="teacher-page__line-icon" />
            Las fechas, los alumnos y los enlaces los gestiona administración.
            {dashboard.timeZoneMissing
              ? " Las horas van en la hora de Ciudad de México; elige tu zona en «Mi ficha»."
              : ""}
          </p>
        </header>
        <TeacherDashboardSection dashboard={dashboard} notice={noticeText} errorMessage={errorMessage} />
      </div>
      {/* The fixed bar is a SIBLING of the page: the page's entrance animation leaves a transform. */}
      {dashboard.next && joinOpen && <ClassJoinBar {...dashboard.next.join} audience="teacher" />}
    </>
  );
}
