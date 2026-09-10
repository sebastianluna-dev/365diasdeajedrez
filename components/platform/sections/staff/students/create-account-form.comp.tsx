"use client";

import { useActionState } from "react";
import { FormField } from "@/components/platform/shared/form-field.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice.comp";
import { createStudentAccount } from "@/services/staff-students/staff-students.actions";
import { ACCOUNT_INITIAL_STATE } from "@/services/staff-students/staff-students.types";
import { TempPasswordNotice } from "./temp-password-notice.comp";
import "./create-account-form.comp.css";

/**
 * Account creation with a temporary password.
 *
 * The ONLY form of the platform (together with the password reset) that uses
 * `useActionState` instead of the `<form action={serverAction}>` + redirect
 * with `?error=` pattern: the action has to RETURN the generated password to
 * show it once, and a password in the URL would end up in the history, the
 * Referer and the logs.
 *
 * Known and accepted consequence: this form NEEDS JavaScript (without it the
 * `$ACTION_ID` is not emitted and the submit does not reach the server). It is
 * an internal panel, so it is assumed; it is not extended to any other form.
 */
export function CreateAccountForm() {
  const [state, formAction, isPending] = useActionState(createStudentAccount, ACCOUNT_INITIAL_STATE);

  return (
    <div className="create-account">
      {state.status === "error" && state.message && <PlatformNotice message={state.message} />}

      {state.status === "ok" &&
        (state.tempPassword ? (
          <TempPasswordNotice password={state.tempPassword} message={state.message} />
        ) : (
          <PlatformNotice message={state.message ?? "Cuenta creada."} variant="success" />
        ))}

      <form className="create-account__form platform-card" action={formAction}>
        <h2 className="platform-card__title">Nueva cuenta de alumno</h2>
        <p className="create-account__hint">
          No hay registro público ni correos de activación: la contraseña se genera aquí y se la entregas tú.
        </p>

        <FormField label="Nombre para mostrar">
          <input type="text" name="displayName" maxLength={120} required />
        </FormField>

        <FormField label="Email">
          <input type="email" name="email" maxLength={254} required autoComplete="off" />
        </FormField>

        <FormField
          label="Contraseña inicial (opcional)"
          hint="Si la dejas vacía se genera una temporal y se muestra una sola vez."
        >
          <input type="text" name="password" maxLength={200} autoComplete="off" />
        </FormField>

        <button type="submit" className="platform-button" disabled={isPending}>
          {isPending ? "Creando…" : "Crear cuenta"}
        </button>
      </form>
    </div>
  );
}
