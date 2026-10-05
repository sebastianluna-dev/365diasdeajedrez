import "./optional-mark.comp.css";

/** The word a field that may be left empty says: the one place it is written. */
export const OPTIONAL_MARK = "Opcional";

/**
 * «Opcional» in a thin pill, right after a field's label. The field pieces
 * draw it themselves — `PlatformFormField` and `FormField` when their control
 * has no `required` (`isOptionalControl`), `PlatformFormGroup` and
 * `FormFieldset` when they are told `optional` —, so no caller writes it.
 *
 * Only for the eye (`aria-hidden`): what a screen reader needs it already
 * has, since a required control is announced as such and an optional one is
 * not, and the word inside a `<label>` would change the field's name.
 */
export function OptionalMark() {
  return (
    <span className="optional-mark" aria-hidden="true">
      {OPTIONAL_MARK}
    </span>
  );
}
