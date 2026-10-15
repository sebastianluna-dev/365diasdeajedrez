import Link from "next/link";
import { CalendarPlusIcon } from "@/components/icons/calendar-plus-icon.comp";
import { RegisterPaymentButton } from "@/components/platform/shared/register-payment-popup/register-payment-popup.comp";
import { StaffTabs } from "@/components/platform/shared/staff-tabs/staff-tabs.comp";
import { studentTabs } from "@/components/platform/shared/staff-tabs/staff-tabs.const";
import { STUDY_DAY_TIMEZONE } from "@/constants/platform/timezones.const";
import { staffRoutes } from "@/lib/platform-routes";
import { loadPaymentContext, loadTeacherBusy, registerPayment } from "@/services/staff-payments/staff-payments.actions";
import type { OpenGroupClassOption, TeacherOption } from "@/services/staff-payments/staff-payments.types";
import type { StaffStudentDetail } from "@/services/staff-students/staff-students.types";
import "./student-record-head.comp.css";

interface StudentRecordHeadProps {
  student: StaffStudentDetail;
  teachers: TeacherOption[];
  groupClasses: OpenGroupClassOption[];
}

/**
 * How a student names themselves on the pages of their record: the name,
 * the email with their teacher, the actions («Crear clase» with the student
 * chosen, «Registrar pago» with the student fixed) and the tabs. Drawn by the record's LAYOUT,
 * so the pages cannot drift apart and the head does not blink between
 * them. It imports the actions and hands them to the popup as props.
 */
export function StudentRecordHead({ student, teachers, groupClasses }: StudentRecordHeadProps) {
  const activeAssignment = student.assignments.find((assignment) => assignment.isActive);
  return (
    <>
      <header className="platform-page__head student-record-head">
        <h1 className="platform-page__title">{student.displayName}</h1>
        <p className="platform-page__subtitle">
          {student.email} · {activeAssignment ? `Profesor: ${activeAssignment.teacherName}` : "Sin profesor asignado"}
        </p>
        <div className="platform-page__actions">
          <Link href={staffRoutes.newClass({ alumno: student.id })} className="platform-button">
            <CalendarPlusIcon variant="classic-solid" className="platform-button__icon" />
            Crear clase
          </Link>
          <RegisterPaymentButton
            variant="accent"
            fixedStudent={{ id: student.id, displayName: student.displayName, email: student.email }}
            teachers={teachers}
            groupClasses={groupClasses}
            timeZone={STUDY_DAY_TIMEZONE}
            nowIso={new Date().toISOString()}
            registerPayment={registerPayment}
            loadPaymentContext={loadPaymentContext}
            loadTeacherBusy={loadTeacherBusy}
          />
        </div>
      </header>
      <StaffTabs tabs={studentTabs(student.id)} />
    </>
  );
}
