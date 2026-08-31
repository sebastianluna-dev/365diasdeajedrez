"use client";

import { useActionState } from "react";
import { FormField } from "@/components/common/form-field.comp";
import { PlatformNotice } from "@/components/common/platform-notice.comp";
import { createStudentAccount } from "@/services/staff-students/staff-students.actions";
import { ACCOUNT_INITIAL_STATE } from "@/services/staff-students/staff-students.types";
import { TempPasswordNotice } from "./temp-password-notice.comp";
import "./create-account-form.comp.css";

/**
 * Alta de cuenta con contraseña temporal.
 *
 * ÚNICO formulario de la plataforma (junto al reinicio de contraseña) que usa
 * `useActionState` en vez del patrón `<form action={serverAction}>` + redirect
 * con `?error=`: la acción tiene que DEVOLVER la contraseña generada para
 * enseñarla una sola vez, y una contraseña en la URL acabaría en el historial,
 * en el Referer y en los logs.
 *
 * Consecuencia conocida y aceptada: este formulario NECESITA JavaScript (sin él
 * no se emite el `$ACTION_ID` y el envío no llega al servidor). Es un panel
 * interno, así que se asume; no se extiende a ningún otro formulario.
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
