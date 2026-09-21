import { randomBytes, scrypt as scryptCallback, timingSafeEqual, type ScryptOptions } from "node:crypto";
import { logWarning } from "@/lib/logger";
import { promisify } from "node:util";

// Password hashing with scrypt (Node's `crypto` module, no dependencies).
//
// It deliberately does NOT import "server-only": the administration scripts
// (scripts/platform-user.ts) and the seed run outside Next, with tsx, and that
// package throws when the `react-server` condition is absent.
//
// Format of the stored hash, with the parameters inside:
//   scrypt$<N>$<r>$<p>$<saltHex>$<keyHex>
// Storing them makes it possible to raise the cost later without invalidating
// the old hashes: each one is verified with the parameters it was created with.

// promisify picks the overload without `options`; it is re-annotated so the
// cost parameters can be passed.
const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: ScryptOptions,
) => Promise<Buffer>;

/** Current cost. 2^15 · 8 · 1 ≈ 33 MB and ~60 ms per verification. */
const SCRYPT_N = 32768;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;
/** Node's default limit (32 MB) falls short for 128·N·r. */
const MAX_MEM = 128 * 1024 * 1024;

export const PASSWORD_MIN_LENGTH = 8;
/** Defensive ceiling: scrypt works over the whole password. */
export const PASSWORD_MAX_LENGTH = 200;

async function derive(password: string, salt: Buffer, n: number, r: number, p: number): Promise<Buffer> {
  return scrypt(password.normalize("NFKC"), salt, KEY_LENGTH, { N: n, r, p, maxmem: MAX_MEM });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const key = await derive(password, salt, SCRYPT_N, SCRYPT_R, SCRYPT_P);
  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt.toString("hex")}$${key.toString("hex")}`;
}

/**
 * Checks the password against a stored hash. The comparison is constant-time; a
 * hash with an unknown format returns false instead of throwing, so a corrupt
 * row does not bring the login down.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const parts = storedHash.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;

  const [, rawN, rawR, rawP, saltHex, keyHex] = parts;
  if (saltHex === undefined || keyHex === undefined) return false;
  const n = Number(rawN);
  const r = Number(rawR);
  const p = Number(rawP);
  if (!Number.isInteger(n) || !Number.isInteger(r) || !Number.isInteger(p)) return false;

  let expected: Buffer;
  try {
    expected = Buffer.from(keyHex, "hex");
    const actual = await derive(password, Buffer.from(saltHex, "hex"), n, r, p);
    if (actual.length !== expected.length) return false;
    return timingSafeEqual(actual, expected);
  } catch (error) {
    // A stored hash that cannot be read is not a password error: it is corrupt
    // data, and it is worth knowing about.
    logWarning("password", "Hash almacenado ilegible; se rechaza la contraseña", { error: String(error) });
    return false;
  }
}

/**
 * Throwaway hash to spend the same time when the email does not exist or the
 * account has no credential: without this, an attacker tells enrolled emails
 * apart by how fast the login responds.
 */
export const DUMMY_PASSWORD_HASH = `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${"00".repeat(SALT_LENGTH)}$${"00".repeat(KEY_LENGTH)}`;

/** Reason why a password is not acceptable, or null when it is. */
export function passwordProblem(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`;
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return `La contraseña no puede pasar de ${PASSWORD_MAX_LENGTH} caracteres.`;
  }
  return null;
}
