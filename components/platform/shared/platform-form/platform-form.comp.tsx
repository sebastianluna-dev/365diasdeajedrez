"use client";

import type { ComponentProps, ReactElement } from "react";
import { Form } from "radix-ui";
import "./platform-form.comp.css";

/** The validity states a message can answer to, straight from `ValidityState`. */
export type PlatformFormMatcher =
  | "badInput"
  | "patternMismatch"
  | "rangeOverflow"
  | "rangeUnderflow"
  | "stepMismatch"
  | "tooLong"
  | "tooShort"
  | "typeMismatch"
  | "valueMissing";

export type PlatformFormMessages = Partial<Record<PlatformFormMatcher, string>>;

// What a field says when nothing more specific was given. `required` is the
// one constraint nearly every field has, so it always has words.
const DEFAULT_MESSAGES: PlatformFormMessages = {
  valueMissing: "Este campo es obligatorio.",
  tooLong: "Es demasiado largo.",
  tooShort: "Es demasiado corto.",
  typeMismatch: "Revisa el formato.",
  patternMismatch: "Revisa el formato.",
};

type PlatformFormProps = ComponentProps<typeof Form.Root>;

/**
 * The platform's form, on Radix's `Form` primitive. A plain `<form>` for all
 * purposes — `action={serverAction}` works as before — with one difference:
 * when the browser finds a field invalid on submit, the primitive swallows the
 * native bubble and the field shows its own message instead. Submission is
 * still blocked by the browser, so an `onSubmit` handler only ever runs with a
 * valid form.
 */
export function PlatformForm({ className, ...rest }: PlatformFormProps) {
  return <Form.Root className={className ? `platform-form ${className}` : "platform-form"} {...rest} />;
}

interface PlatformFormFieldProps {
  /** The field's name in the submitted `FormData`. */
  name: string;
  label: string;
  /**
   * The control, as a single element: a native `input`/`textarea`, or a
   * `PlatformSelect`. It receives `id` and `name` from the field, so it must
   * not set them itself, and the label reaches it through that `id`.
   */
  children: ReactElement;
  /** Small help text under the control. */
  hint?: string;
  /** Text per validity state; merged over the Spanish defaults. */
  messages?: PlatformFormMessages;
  /** A failure the server reported for this field, shown as its message. */
  serverError?: string;
}

/**
 * One field: label, control and the messages that answer the control's
 * validity. Invalid state is a `data-invalid` attribute on the field, which
 * the stylesheet reads; nothing is tracked by hand.
 */
export function PlatformFormField({ name, label, children, hint, messages, serverError }: PlatformFormFieldProps) {
  const allMessages = { ...DEFAULT_MESSAGES, ...messages };

  return (
    <Form.Field name={name} className="platform-form__field" serverInvalid={Boolean(serverError)}>
      <Form.Label className="platform-form__label">{label}</Form.Label>
      <Form.Control asChild>{children}</Form.Control>
      {hint && <span className="platform-form__hint">{hint}</span>}
      {(Object.entries(allMessages) as [PlatformFormMatcher, string][]).map(([match, text]) => (
        <Form.Message key={match} match={match} className="platform-form__message">
          {text}
        </Form.Message>
      ))}
      {serverError && (
        <Form.Message forceMatch className="platform-form__message">
          {serverError}
        </Form.Message>
      )}
    </Form.Field>
  );
}
