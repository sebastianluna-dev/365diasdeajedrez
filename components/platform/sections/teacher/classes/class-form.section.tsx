import Link from "next/link";
import {
  PlatformForm,
  PlatformFormField,
  PlatformFormGroup,
} from "@/components/platform/shared/platform-form/platform-form.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import { TEACHER_ERROR_MESSAGES } from "@/constants/platform/teacher-messages.const";
import { teacherRoutes } from "@/lib/platform-routes";
import { createClass, updateClassMeta } from "@/services/teacher-classes/teacher-classes.actions";
import type { TeacherClassDetail } from "@/services/teacher-classes/teacher-classes.types";
import type { AssignedStudentSummary } from "@/services/teacher-students/teacher-students.types";
import "./class-form.section.css";
import { SubmitButton } from "@/components/platform/shared/submit-button/submit-button.comp";
import { PlatformSelect } from "@/components/platform/shared/platform-select/platform-select.comp";
import { PlatformCheckCards } from "@/components/platform/shared/platform-check-cards/platform-check-cards.comp";

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
    <PlatformForm className="class-form platform-card" action={action}>
      <h2 className="platform-card__title">{isEdit ? "Editar la clase" : "Nueva clase"}</h2>
      <p className="class-form__hint">Las horas se interpretan en tu zona horaria ({timeZone.replace(/_/g, " ")}).</p>

      {errorMessage && <PlatformNotice message={errorMessage} />}

      <PlatformFormField name="title" label="Título">
        <input type="text" defaultValue={classDetail?.title ?? ""} maxLength={120} required />
      </PlatformFormField>

      <PlatformFormField name="description" label="Descripción">
        <input type="text" defaultValue={classDetail?.description ?? ""} maxLength={500} />
      </PlatformFormField>

      <div className="class-form__row">
        <PlatformFormField name="scheduledAt" label="Fecha y hora">
          <input type="datetime-local" defaultValue={classDetail?.scheduledAtInput ?? ""} required />
        </PlatformFormField>

        <PlatformFormField name="durationMin" label="Duración (minutos)" hint="Entre 15 y 480.">
          <input
            type="number"
            min={15}
            max={480}
            step={5}
            defaultValue={classDetail?.durationMin ?? DEFAULT_DURATION}
            required
          />
        </PlatformFormField>
      </div>

      <div className="class-form__row">
        <PlatformFormField name="meetingProviderCode" label="Plataforma de reunión">
          <PlatformSelect
            defaultValue={classDetail?.meetingProviderCode ?? ""}
            emptyOption="Sin plataforma"
            options={providers.map((provider) => ({ value: provider.code, label: provider.label }))}
          />
        </PlatformFormField>

        <PlatformFormField name="meetingUrl" label="Enlace de la reunión">
          <input type="url" defaultValue={classDetail?.meetingUrl ?? ""} maxLength={500} />
        </PlatformFormField>
      </div>

      <PlatformFormField
        name="meetingUrlVisibleFrom"
        label="El enlace se ve desde"
        hint="Si lo dejas vacío, se abrirá 30 minutos antes de la clase. Tú lo ves siempre."
      >
        <input type="datetime-local" defaultValue={classDetail?.meetingUrlVisibleFromInput ?? ""} />
      </PlatformFormField>

      {isEdit && (
        <>
          <PlatformFormField name="recordingUrl" label="Grabación (URL)">
            <input type="url" defaultValue={classDetail.recordingUrl ?? ""} maxLength={500} />
          </PlatformFormField>

          <PlatformFormField name="summary" label="Resumen de la clase">
            <textarea defaultValue={classDetail.summary ?? ""} maxLength={5000} />
          </PlatformFormField>
        </>
      )}

      {!isEdit && (
        <PlatformFormGroup
          label="Alumnos inscritos"
          optional
          hint={
            students.length === 0
              ? "Todavía no tienes alumnos asignados; podrás inscribirlos desde la ficha de la clase."
              : "Sólo aparecen tus alumnos con asignación activa."
          }
        >
          <PlatformCheckCards
            name="studentIds"
            layout="line"
            options={students.map((student) => ({ value: student.id, label: student.displayName }))}
          />
        </PlatformFormGroup>
      )}

      <div className="class-form__actions">
        <SubmitButton className="platform-button platform-button_variant_ink">
          {isEdit ? "Guardar cambios" : "Crear clase"}
        </SubmitButton>
        <Link
          href={isEdit ? teacherRoutes.classDetail(classDetail.id) : teacherRoutes.classes}
          className="platform-button"
        >
          Cancelar
        </Link>
      </div>
    </PlatformForm>
  );
}
