"use client";

import { useFormStatus } from "react-dom";

/**
 * Submit button with a pending state. It is the only thing that needs
 * JavaScript in the login: the form is a plain server action, so without JS
 * the button still submits, only without the "Entrando…" text.
 */
export function LoginSubmit() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="platform-button login__submit" disabled={pending}>
      {pending ? "Entrando…" : "Entrar"}
    </button>
  );
}
