import { FormField } from "@/components/platform/shared/form-field.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice.comp";
import { STAFF_ERROR_MESSAGES } from "@/constants/platform/staff-messages.const";
import { COMMON_TIMEZONES } from "@/constants/platform/timezones.const";
import { createTeacher } from "@/services/staff-teachers/staff-teachers.actions";
import type { LinkableUser } from "@/services/staff-teachers/staff-teachers.types";
import "./teacher-form.section.css";

interface TeacherFormSectionProps {
  linkableUsers: LinkableUser[];
  errorCode?: string;
}

/**
 * Teacher creation in two modes, each with its own form so there are no
 * fields silently ignored: link an account that already exists, or create
 * account and record at once.
 */
export function TeacherFormSection({ linkableUsers, errorCode }: TeacherFormSectionProps) {
  const errorMessage = errorCode ? (STAFF_ERROR_MESSAGES[errorCode] ?? STAFF_ERROR_MESSAGES.invalid) : undefined;

  return (
    <div className="teacher-form">
      {errorMessage && <PlatformNotice message={errorMessage} />}

      <form className="teacher-form__card platform-card" action={createTeacher}>
        <h2 className="platform-card__title">Vincular una cuenta existente</h2>
        <p className="teacher-form__hint">
          Convierte en profesor a alguien que ya tiene cuenta. Sigue pudiendo usar la plataforma como alumno.
        </p>

        <FormField label="Cuenta">
          <select name="userId" required defaultValue="">
            <option value="" disabled>
              Elige una cuenta…
            </option>
            {linkableUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.displayName} — {user.email}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Nombre para mostrar" hint="Cómo lo verán sus alumnos.">
          <input type="text" name="displayName" maxLength={120} required />
        </FormField>

        <FormField label="Título (opcional)">
          <input type="text" name="title" maxLength={120} />
        </FormField>

        <FormField label="Zona horaria">
          <select name="timezone" defaultValue="America/Mexico_City">
            {COMMON_TIMEZONES.map((timezone) => (
              <option key={timezone} value={timezone}>
                {timezone.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </FormField>

        <button type="submit" className="platform-button">
          Vincular como profesor
        </button>
      </form>

      <form className="teacher-form__card platform-card" action={createTeacher}>
        <h2 className="platform-card__title">Crear cuenta y ficha de profesor</h2>
        <p className="teacher-form__hint">
          Crea las dos cosas a la vez. Si dejas la contraseña vacía se genera una: entrégasela reiniciándola desde su
          ficha, que es donde se muestra una sola vez.
        </p>

        <FormField label="Nombre para mostrar">
          <input type="text" name="displayName" maxLength={120} required />
        </FormField>

        <FormField label="Email">
          <input type="email" name="email" maxLength={254} required autoComplete="off" />
        </FormField>

        <FormField label="Contraseña inicial (opcional)">
          <input type="text" name="password" maxLength={200} autoComplete="off" />
        </FormField>

        <FormField label="Título (opcional)">
          <input type="text" name="title" maxLength={120} />
        </FormField>

        <FormField label="Zona horaria">
          <select name="timezone" defaultValue="America/Mexico_City">
            {COMMON_TIMEZONES.map((timezone) => (
              <option key={timezone} value={timezone}>
                {timezone.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Biografía (opcional)">
          <textarea name="bio" maxLength={1000} />
        </FormField>

        <button type="submit" className="platform-button">
          Crear profesor
        </button>
      </form>
    </div>
  );
}
