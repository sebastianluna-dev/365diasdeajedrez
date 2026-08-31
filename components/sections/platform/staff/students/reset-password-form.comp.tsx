"use client";

import { useActionState } from "react";
import { FormField } from "@/components/common/form-field.comp";
import { PlatformNotice } from "@/components/common/platform-notice.comp";
import { resetStudentPassword } from "@/services/staff-students/staff-students.actions";
import { ACCOUNT_INITIAL_STATE } from "@/services/staff-students/staff-students.types";
import { TempPasswordNotice } from "./temp-password-notice.comp";
import "./reset-password-form.comp.css";

interface ResetPasswordFormProps {
  userId: string;
}

/**
 * Reinicio de contraseña. Misma excepción que el alta: usa `useActionState`
 * para poder devolver la contraseña temporal sin meterla en la URL, y por eso
 * necesita JavaScript. Reiniciar cierra TODAS las sesiones de esa cuenta.
 */
export function ResetPasswordForm({ userId }: ResetPasswordFormProps) {
  const [state, formAction, isPending] = useActionState(resetStudentPassword, ACCOUNT_INITIAL_STATE);

  return (
    <div className="reset-password">
      {state.status === "error" && state.message && <PlatformNotice message={state.message} />}

      {state.status === "ok" &&
        (state.tempPassword ? (
          <TempPasswordNotice password={state.tempPassword} message={state.message} />
        ) : (
          <PlatformNotice message={state.message ?? "Contraseña restablecida."} variant="success" />
        ))}

      <form className="reset-password__form" action={formAction}>
        <input type="hidden" name="userId" value={userId} />

        <FormField
          label="Contraseña nueva (opcional)"
          hint="Vacía = se genera una temporal. Al guardar se cierran todas sus sesiones."
        >
          <input type="text" name="password" maxLength={200} autoComplete="off" />
        </FormField>

        <button type="submit" className="platform-button platform-button_variant_secondary" disabled={isPending}>
          {isPending ? "Restableciendo…" : "Restablecer contraseña"}
        </button>
      </form>
    </div>
  );
}
