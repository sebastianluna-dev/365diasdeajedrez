"use client";

import { useState } from "react";
import "./temp-password-notice.comp.css";

interface TempPasswordNoticeProps {
  password: string;
  message?: string;
}

/**
 * Enseña la contraseña temporal UNA vez. No se guarda, no viaja en la URL y no
 * se vuelve a mostrar al recargar: sólo existe en la respuesta de la acción que
 * la generó. Si se pierde, se genera otra desde la ficha.
 */
export function TempPasswordNotice({ password, message }: TempPasswordNoticeProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
    } catch {
      // Sin permiso de portapapeles se copia a mano: la contraseña está a la vista.
      setCopied(false);
    }
  };

  return (
    <div className="temp-password" role="status">
      {message && <p className="temp-password__message">{message}</p>}
      <p className="temp-password__warning">Anótala ahora: no se volverá a mostrar.</p>

      <div className="temp-password__row">
        <code className="temp-password__value">{password}</code>
        <button type="button" className="platform-button platform-button_variant_secondary" onClick={copy}>
          {copied ? "Copiada" : "Copiar"}
        </button>
      </div>
    </div>
  );
}
