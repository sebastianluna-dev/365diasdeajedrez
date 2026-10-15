// The state a form in a popup gets back from its action (`useActionState`):
// where it went wrong, field by field, or that it went well and what to say.
//
// React resets a `<form action>` when the action settles, also when it
// returned an error, so an action that fails hands back what was sent
// (`values`, read with `readFormValues`), and each field opens again with it.
// Pure module, no "server-only": the actions, the popups and the tests share
// it.

export interface FieldError {
  /** A code of `CLASS_FIELD_ERRORS`, or of the page's own map. */
  code: string;
  args?: Record<string, string | number>;
}

export interface PopupFormState {
  status: "idle" | "error" | "done";
  fieldErrors?: Record<string, FieldError>;
  /** A failure that belongs to no field: the class changed meanwhile, too many attempts. */
  formError?: FieldError;
  /** On "error": what was sent, so each field opens with it again after React resets the form. */
  values?: Record<string, string | string[]>;
  /** On "done": the notice for `withNoticeParam`. */
  notice?: { code: string; args?: (number | string)[] };
}

export const POPUP_FORM_IDLE: PopupFormState = { status: "idle" };

/**
 * What a form sent, by name, for the fields to open with it again: a string
 * per name, or the list when the name was sent more than once (a set of
 * check cards). Never a password: the caller names the fields it wants back.
 */
export function readFormValues(formData: FormData, names: readonly string[]): Record<string, string | string[]> {
  const values: Record<string, string | string[]> = {};
  for (const name of names) {
    const all = formData.getAll(name).filter((value): value is string => typeof value === "string");
    if (all.length === 0) continue;
    values[name] = all.length === 1 ? (all[0] ?? "") : all;
  }
  return values;
}

/** A state that says what went wrong, with what was sent. */
export function popupFormError(
  fieldErrors: Record<string, FieldError>,
  values?: Record<string, string | string[]>,
  formError?: FieldError,
): PopupFormState {
  return { status: "error", fieldErrors, ...(formError ? { formError } : {}), ...(values ? { values } : {}) };
}

/** A state that says it went well, with the notice to show. */
export function popupFormDone(code: string, args?: (number | string)[]): PopupFormState {
  return { status: "done", notice: { code, ...(args ? { args } : {}) } };
}
