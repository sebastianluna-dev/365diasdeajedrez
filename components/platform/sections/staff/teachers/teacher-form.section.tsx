import { FormField } from "@/components/platform/shared/form-field.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice.comp";
import { STAFF_ERROR_MESSAGES } from "@/constants/platform/staff-messages.const";
import { TIMEZONE_OPTIONS } from "@/constants/platform/timezones.const";
import { createTeacher } from "@/services/staff-teachers/staff-teachers.actions";
import type { LinkableUser } from "@/services/staff-teachers/staff-teachers.types";
import "./teacher-form.section.css";
import { SubmitButton } from "@/components/platform/shared/submit-button.comp";
import { PlatformSelect } from "@/components/platform/shared/platform-select/platform-select.comp";

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
          <PlatformSelect
            name="userId"
            required
            placeholder="Elige una cuenta…"
            options={linkableUsers.map((user) => ({ value: user.id, label: `${user.displayName} — ${user.email}` }))}
            size="compact"
          />
        </FormField>

        <FormField label="Nombre para mostrar" hint="Cómo lo verán sus alumnos.">
          <input type="text" name="displayName" maxLength={120} required />
        </FormField>

        <FormField label="Título (opcional)">
          <input type="text" name="title" maxLength={120} />
        </FormField>

        <FormField label="Zona horaria">
          <PlatformSelect
            name="timezone"
            options={TIMEZONE_OPTIONS}
            defaultValue="America/Mexico_City"
            size="compact"
          />
        </FormField>

        <SubmitButton pendingLabel="Vinculando…">Vincular como profesor</SubmitButton>
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
          <PlatformSelect
            name="timezone"
            options={TIMEZONE_OPTIONS}
            defaultValue="America/Mexico_City"
            size="compact"
          />
        </FormField>

        <FormField label="Biografía (opcional)">
          <textarea name="bio" maxLength={1000} />
        </FormField>

        <SubmitButton pendingLabel="Creando…">Crear profesor</SubmitButton>
      </form>
    </div>
  );
}
