"use client";

import { useFormStatus } from "react-dom";

/**
 * Botón de envío con estado de espera. Es lo único que necesita JavaScript en
 * el login: el formulario es una server action plana, así que sin JS el botón
 * sigue enviando igual, sólo que sin el texto de «Entrando…».
 */
export function LoginSubmit() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="platform-button login__submit" disabled={pending}>
      {pending ? "Entrando…" : "Entrar"}
    </button>
  );
}
