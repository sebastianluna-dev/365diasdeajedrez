"use client";

import { useFormStatus } from "react-dom";
import { SpinnerIcon } from "@/components/icons/spinner-icon.comp";

/**
 * Submit button with a pending state. It is the only thing that needs
 * JavaScript in the login: the form is a plain server action, so without JS
 * the button still submits, only without the "Entrando…" text and the ring
 * that turns before it, the platform button's loading state.
 */
export function LoginSubmit() {
  const { pending } = useFormStatus();

  // The accent: the one action of the one screen there is before the platform.
  return (
    <button
      type="submit"
      className="platform-button platform-button_variant_accent platform-button_size_lg login__submit"
      disabled={pending}
      aria-busy={pending || undefined}
    >
      {pending && <SpinnerIcon variant="classic-solid" className="platform-button__icon platform-button__spinner" />}
      {pending ? "Entrando…" : "Entrar"}
    </button>
  );
}
