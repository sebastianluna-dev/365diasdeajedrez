import type { ReactNode } from "react";
import "./optional-fields.comp.css";

/**
 * A set of fields that are ALL optional, said once: «Todos los campos son
 * opcionales.» over them, and no «Opcional» on any of them — on a form of
 * fifteen fields, fifteen pills say nothing a line does not.
 *
 * It is a container (`children`), and the marks are hidden by its
 * stylesheet, not by telling each field: `FormField` is a Server Component,
 * and the server has no context to pass it down. The note and the hiding
 * live in this one piece, so neither can be there without the other.
 *
 * Not for a form of one field («Contraseña nueva» keeps its pill), nor for
 * a filter bar, whose fields are searches and selects and carry no mark.
 */
export function OptionalFields({ children }: { children: ReactNode }) {
  return (
    <div className="optional-fields">
      <p className="optional-fields__note">Todos los campos son opcionales.</p>
      {children}
    </div>
  );
}
