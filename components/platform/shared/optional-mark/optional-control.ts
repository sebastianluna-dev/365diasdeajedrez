import { isValidElement, type ReactNode } from "react";

// Whether a field's control may be left empty, read from the control itself.
//
// A field says «Opcional» when its control has no `required`, so the mark and
// the validation cannot contradict each other: nobody writes the word. Only a
// control one can leave EMPTY gets it — a textarea and an input one types into.
// A search box is a query, not a datum; a checkbox, a radio or a hidden input
// is never "empty"; and a select or a set of cards always shows its choice in
// words («Sin título», «Sin plataforma»), so they say nothing.
//
// Only the element's string type and its props are read. A component's
// identity is not compared: an element of a Client Component created on the
// server reaches the client wrapped, so `type === PlatformDatePicker` would
// hold on one side and not the other — and importing the picker here would
// ship it to every page that renders a field.

/** The input types one types a value into, and so can leave empty. */
const EMPTYABLE_INPUTS = new Set([
  "text",
  "email",
  "password",
  "url",
  "tel",
  "number",
  "date",
  "datetime-local",
  "time",
  "month",
  "week",
]);

/** True for a `<textarea>` or a typed `<input>` without `required`: the field gets «Opcional». */
export function isOptionalControl(control: ReactNode): boolean {
  if (!isValidElement<{ required?: unknown; type?: unknown }>(control)) return false;
  if (control.props.required) return false;
  if (control.type === "textarea") return true;
  return control.type === "input" && EMPTYABLE_INPUTS.has(String(control.props.type ?? "text"));
}
