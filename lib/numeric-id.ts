import { randomInt } from "node:crypto";

// Numeric identifiers for the student's URLs: `/cursos/00020212/1`.
//
// Eight digits with leading zeros, so 100 million values. Random and not
// sequential on purpose: numbering them in order would let anyone count how
// much content is published and walk through it all by trying consecutive numbers.
//
// They go as the PRIMARY KEY, not as a second column, so as not to have two
// identifiers of the same course to keep in sync. That is why they are still
// `String`: changing the column to an integer would force migrating the type of
// every foreign key pointing at it, and the leading zero of "00020212" would be lost.

const NUMERIC_ID_DIGITS = 8;

/** A new identifier. Uniqueness is guaranteed by the primary key. */
export function numericId(digits: number = NUMERIC_ID_DIGITS): string {
  let id = "";
  for (let index = 0; index < digits; index++) id += String(randomInt(10));
  return id;
}
