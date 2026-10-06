"use client";

import {
  cloneElement,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentProps,
  type MouseEvent,
  type ReactElement,
} from "react";
import { Form } from "radix-ui";
import { isOptionalControl } from "@/components/platform/shared/optional-mark/optional-control";
import { OptionalMark } from "@/components/platform/shared/optional-mark/optional-mark.comp";
import { PlatformInfoTip } from "@/components/platform/shared/platform-info-tip/platform-info-tip.comp";
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
  /**
   * A clarification folded into an "i" inside the control (`PlatformInfoTip`):
   * for what helps the first time and is a line of small print every time
   * after. On a text input it sits at the right end; a textarea gets a strip
   * under its text, inside the same frame, with the "i" at its right and how
   * many characters are written of its `maxLength` at its left. A select has
   * its own mark at its end and takes none.
   */
  info?: string;
  /** Text per validity state; merged over the Spanish defaults. */
  messages?: PlatformFormMessages;
  /** A failure the server reported for this field, shown as its message. */
  serverError?: string;
}

/**
 * One field: label, control and the messages that answer the control's
 * validity. Invalid state is a `data-invalid` attribute on the field, which
 * the stylesheet reads; nothing is tracked by hand.
 *
 * A control one can leave empty and that has no `required` — a textarea, an
 * input one types into — gets «Opcional» beside the label (`OptionalMark`),
 * read from the control itself, so the mark and the validation cannot
 * disagree and no caller writes the word. Selects and cards get none: they
 * always show their choice.
 */
export function PlatformFormField({
  name,
  label,
  children,
  hint,
  info,
  messages,
  serverError,
}: PlatformFormFieldProps) {
  const allMessages = { ...DEFAULT_MESSAGES, ...messages };
  // A textarea's "i" goes in a strip under its text; an input's, over its end.
  const framed = Boolean(info) && children.type === "textarea";

  return (
    <Form.Field
      name={name}
      className={info && !framed ? "platform-form__field platform-form__field_with_info" : "platform-form__field"}
      serverInvalid={Boolean(serverError)}
    >
      <div className="platform-form__label-row">
        <Form.Label className="platform-form__label">{label}</Form.Label>
        {isOptionalControl(children) && <OptionalMark />}
      </div>
      {info && framed ? (
        <TextareaFrame label={label} info={info}>
          {children}
        </TextareaFrame>
      ) : (
        <Form.Control asChild>{children}</Form.Control>
      )}
      {/* After the control, and outside the label, so neither the label nor
          the control takes the button's name; the stylesheet puts it over the
          control's right end. */}
      {info && !framed && (
        <span className="platform-form__info">
          <PlatformInfoTip label={`Sobre «${label}»`} text={info} />
        </span>
      )}
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

interface TextareaFrameProps {
  label: string;
  info: string;
  /** The `<textarea>` itself, whose saved value and limit the count reads. */
  children: ReactElement;
}

/**
 * A textarea with an "i": the field's border moves to a frame that holds the
 * text and, under it, a strip with the count of what is written and the "i",
 * as a message composer has them. The textarea grows with its text instead of
 * having a handle, where the browser can (`field-sizing`).
 *
 * The count is read from the textarea as it is typed in, and from its saved
 * value when the form resets or a new value remounts it.
 */
function TextareaFrame({ label, info, children }: TextareaFrameProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const { defaultValue, maxLength } = children.props as { defaultValue?: unknown; maxLength?: number };
  const saved = String(defaultValue ?? "");
  const [count, setCount] = useState(saved.length);
  // A caller that keys the textarea by its saved value remounts it with that
  // value after a save: the count starts from it again, while rendering.
  const [countedFrom, setCountedFrom] = useState(saved);
  if (countedFrom !== saved) {
    setCountedFrom(saved);
    setCount(saved.length);
  }

  // A form that resets puts the textarea back to its saved value AFTER the
  // event, so it is read on the next task.
  useEffect(() => {
    const textarea = frameRef.current?.querySelector("textarea");
    const form = textarea?.form;
    if (!textarea || !form) return;
    const recount = () => window.setTimeout(() => setCount(textarea.value.length));
    form.addEventListener("reset", recount);
    return () => form.removeEventListener("reset", recount);
  }, []);

  // The strip is part of the box one writes in: a press on its blank part
  // goes to the text, as a press under the last line does. The "i" keeps its own.
  const focusText = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as Element).closest("button")) return;
    event.preventDefault();
    frameRef.current?.querySelector("textarea")?.focus();
  };

  return (
    <div
      ref={frameRef}
      className="platform-form__frame"
      onInput={(event) => {
        if (event.target instanceof HTMLTextAreaElement) setCount(event.target.value.length);
      }}
    >
      <Form.Control asChild>{children}</Form.Control>
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions -- not a control: a press on the strip's blank part only hands the focus to the textarea, which the keyboard reaches by itself */}
      <div className="platform-form__strip" onMouseDown={focusText}>
        {maxLength !== undefined && (
          <span className="platform-form__count">
            <span aria-hidden="true">
              {count} / {maxLength}
            </span>
            <span className="platform-form__sr">
              {count} de {maxLength} caracteres
            </span>
          </span>
        )}
        <span className="platform-form__info">
          <PlatformInfoTip label={`Sobre «${label}»`} text={info} />
        </span>
      </div>
    </div>
  );
}

interface PlatformFormGroupProps {
  label: string;
  /**
   * The group may be left with nothing chosen (a set of check cards with no
   * minimum): it gets «Opcional» beside its label. Said here because a group
   * has no `required` to read.
   */
  optional?: boolean;
  /** The group control (`PlatformChoiceCards`, a set of checkboxes…): it is told which element names it. */
  children: ReactElement<{ "aria-labelledby"?: string }>;
  hint?: string;
}

/**
 * A field whose control is a group, not one element: a `<label>` cannot name
 * a radio group, so the label is plain text and the control is pointed at it
 * with `aria-labelledby`. Same look as a field; no validity messages, because
 * a group with a default is never invalid.
 */
export function PlatformFormGroup({ label, optional = false, children, hint }: PlatformFormGroupProps) {
  const labelId = useId();

  return (
    <div role="group" aria-labelledby={labelId} className="platform-form__field">
      <div className="platform-form__label-row">
        <span id={labelId} className="platform-form__label">
          {label}
        </span>
        {optional && <OptionalMark />}
      </div>
      {cloneElement(children, { "aria-labelledby": labelId })}
      {hint && <span className="platform-form__hint">{hint}</span>}
    </div>
  );
}
