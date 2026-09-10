import type { ReactNode } from "react";
import "./form-field.comp.css";

interface FormFieldProps {
  label: string;
  /** The native control: input, select or textarea. */
  children: ReactNode;
  hint?: string;
  error?: string;
}

/**
 * Platform form field. Wraps the control in a real `<label>` (no placeholders
 * acting as labels) and defines ONCE the look of input/select/textarea for
 * the whole authenticated area.
 *
 * Stateless: forms are `<form action={serverAction}>` and errors come from
 * the server, not from client-side validation.
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

/** For groups of controls (checkboxes, radios), where a single `<label>` does not work. */
export function FormFieldset({ legend, children, hint }: FormFieldsetProps) {
  return (
    <fieldset className="platform-field platform-field_variant_group">
      <legend className="platform-field__label">{legend}</legend>
      <div className="platform-field__control">{children}</div>
      {hint && <span className="platform-field__hint">{hint}</span>}
    </fieldset>
  );
}
