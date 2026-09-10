import "server-only";

// Reading `FormData` in the server actions. Everything that arrives from a form
// is unvalidated text (and the action is reachable by direct POST, without
// going through the interface), so every field is read and bounded here instead
// of repeating the same `typeof value === "string"` in each action.

/** Trimmed text; an empty string when the field did not come or is not text. */
export function readText(formData: FormData, field: string): string {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

/** Bounded text, or null when it is empty (for optional columns). */
export function readOptionalText(formData: FormData, field: string, maxLength: number): string | null {
  const value = readText(formData, field);
  return value.length > 0 ? value.slice(0, maxLength) : null;
}

/**
 * A valid http(s) URL, or null. Other schemes are rejected on purpose:
 * `javascript:` and `data:` would end up in an href rendered on the student's page.
 */
export function readUrl(formData: FormData, field: string): string | null {
  const value = readText(formData, field);
  if (value.length === 0) return null;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

/** Integer within [min, max], or null when it is not a valid number. */
export function readClampedInt(formData: FormData, field: string, min: number, max: number): number | null {
  const value = readText(formData, field);
  if (!/^-?\d+$/.test(value)) return null;
  const parsed = Number.parseInt(value, 10);
  return parsed >= min && parsed <= max ? parsed : null;
}

/** true only when the checkbox came ticked. */
export function readBoolean(formData: FormData, field: string): boolean {
  return formData.get(field) !== null;
}
