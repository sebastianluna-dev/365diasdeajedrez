import { FormField } from "@/components/platform/shared/form-field.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice.comp";
import { TEACHER_ERROR_MESSAGES } from "@/constants/platform/teacher-messages.const";
import { TIMEZONE_OPTIONS } from "@/constants/platform/timezones.const";
import { updateTeacherProfile } from "@/services/teacher/teacher.actions";
import type { TeacherProfile } from "@/services/teacher/teacher.types";
import "./teacher-profile.section.css";
import { SubmitButton } from "@/components/platform/shared/submit-button.comp";
import { PlatformSelect } from "@/components/platform/shared/platform-select/platform-select.comp";

interface TeacherProfileSectionProps {
  profile: TeacherProfile;
  /** Error code returned by the action in `?error=`. */
  errorCode?: string;
}

export function TeacherProfileSection({ profile, errorCode }: TeacherProfileSectionProps) {
  const errorMessage = errorCode ? (TEACHER_ERROR_MESSAGES[errorCode] ?? TEACHER_ERROR_MESSAGES.invalid) : undefined;

  return (
    <form className="teacher-profile platform-card" action={updateTeacherProfile}>
      <h2 className="platform-card__title">Mi perfil público</h2>
      <p className="teacher-profile__hint">
        Es lo que ven tus alumnos en las clases que impartes. Tu email de acceso ({profile.email}) no se cambia desde
        aquí.
      </p>

      {errorMessage && <PlatformNotice message={errorMessage} />}

      <div className="teacher-profile__fields">
        <FormField label="Nombre para mostrar">
          <input type="text" name="displayName" defaultValue={profile.displayName} maxLength={120} required />
        </FormField>

        <FormField label="Título (opcional)" hint="Por ejemplo: Gran Maestro, Maestro FIDE.">
          <input type="text" name="title" defaultValue={profile.title ?? ""} maxLength={120} />
        </FormField>

        <FormField label="Zona horaria" hint="Se usa para programar tus clases en tu hora local.">
          <PlatformSelect
            name="timezone"
            options={TIMEZONE_OPTIONS}
            defaultValue={profile.timezone ?? "UTC"}
            size="compact"
          />
        </FormField>

        <FormField label="Foto (URL, opcional)" hint="Enlace a una imagen ya publicada.">
          <input type="url" name="photo" defaultValue={profile.photo ?? ""} maxLength={500} />
        </FormField>
      </div>

      <FormField label="Biografía (opcional)">
        <textarea name="bio" defaultValue={profile.bio ?? ""} maxLength={1000} />
      </FormField>

      <SubmitButton>Guardar cambios</SubmitButton>
    </form>
  );
}
