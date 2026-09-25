import Link from "next/link";
import { FormField, FormFieldset } from "@/components/platform/shared/form-field.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice.comp";
import { TEACHER_ERROR_MESSAGES } from "@/constants/platform/teacher-messages.const";
import { teacherRoutes } from "@/lib/platform-routes";
import { createClass, updateClassMeta } from "@/services/teacher-classes/teacher-classes.actions";
import type { TeacherClassDetail } from "@/services/teacher-classes/teacher-classes.types";
import type { AssignedStudentSummary } from "@/services/teacher-students/teacher-students.types";
import "./class-form.section.css";
import { SubmitButton } from "@/components/platform/shared/submit-button.comp";
import { PlatformSelect } from "@/components/platform/shared/platform-select/platform-select.comp";

interface ClassFormSectionProps {
  /** No class = creation; with a class = editing it. */
  classDetail?: TeacherClassDetail;
  students: AssignedStudentSummary[];
  providers: { code: string; label: string }[];
  /** The teacher's time zone: the form's dates are interpreted in it. */
  timeZone: string;
  errorCode?: string;
}

const DEFAULT_DURATION = 60;

/**
 * Metadata of a class. The same form serves to create and to edit (the
 * action and the defaults change); the initial participants are only offered
 * on creation, because afterwards they are managed from the class page.
 */
export function ClassFormSection({ classDetail, students, providers, timeZone, errorCode }: ClassFormSectionProps) {
  const isEdit = classDetail !== undefined;
  const action = isEdit ? updateClassMeta.bind(null, classDetail.id) : createClass;
  const errorMessage = errorCode ? (TEACHER_ERROR_MESSAGES[errorCode] ?? TEACHER_ERROR_MESSAGES.invalid) : undefined;

  return (
    <form className="class-form platform-card" action={action}>
      <h2 className="platform-card__title">{isEdit ? "Editar la clase" : "Nueva clase"}</h2>
      <p className="class-form__hint">Las horas se interpretan en tu zona horaria ({timeZone.replace(/_/g, " ")}).</p>

      {errorMessage && <PlatformNotice message={errorMessage} />}

      <FormField label="Título">
        <input type="text" name="title" defaultValue={classDetail?.title ?? ""} maxLength={120} required />
      </FormField>

      <FormField label="Descripción (opcional)">
        <input type="text" name="description" defaultValue={classDetail?.description ?? ""} maxLength={500} />
      </FormField>

      <div className="class-form__row">
        <FormField label="Fecha y hora">
          <input type="datetime-local" name="scheduledAt" defaultValue={classDetail?.scheduledAtInput ?? ""} required />
        </FormField>

        <FormField label="Duración (minutos)" hint="Entre 15 y 480.">
          <input
            type="number"
            name="durationMin"
            min={15}
            max={480}
            step={5}
            defaultValue={classDetail?.durationMin ?? DEFAULT_DURATION}
            required
          />
        </FormField>
      </div>

      <div className="class-form__row">
        <FormField label="Plataforma de reunión (opcional)">
          <PlatformSelect
            name="meetingProviderCode"
            defaultValue={classDetail?.meetingProviderCode ?? ""}
            emptyOption="Sin plataforma"
            options={providers.map((provider) => ({ value: provider.code, label: provider.label }))}
            size="compact"
          />
        </FormField>

        <FormField label="Enlace de la reunión (opcional)">
          <input type="url" name="meetingUrl" defaultValue={classDetail?.meetingUrl ?? ""} maxLength={500} />
        </FormField>
      </div>

      <FormField
        label="El enlace se ve desde (opcional)"
        hint="Si lo dejas vacío, se abrirá 30 minutos antes de la clase. Tú lo ves siempre."
      >
        <input type="datetime-local" name="meetingUrlVisibleFrom" defaultValue="" />
      </FormField>

      {isEdit && (
        <>
          <FormField label="Grabación (URL, opcional)">
            <input type="url" name="recordingUrl" defaultValue={classDetail.recordingUrl ?? ""} maxLength={500} />
          </FormField>

          <FormField label="Resumen de la clase (opcional)">
            <textarea name="summary" defaultValue={classDetail.summary ?? ""} maxLength={5000} />
          </FormField>
        </>
      )}

      {!isEdit && (
        <FormFieldset
          legend="Alumnos inscritos"
          hint={
            students.length === 0
              ? "Todavía no tienes alumnos asignados; podrás inscribirlos desde la ficha de la clase."
              : "Sólo aparecen tus alumnos con asignación activa."
          }
        >
          {students.map((student) => (
            <label key={student.id}>
              <input type="checkbox" name="studentIds" value={student.id} />
              {student.displayName}
            </label>
          ))}
        </FormFieldset>
      )}

      <div className="class-form__actions">
        <SubmitButton>{isEdit ? "Guardar cambios" : "Crear clase"}</SubmitButton>
        <Link
          href={isEdit ? teacherRoutes.classDetail(classDetail.id) : teacherRoutes.classes}
          className="platform-button platform-button_variant_secondary"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
