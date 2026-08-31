import { FormField } from "@/components/common/form-field.comp";
import { LocalDateTime } from "@/components/common/local-datetime.comp";
import { PlatformNotice } from "@/components/common/platform-notice.comp";
import { PlatformTable, PlatformTableCell, PlatformTableRow } from "@/components/common/platform-table.comp";
import { STAFF_ERROR_MESSAGES } from "@/constants/platform/staff-messages.const";
import { updateStudent } from "@/services/staff-students/staff-students.actions";
import type { StaffStudentDetail } from "@/services/staff-students/staff-students.types";
import { AssignmentPanel } from "../assignments/assignment-panel.comp";
import { ResetPasswordForm } from "./reset-password-form.comp";
import "./student-admin-detail.section.css";

interface StudentAdminDetailSectionProps {
  student: StaffStudentDetail;
  teachers: { id: string; displayName: string }[];
  errorCode?: string;
}

/**
 * Ficha administrativa de una cuenta. Deliberadamente NO da acceso a los
 * estudios ni a las partidas del alumno: operar cuentas (altas, contraseñas,
 * asignaciones) no es lo mismo que leer contenido privado.
 */
export function StudentAdminDetailSection({ student, teachers, errorCode }: StudentAdminDetailSectionProps) {
  const errorMessage = errorCode ? (STAFF_ERROR_MESSAGES[errorCode] ?? STAFF_ERROR_MESSAGES.invalid) : undefined;

  return (
    <div className="student-admin">
      {errorMessage && <PlatformNotice message={errorMessage} />}

      <section className="platform-card">
        <h2 className="platform-card__title">Datos de la cuenta</h2>

        <form className="student-admin__form" action={updateStudent.bind(null, student.id)}>
          <FormField label="Nombre para mostrar">
            <input type="text" name="displayName" defaultValue={student.displayName} maxLength={120} required />
          </FormField>

          <FormField label="Email">
            <input type="email" name="email" defaultValue={student.email} maxLength={254} required />
          </FormField>

          <button type="submit" className="platform-button">
            Guardar
          </button>
        </form>

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
              <PlatformTableCell>{participation.attended ? "Sí" : "No"}</PlatformTableCell>
              <PlatformTableCell>{participation.hasPayment ? "Registrado" : "—"}</PlatformTableCell>
            </PlatformTableRow>
          ))}
        </PlatformTable>
      </section>
    </div>
  );
}
