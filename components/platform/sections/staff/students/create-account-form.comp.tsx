"use client";

import { useActionState } from "react";
import { PlatformForm, PlatformFormField } from "@/components/platform/shared/platform-form/platform-form.comp";
import { PlatformNotice } from "@/components/platform/shared/platform-notice/platform-notice.comp";
import { createStudentAccount } from "@/services/staff-students/staff-students.actions";
import { ACCOUNT_INITIAL_STATE } from "@/services/staff-students/staff-students.types";
import { TempPasswordNotice } from "./temp-password-notice.comp";
import "./create-account-form.comp.css";

/**
 * Account creation with a temporary password.
 *
 * One of the three forms of the platform (with the password reset and the
 * author form of the «Autores» dialog) that use `useActionState` instead of
 * the `<form action={serverAction}>` + redirect with `?error=` pattern: the
 * action has to RETURN the generated password to
 * show it once, and a password in the URL would end up in the history, the
 * Referer and the logs.
 *
 * Known and accepted consequence: this form NEEDS JavaScript (without it the
 * `$ACTION_ID` is not emitted and the submit does not reach the server). It is
 * an internal panel, so it is assumed; it is not extended to a form that can
 * do with the redirect.
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

      <PlatformForm className="create-account__form platform-card" action={formAction}>
        <h2 className="platform-card__title">Nueva cuenta de alumno</h2>
        <p className="create-account__hint">
          No hay registro público ni correos de activación: la contraseña se genera aquí y se la entregas tú.
        </p>

        <PlatformFormField name="displayName" label="Nombre para mostrar">
          <input type="text" maxLength={120} required />
        </PlatformFormField>

        <PlatformFormField name="email" label="Email">
          <input type="email" maxLength={254} required autoComplete="off" />
        </PlatformFormField>

        <PlatformFormField
          name="password"
          label="Contraseña inicial"
          hint="Si la dejas vacía se genera una temporal y se muestra una sola vez."
        >
          <input type="text" maxLength={200} autoComplete="off" />
        </PlatformFormField>

        <button type="submit" className="platform-button" disabled={isPending}>
          {isPending ? "Creando…" : "Crear cuenta"}
        </button>
      </PlatformForm>
    </div>
  );
}
