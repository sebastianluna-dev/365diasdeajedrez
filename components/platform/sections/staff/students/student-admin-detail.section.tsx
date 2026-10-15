import { PlatformForm, PlatformFormField } from "@/components/platform/shared/platform-form/platform-form.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
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
    </div>
  );
}
