import "server-only";

// Lectura de `FormData` en las server actions. Todo lo que llega de un
// formulario es texto sin validar (y la action es alcanzable por POST directo,
// sin pasar por la interfaz), así que cada campo se lee y se acota aquí en
// lugar de repetir el mismo `typeof value === "string"` en cada action.

/** Texto recortado; cadena vacía si el campo no vino o no es texto. */
export function readText(formData: FormData, field: string): string {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

/** Texto acotado, o null cuando está vacío (para columnas opcionales). */
export function readOptionalText(formData: FormData, field: string, maxLength: number): string | null {
  const value = readText(formData, field);
  return value.length > 0 ? value.slice(0, maxLength) : null;
}

/**
 * URL http(s) válida, o null. Se rechazan otros esquemas a propósito:
 * `javascript:` y `data:` acabarían en un href pintado en la página del alumno.
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

/** Entero dentro de [min, max], o null si no es un número válido. */
export function readClampedInt(formData: FormData, field: string, min: number, max: number): number | null {
  const value = readText(formData, field);
  if (!/^-?\d+$/.test(value)) return null;
  const parsed = Number.parseInt(value, 10);
  return parsed >= min && parsed <= max ? parsed : null;
}

/** true sólo si el checkbox vino marcado. */
export function readBoolean(formData: FormData, field: string): boolean {
  return formData.get(field) !== null;
}
