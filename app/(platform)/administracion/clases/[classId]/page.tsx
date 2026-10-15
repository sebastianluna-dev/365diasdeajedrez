import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon.comp";
import { ClassHeaderActions } from "@/components/platform/sections/staff/classes/class-header-actions.comp";
import { StaffClassDetailSection } from "@/components/platform/sections/staff/classes/staff-class-detail.section";
import { ClassStatusTag } from "@/components/platform/shared/class-status-tag/class-status-tag.comp";
import { CLASS_FORMAT } from "@/constants/platform/class-codes.const";
import { CLASS_FIELD_ERRORS, readNotice, type ClassNotice } from "@/constants/platform/class-messages.const";
import { STAFF_ERROR_MESSAGES } from "@/constants/platform/staff-messages.const";
import { formatClassWhen } from "@/lib/format-class-when";
import { requireStaff } from "@/lib/platform-auth/roles";
import { staffRoutes } from "@/lib/platform-routes";
import {
  addClassParticipants,
  cancelClass,
  rescheduleClass,
  rescheduleStudentSeat,
} from "@/services/staff-classes/staff-classes.actions";
import {
  getClassAdminDetail,
  listActiveTeacherOptions,
  listOpenGroupClasses,
  listSchedulableStudents,
} from "@/services/staff-classes/staff-classes.service";
import type { StaffClassDetail } from "@/services/staff-classes/staff-classes.types";
import { loadPaymentContext, loadTeacherBusy, registerPayment } from "@/services/staff-payments/staff-payments.actions";
import "./staff-class-page.css";

interface StaffClassPageProps {
  params: Promise<{ classId: string }>;
  searchParams: Promise<{ error?: string; aviso?: string }>;
}

export async function generateMetadata({ params }: StaffClassPageProps): Promise<Metadata> {
  const { classId } = await params;
  const classDetail = await getClassAdminDetail(classId);
  return classDetail ? { title: classDetail.title } : {};
}

/** What the address's notice says here, composed with the class's own data where a name is needed (D10). */
function noticeText(notice: ClassNotice | null, classDetail: StaffClassDetail): string | undefined {
  if (!notice) return undefined;
  if (notice.text) return notice.text;
  const when = formatClassWhen({
    start: new Date(classDetail.startIso),
    durationMin: classDetail.durationMin,
    timeZone: classDetail.timeZone,
    now: new Date(classDetail.nowIso),
  });
  switch (notice.code) {
    case "classCreated":
      return `Clase creada: ${classDetail.title} · ${when}.`;
    case "classRescheduled":
      return `Clase reprogramada al ${when}.`;
    case "teacherChanged":
      return `Profesor cambiado: ${classDetail.teacher.displayName}.`;
    case "meetingAdded":
      return "Enlace agregado.";
    case "meetingChanged":
      return "Enlace cambiado.";
    case "attendanceChanged": {
      const seat = classDetail.seats.find((item) => item.userId === notice.args[0]);
      if (!seat) return "Asistencia cambiada.";
      return `Asistencia de ${seat.displayName} cambiada: ${seat.attended ? "«Asistió»" : "«Faltó»"}.`;
    }
    default:
      return undefined;
  }
}

/** A class's record (ADM-4, ADM-8). */
export default async function StaffClassPage({ params, searchParams }: StaffClassPageProps) {
  const staff = await requireStaff();
  const { classId } = await params;
  const now = new Date();
  const [classDetail, teachers, students, groupClasses, { error, aviso }] = await Promise.all([
    getClassAdminDetail(classId),
    listActiveTeacherOptions(),
    listSchedulableStudents(),
    listOpenGroupClasses(now),
    searchParams,
  ]);
  if (!classDetail) notFound();

  const isGroup = classDetail.formatCode === CLASS_FORMAT.GROUP;
  const errorMessage = error
    ? (CLASS_FIELD_ERRORS[error] ?? STAFF_ERROR_MESSAGES[error] ?? STAFF_ERROR_MESSAGES.invalid)
    : undefined;
  const actions = {
    addClassParticipants,
    rescheduleClass,
    cancelClass,
    rescheduleStudentSeat,
    loadTeacherBusy,
    registerPayment,
    loadPaymentContext,
  };

  return (
    <div className="platform-page platform-page_width_wide staff-class-page">
      <header className="platform-page__head">
        <Link href={staffRoutes.classes} className="platform-page__back">
          <ChevronLeftIcon variant="classic-solid" className="platform-page__back-icon" />
          Clases
        </Link>
        <p className="staff-class-page__tags">
          <ClassStatusTag phase={classDetail.phase} audience="staff" />
          <span className="platform-tag">
            {isGroup
              ? `Grupal · ${classDetail.counts.seated} de ${classDetail.capacity ?? classDetail.counts.seated} plazas`
              : "Individual"}
          </span>
        </p>
        <h1 className="platform-page__title">{classDetail.title}</h1>
        <p className="platform-page__subtitle">
          {formatClassWhen({
            start: new Date(classDetail.startIso),
            durationMin: classDetail.durationMin,
            timeZone: classDetail.timeZone,
            now,
            withZone: true,
          })}{" "}
          · {classDetail.teacher.displayName}
        </p>
        <div className="platform-page__actions">
          <ClassHeaderActions
            classDetail={classDetail}
            teachers={teachers}
            students={students}
            groupClasses={groupClasses}
            actions={actions}
          />
        </div>
      </header>

      <StaffClassDetailSection
        classDetail={classDetail}
        teachers={teachers}
        groupClasses={groupClasses}
        staffName={staff.user.displayName}
        notice={noticeText(readNotice(aviso), classDetail)}
        errorMessage={errorMessage}
      />
    </div>
  );
}
