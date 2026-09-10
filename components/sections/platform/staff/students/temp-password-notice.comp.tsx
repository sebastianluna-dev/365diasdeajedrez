"use client";

import { useState } from "react";
import "./temp-password-notice.comp.css";

interface TempPasswordNoticeProps {
  password: string;
  message?: string;
}

/**
 * Shows the temporary password ONCE. It is not stored, does not travel in the
 * URL and is not shown again on reload: it only exists in the response of the
 * action that generated it. If it is lost, another one is generated from the record.
 */
export function TempPasswordNotice({ password, message }: TempPasswordNoticeProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
    } catch {
      // Without clipboard permission it is copied by hand: the password is in plain view.
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
