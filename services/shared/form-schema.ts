// Declarative reading of `FormData` in the server actions.
//
// An action is reachable by direct POST, so everything it receives is untrusted
// text. Instead of reading field by field, the action declares a zod schema of
// what it expects and `parseForm` answers with the typed values or with `null`,
// which the action turns into its `?error=invalid`. The field helpers below are
// the vocabulary: bounded text, an http(s) URL, a bounded integer, a checkbox.
//
// No "server-only": the tests import it and there is nothing here to protect.

import { z } from "zod";

/**
 * Text whose line breaks are one character each, as the browser counts them.
 * A textarea measures its `maxLength` on a value with LF line breaks, but a
 * form sends them as CRLF, so the same text arrived one character longer per
 * line break and a limit the browser allowed was refused here. What is stored
 * has LF line breaks. `overwrite` runs before the checks added after it, so
 * `trim` and `max` see the normalised text.
 */
function textLines() {
  return z.string().overwrite((value) => value.replace(/\r\n?/g, "\n"));
}

/** Non-empty trimmed text of at most `maxLength` characters. */
export function formText(maxLength: number) {
  return textLines().trim().min(1).max(maxLength);
}

/** Trimmed text of at most `maxLength` characters, or null when it is empty (an optional column). */
export function formOptionalText(maxLength: number) {
  return textLines()
    .trim()
    .max(maxLength)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null));
}

/**
 * An http(s) URL, or null when empty. Other schemes are rejected on purpose:
 * `javascript:` and `data:` would end up in an href on the student's page.
 */
export function formOptionalUrl(maxLength = 500) {
  return z
    .string()
    .trim()
    .max(maxLength)
    .optional()
    .transform((value, context) => {
      if (!value) return null;
      try {
        const url = new URL(value);
        if (url.protocol === "http:" || url.protocol === "https:") return url.toString();
      } catch {
        // Falls through to the issue below.
      }
      context.addIssue({ code: "custom", message: "Se esperaba una URL http(s)." });
      return z.NEVER;
    });
}

/** An integer within [min, max]. */
export function formInt(min: number, max: number) {
  return z
    .string()
    .trim()
    .regex(/^-?\d+$/)
    .transform((value) => Number.parseInt(value, 10))
    .pipe(z.number().int().min(min).max(max));
}

/** true only when the checkbox came ticked (an unticked one sends nothing). */
export function formCheckbox() {
  return z
    .string()
    .optional()
    .transform((value) => value !== undefined);
}

/**
 * Bounded text that keeps the difference between ABSENT and EMPTY: `undefined`
 * when the form did not bring the field, `null` when it brought it empty. For
 * the forms that rewrite a whole record, where absent means "do not touch it".
 */
export function formTextIfPresent(maxLength: number) {
  return textLines()
    .trim()
    .max(maxLength)
    .optional()
    .transform((value) => (value === undefined ? undefined : value.length > 0 ? value : null));
}

/**
 * The ids the small forms carry, a hidden field each ("blockId", "studentId"…):
 * bounded text, absent reads as "" so the lookup that follows simply finds nothing.
 */
export function readIds<const K extends readonly string[]>(formData: FormData, ...keys: K): Record<K[number], string> {
  const shape = Object.fromEntries(
    keys.map((key) => [
      key,
      z
        .string()
        .trim()
        .max(64)
        .optional()
        .transform((value) => value ?? ""),
    ]),
  );
  const parsed = parseForm(z.object(shape), formData);
  const empty = Object.fromEntries(keys.map((key) => [key, ""])) as Record<K[number], string>;
  return parsed.ok ? (parsed.data as Record<K[number], string>) : empty;
}

/** An integer within [min, max], or null when the field is empty or not a valid number (a lenient optional column). */
export function formLenientInt(min: number, max: number) {
  return z
    .string()
    .trim()
    .optional()
    .transform((value) => {
      if (!value || !/^-?\d+$/.test(value)) return null;
      const parsed = Number.parseInt(value, 10);
      return parsed >= min && parsed <= max ? parsed : null;
    });
}

/**
 * Every value of a checkbox group whose options are identified by slug and
 * not by a code the constants list: bounded text, at most `maxItems` of them,
 * and the write skips the ones the catalog does not have.
 * A bare array schema, like `formCodeList`, so `parseForm` reads it with `getAll`.
 */
export function formSlugList(maxItems = 50) {
  return z.array(z.string().trim().min(1).max(80)).max(maxItems);
}

/** The `returnTo` hidden field: a path the action still has to pass through `safeReturnTo`. */
export function formReturnTo() {
  return z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((value) => value ?? "");
}

/** An email the way the platform stores it: lower case, bounded, with the shape every account has. */
export function formEmail() {
  return z
    .string()
    .trim()
    .toLowerCase()
    .max(254)
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
}

/** One of the given codes (a catalog value chosen in a `<select>`). */
export function formCode<const T extends readonly [string, ...string[]]>(codes: T) {
  return z.enum(codes);
}

/** Whether `value` is one of the catalog's codes, for a refine over free text. */
export function isCatalogCode(value: string, codes: readonly string[]): boolean {
  return codes.includes(value);
}

/**
 * Every value of a checkbox group, each one of the given codes, at least
 * `min` of them. It stays a bare array schema on purpose: `parseForm` only
 * reads a field with `getAll` when its schema IS an array, and a `transform`
 * on top would hide that. Duplicates are the caller's to collapse.
 */
export function formCodeList(codes: readonly string[], min = 0) {
  return z
    .array(
      z
        .string()
        .trim()
        .max(64)
        .refine((value) => isCatalogCode(value, codes)),
    )
    .min(min);
}

type FieldSchema = z.ZodType;

/** Whether the field takes every value of the name (`getAll`) or only the first. */
function takesMany(field: FieldSchema): boolean {
  let current: unknown = field;
  while (current instanceof z.ZodOptional || current instanceof z.ZodDefault || current instanceof z.ZodNullable) {
    current = current.unwrap();
  }
  return current instanceof z.ZodArray;
}

/** What `parseForm` answers: the typed values, or which field failed and how. */
export type FormParse<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      /** Name of the first field that failed ("" when the failure has no path). */
      field: string;
      /** zod's issue code: "too_small", "too_big", "invalid_format", "custom"… */
      code: string;
    };

/**
 * Reads exactly the fields the schema declares — a text field takes the first
 * value, an array field every value of that name — and validates them. Files
 * and other non-text values are read as absent. On failure it names the first
 * field and the kind of failure, so the action can answer with the error code
 * its page already knows ("email", "pgnTooLong"…) instead of a generic one.
 */
export function parseForm<S extends z.ZodObject>(schema: S, formData: FormData): FormParse<z.output<S>> {
  const values: Record<string, string | string[] | undefined> = {};
  for (const [name, field] of Object.entries(schema.shape)) {
    if (takesMany(field as FieldSchema)) {
      values[name] = formData.getAll(name).filter((value): value is string => typeof value === "string");
    } else {
      const value = formData.get(name);
      values[name] = typeof value === "string" ? value : undefined;
    }
  }
  const result = schema.safeParse(values);
  if (result.success) return { ok: true, data: result.data };
  const issue = result.error.issues[0];
  return { ok: false, field: String(issue?.path[0] ?? ""), code: issue?.code ?? "custom" };
}
