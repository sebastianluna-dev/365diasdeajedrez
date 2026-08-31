import { FormField } from "@/components/common/form-field.comp";
import { LocalDateTime } from "@/components/common/local-datetime.comp";
import { PlatformNotice } from "@/components/common/platform-notice.comp";
import { PlatformTable, PlatformTableCell, PlatformTableRow } from "@/components/common/platform-table.comp";
import { STAFF_ERROR_MESSAGES } from "@/constants/platform/staff-messages.const";
import { COMMON_TIMEZONES } from "@/constants/platform/timezones.const";
import { setTeacherActive, updateTeacher } from "@/services/staff-teachers/staff-teachers.actions";
import type { AssignableStudent, StaffTeacherDetail } from "@/services/staff-teachers/staff-teachers.types";
import { AssignmentPanel } from "../assignments/assignment-panel.comp";
import "./teacher-admin-detail.section.css";

interface TeacherAdminDetailSectionProps {
  teacher: StaffTeacherDetail;
  assignable: AssignableStudent[];
  errorCode?: string;
}

export function TeacherAdminDetailSection({ teacher, assignable, errorCode }: TeacherAdminDetailSectionProps) {
  const errorMessage = errorCode ? (STAFF_ERROR_MESSAGES[errorCode] ?? STAFF_ERROR_MESSAGES.invalid) : undefined;

  return (
    <div className="teacher-admin">
      {errorMessage && <PlatformNotice message={errorMessage} />}

      <section className="platform-card">
        <h2 className="platform-card__title">Perfil</h2>

        <form className="teacher-admin__form" action={updateTeacher.bind(null, teacher.id)}>
          <FormField label="Nombre para mostrar">
            <input type="text" name="displayName" defaultValue={teacher.displayName} maxLength={120} required />
          </FormField>

          <FormField label="Título (opcional)">
            <input type="text" name="title" defaultValue={teacher.title ?? ""} maxLength={120} />
          </FormField>

          <FormField label="Zona horaria">
            <select name="timezone" defaultValue={teacher.timezone ?? "UTC"}>
              {COMMON_TIMEZONES.map((timezone) => (
                <option key={timezone} value={timezone}>
                  {timezone.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Foto (URL, opcional)">
            <input type="url" name="photo" defaultValue={teacher.photo ?? ""} maxLength={500} />
          </FormField>

          <FormField label="Biografía (opcional)">
            <textarea name="bio" defaultValue={teacher.bio ?? ""} maxLength={1000} />
          </FormField>

          <button type="submit" className="platform-button">
            Guardar perfil
          </button>
        </form>

        <p className="teacher-admin__meta">Cuenta de acceso: {teacher.email}</p>
      </section>

      <section className="platform-card">
        <h2 className="platform-card__title">Estado</h2>
        <p className="teacher-admin__meta">
          {teacher.isActive
            ? "Activo: puede entrar a su panel y recibir alumnos."
            : "Desactivado: no puede entrar a /teacher ni recibir asignaciones. Sus clases y su historial siguen intactos."}
        </p>

        {/* Desactivar NO cierra asignaciones: reasignar es una decisión humana. */}
        {teacher.isActive && teacher.students.length > 0 && (
          <PlatformNotice
            variant="info"
            message={`Si lo desactivas, sus ${teacher.students.length} asignación(es) activa(s) seguirán abiertas: reasigna a esos alumnos a mano.`}
          />
        )}

        <form className="teacher-admin__status" action={setTeacherActive.bind(null, teacher.id)}>
          {teacher.isActive ? null : <input type="hidden" name="isActive" value="on" />}
          <button type="submit" className="platform-button platform-button_variant_secondary">
            {teacher.isActive ? "Desactivar profesor" : "Reactivar profesor"}
          </button>
        </form>
      </section>

      <section className="platform-card">
        <h2 className="platform-card__title">Alumnos asignados</h2>
        <AssignmentPanel
          mode="byTeacher"
          teacherId={teacher.id}
          students={teacher.students}
          assignable={assignable}
        />
      </section>

      <section className="platform-card">
        <h2 className="platform-card__title">Clases</h2>
        <PlatformTable
          columns={["Clase", "Fecha", "Estado", { label: "Alumnos", align: "right" }]}
          emptyLabel="Este profesor todavía no ha programado clases."
          minWidth={620}
        >
          {teacher.classes.map((teacherClass) => (
            <PlatformTableRow key={teacherClass.id}>
              <PlatformTableCell strong>{teacherClass.title}</PlatformTableCell>
              <PlatformTableCell>
                <LocalDateTime iso={teacherClass.scheduledAtIso} fallback={teacherClass.dateLabel} withTime={false} />
              </PlatformTableCell>
              <PlatformTableCell>{teacherClass.statusLabel}</PlatformTableCell>
              <PlatformTableCell align="right">{teacherClass.participantCount}</PlatformTableCell>
            </PlatformTableRow>
          ))}
        </PlatformTable>
      </section>
    </div>
  );
}
