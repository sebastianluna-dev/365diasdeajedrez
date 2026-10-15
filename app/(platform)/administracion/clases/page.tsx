import type { Metadata } from "next";
import Link from "next/link";
import { CalendarPlusIcon } from "@/components/icons/calendar-plus-icon.comp";
import { StaffClassesSection } from "@/components/platform/sections/staff/classes/staff-classes.section";
import { RegisterPaymentButton } from "@/components/platform/shared/register-payment-popup/register-payment-popup.comp";
import { CLASS_FIELD_ERRORS, readNotice } from "@/constants/platform/class-messages.const";
import { STAFF_ERROR_MESSAGES } from "@/constants/platform/staff-messages.const";
import { requireStaff } from "@/lib/platform-auth/roles";
import { staffRoutes } from "@/lib/platform-routes";
import {
  getStaffAgenda,
  getStaffQueues,
  listActiveTeacherOptions,
  listOpenGroupClasses,
  listTeacherFilterOptions,
} from "@/services/staff-classes/staff-classes.service";
import type { StaffAgendaTab } from "@/services/staff-classes/staff-classes.types";
import { loadPaymentContext, loadTeacherBusy, registerPayment } from "@/services/staff-payments/staff-payments.actions";
import { listPaymentStudents } from "@/services/staff-payments/staff-payments.service";

// The title is resolved with the role, like the page itself: without it the
// response carries not even the panel's name (IMPROVEMENTS #26).
export async function generateMetadata(): Promise<Metadata> {
  await requireStaff();
  return { title: "Clases" };
}

interface StaffClassesPageProps {
  searchParams: Promise<{
    vista?: string;
    profesor?: string;
    q?: string;
    hasta?: string;
    pagina?: string;
    aviso?: string;
    error?: string;
  }>;
}

const TABS: StaffAgendaTab[] = ["proximas", "pasadas", "canceladas"];

/** The staff's agenda (ADM-1). */
export default async function StaffClassesPage({ searchParams }: StaffClassesPageProps) {
  await requireStaff();
  const raw = await searchParams;
  const now = new Date();
  const filters = {
    vista: TABS.includes(raw.vista as StaffAgendaTab) ? (raw.vista as StaffAgendaTab) : "proximas",
    teacherId: raw.profesor || undefined,
    q: raw.q?.trim() || undefined,
    hasta: raw.hasta,
    pagina: Math.max(1, Number.parseInt(raw.pagina ?? "1", 10) || 1),
  };

  const [agenda, queues, teacherFilter, teachers, groupClasses, students] = await Promise.all([
    getStaffAgenda(filters),
    getStaffQueues(),
    listTeacherFilterOptions(),
    listActiveTeacherOptions(),
    listOpenGroupClasses(now),
    listPaymentStudents(),
  ]);

  const notice = readNotice(raw.aviso);
  const noticeText =
    notice?.text ??
    (notice?.code === "meetingAdded" || notice?.code === "meetingChanged"
      ? (() => {
          const classId = notice.args[0];
          const title = agenda.days.flatMap((day) => day.rows).find((row) => row.id === classId)?.title;
          if (notice.code === "meetingChanged") return title ? `Enlace cambiado en «${title}».` : "Enlace cambiado.";
          return title ? `Enlace agregado a «${title}».` : "Enlace agregado.";
        })()
      : undefined);
  const errorMessage = raw.error
    ? (CLASS_FIELD_ERRORS[raw.error] ?? STAFF_ERROR_MESSAGES[raw.error] ?? STAFF_ERROR_MESSAGES.invalid)
    : undefined;

  return (
    <div className="platform-page platform-page_width_wide staff-classes-page">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Clases</h1>
        <p className="platform-page__subtitle">{agenda.headline}</p>
        <div className="platform-page__actions">
          <Link href={staffRoutes.newClass()} className="platform-button">
            <CalendarPlusIcon variant="classic-solid" className="platform-button__icon" />
            Crear clase
          </Link>
          <RegisterPaymentButton
            variant="accent"
            students={students}
            teachers={teachers}
            groupClasses={groupClasses}
            timeZone={agenda.timeZone}
            nowIso={agenda.nowIso}
            registerPayment={registerPayment}
            loadPaymentContext={loadPaymentContext}
            loadTeacherBusy={loadTeacherBusy}
          />
        </div>
      </header>

      <StaffClassesSection
        agenda={agenda}
        queues={queues}
        teacherFilter={teacherFilter}
        teachers={teachers}
        groupClasses={groupClasses}
        notice={noticeText ?? undefined}
        errorMessage={errorMessage}
      />
    </div>
  );
}
