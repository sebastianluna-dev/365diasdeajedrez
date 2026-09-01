import { randomInt } from "node:crypto";

// Identificadores numéricos para las URLs del alumno: `/cursos/00020212/1`.
//
// Ocho dígitos con ceros a la izquierda, así que son 100 millones de valores.
// Aleatorios y no correlativos a propósito: numerarlos en orden dejaría contar
// cuánto contenido hay publicado y recorrerlo entero probando números seguidos.
//
// Van como CLAVE PRIMARIA, no como una segunda columna, para no tener dos
// identificadores del mismo curso que haya que mantener sincronizados. Por eso
// siguen siendo `String`: cambiar la columna a entero obligaría a migrar el tipo
// de todas las claves foráneas que apuntan a ella, y el cero a la izquierda de
// «00020212» se perdería.

export const NUMERIC_ID_DIGITS = 8;

/** Un identificador nuevo. La unicidad la garantiza la clave primaria. */
export function numericId(digits: number = NUMERIC_ID_DIGITS): string {
  let id = "";
  for (let index = 0; index < digits; index++) id += String(randomInt(10));
  return id;
}

/** ¿Tiene la forma de un identificador de la zona del alumno? */
export function isNumericId(value: string): boolean {
  return value.length === NUMERIC_ID_DIGITS && /^\d+$/.test(value);
}
