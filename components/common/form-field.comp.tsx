import type { ReactNode } from "react";
import "./form-field.comp.css";

interface FormFieldProps {
  label: string;
  /** El control nativo: input, select o textarea. */
  children: ReactNode;
  hint?: string;
  error?: string;
}

/**
 * Campo de formulario de la plataforma. Envuelve el control en un `<label>`
 * real (nada de placeholders haciendo de etiqueta) y define UNA sola vez el
 * aspecto de input/select/textarea de toda la zona autenticada.
 *
 * Sin estado: los formularios son `<form action={serverAction}>` y los errores
 * llegan del servidor, no de validación en el cliente.
 */
export function FormField({ label, children, hint, error }: FormFieldProps) {
  return (
    <label className="platform-field">
      <span className="platform-field__label">{label}</span>
      <span className="platform-field__control">{children}</span>
      {hint && <span className="platform-field__hint">{hint}</span>}
      {error && (
        <span className="platform-field__error" role="alert">
          {error}
        </span>
      )}
    </label>
  );
}

interface FormFieldsetProps {
  legend: string;
  children: ReactNode;
  hint?: string;
}

/** Para grupos de controles (checkboxes, radios), donde un `<label>` único no vale. */
export function FormFieldset({ legend, children, hint }: FormFieldsetProps) {
  return (
    <fieldset className="platform-field platform-field_variant_group">
      <legend className="platform-field__label">{legend}</legend>
      <div className="platform-field__control">{children}</div>
      {hint && <span className="platform-field__hint">{hint}</span>}
    </fieldset>
  );
}
