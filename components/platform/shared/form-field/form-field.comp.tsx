import type { ReactNode } from "react";
import { PlatformInfoTip } from "@/components/platform/shared/platform-info-tip/platform-info-tip.comp";
import "./form-field.comp.css";

interface FormFieldProps {
  label: string;
  /** The native control: input, select or textarea. */
  children: ReactNode;
  /** What the person needs in order to fill the field in: a line under it, always in sight. */
  hint?: string;
  /**
   * A clarification folded into an "i" inside the control, at its right end,
   * shown on hover, on focus and on a press (`PlatformInfoTip`): for what
   * helps the first time and is a line of small print every time after. For
   * a text input: a select or a date picker has its own mark there.
   */
  info?: string;
  error?: string;
}

/**
 * Platform form field. Wraps the control in a real `<label>` (no placeholders
 * acting as labels) and defines ONCE the look of input/select/textarea for
 * the whole authenticated area.
 *
 * Stateless: forms are `<form action={serverAction}>` and errors come from
 * the server, not from client-side validation. The one piece with state is
 * the "i" of a field that has `info`, which is a client leaf of its own.
 */
export function FormField({ label, children, hint, info, error }: FormFieldProps) {
  const body = (
    <>
      <span className="platform-field__label">{label}</span>
      <span className="platform-field__control">{children}</span>
      {hint && <span className="platform-field__hint">{hint}</span>}
      {error && (
        <span className="platform-field__error" role="alert">
          {error}
        </span>
      )}
    </>
  );

  if (!info) return <label className="platform-field">{body}</label>;

  // The "i" is a button, and a button inside the `<label>` would be the
  // control the label names — it comes before the input — and would put its
  // own name and the tip's text into the input's. So it sits OUTSIDE the
  // label, as its sibling, and the stylesheet places it inside the control,
  // at its end: the label lends its boxes to the field's grid
  // (`display: contents`) and still wraps, and names, the control.
  return (
    <div className="platform-field platform-field_with_info">
      <label className="platform-field__body">{body}</label>
      <span className="platform-field__info">
        <PlatformInfoTip label={`Sobre «${label}»`} text={info} />
      </span>
    </div>
  );
}

interface FormFieldsetProps {
  legend: string;
  /** The group's control: `PlatformCheckCards` or `PlatformChoiceCards`, which draw their own boxes. */
  children: ReactNode;
  hint?: string;
}

/**
 * For a group of choices a single `<label>` cannot name: the legend over the
 * cards, with no frame of its own, since the cards already draw one each.
 */
export function FormFieldset({ legend, children, hint }: FormFieldsetProps) {
  return (
    <fieldset className="platform-field platform-field_variant_group">
      <legend className="platform-field__label">{legend}</legend>
      <div className="platform-field__control">{children}</div>
      {hint && <span className="platform-field__hint">{hint}</span>}
    </fieldset>
  );
}
