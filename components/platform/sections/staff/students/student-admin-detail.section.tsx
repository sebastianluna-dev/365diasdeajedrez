import { LocalDateTime } from "@/components/platform/shared/local-datetime/local-datetime.comp";
import { PlatformForm, PlatformFormField } from "@/components/platform/shared/platform-form/platform-form.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import {
  PlatformTable,
  PlatformTableCell,
  PlatformTableRow,
} from "@/components/platform/shared/platform-table/platform-table.comp";
import { STAFF_ERROR_MESSAGES } from "@/constants/platform/staff-messages.const";
import { updateStudent } from "@/services/staff-students/staff-students.actions";
import type { StaffStudentDetail } from "@/services/staff-students/staff-students.types";
import { AssignmentPanel } from "@/components/platform/sections/staff/assignments/assignment-panel.comp";
import { ResetPasswordForm } from "./reset-password-form.comp";
import "./student-admin-detail.section.css";
import { SubmitButton } from "@/components/platform/shared/submit-button/submit-button.comp";

interface StudentAdminDetailSectionProps {
  student: StaffStudentDetail;
  teachers: { id: string; displayName: string }[];
  errorCode?: string;
}

/**
 * Administrative record of an account. Deliberately gives NO access to the
 * student's studies or games: operating accounts (creation, passwords,
 * assignments) is not the same as reading private content.
 */
const COVERAGE_LABEL = { paid: "Pagada", free: "Gratis", unpaid: "Sin pago" } as const;

function attendanceLabel(attended: boolean | null): string {
  return attended === null ? "Sin pasar lista" : attended ? "Sí" : "No";
}

export function StudentAdminDetailSection({ student, teachers, errorCode }: StudentAdminDetailSectionProps) {
  const errorMessage = errorCode ? (STAFF_ERROR_MESSAGES[errorCode] ?? STAFF_ERROR_MESSAGES.invalid) : undefined;

  return (
    <div className="student-admin">
      {errorMessage && <PlatformNotice message={errorMessage} />}

      <section className="platform-card">
        <h2 className="platform-card__title">Datos de la cuenta</h2>

        <PlatformForm className="student-admin__form" action={updateStudent.bind(null, student.id)}>
          <PlatformFormField name="displayName" label="Nombre para mostrar">
            <input type="text" defaultValue={student.displayName} maxLength={120} required />
          </PlatformFormField>

          <PlatformFormField name="email" label="Email">
            <input type="email" defaultValue={student.email} maxLength={254} required />
          </PlatformFormField>

          <SubmitButton>Guardar</SubmitButton>
        </PlatformForm>

        <dl className="student-admin__facts">
          <div className="student-admin__fact">
            <dt className="student-admin__fact-label">Alta</dt>
            <dd className="student-admin__fact-value">{student.createdAtLabel}</dd>
          </div>
          <div className="student-admin__fact">
            <dt className="student-admin__fact-label">Último acceso</dt>
            <dd className="student-admin__fact-value">{student.lastLoginAtLabel ?? "Nunca"}</dd>
          </div>
          <div className="student-admin__fact">
            <dt className="student-admin__fact-label">Contraseña</dt>
            <dd className="student-admin__fact-value">
              {student.hasPassword
                ? `Actualizada ${student.passwordUpdatedAtLabel ?? "—"}`
                : "Sin contraseña: no puede iniciar sesión"}
            </dd>
          </div>
        </dl>
      </section>

      <section className="platform-card">
        <h2 className="platform-card__title">Profesor asignado</h2>
        <AssignmentPanel
          mode="byStudent"
          studentId={student.id}
          assignments={student.assignments}
          teachers={teachers}
        />
      </section>

      <section className="platform-card">
        <h2 className="platform-card__title">Contraseña</h2>
        <ResetPasswordForm userId={student.id} />
      </section>

      <section className="platform-card">
        <h2 className="platform-card__title">Clases</h2>
        <PlatformTable
          label="Clases"
          columns={["Clase", "Profesor", "Fecha", "Estado", "Asistió", "Pago"]}
          emptyLabel="Esta cuenta no participa en ninguna clase."
          minWidth={800}
        >
          {student.classes.map((participation) => (
            <PlatformTableRow key={participation.classId}>
              <PlatformTableCell strong>{participation.title}</PlatformTableCell>
              <PlatformTableCell>{participation.teacherName}</PlatformTableCell>
              <PlatformTableCell>
                <LocalDateTime iso={participation.scheduledAtIso} fallback={participation.dateLabel} withTime={false} />
              </PlatformTableCell>
              <PlatformTableCell>{participation.statusLabel}</PlatformTableCell>
              <PlatformTableCell>{attendanceLabel(participation.attended)}</PlatformTableCell>
              <PlatformTableCell>{COVERAGE_LABEL[participation.coverage]}</PlatformTableCell>
            </PlatformTableRow>
          ))}
        </PlatformTable>
      </section>
    </div>
  );
}
