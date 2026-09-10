import { randomBytes, scrypt as scryptCallback, timingSafeEqual, type ScryptOptions } from "node:crypto";
import { logWarning } from "@/lib/logger";
import { promisify } from "node:util";

// Hash de contraseñas con scrypt (módulo `crypto` de Node, sin dependencias).
//
// Deliberadamente NO importa "server-only": los scripts de administración
// (scripts/platform-user.ts) y el seed corren fuera de Next, con tsx, y ese
// paquete lanza cuando no está la condición `react-server`.
//
// Formato del hash almacenado, con los parámetros dentro:
//   scrypt$<N>$<r>$<p>$<saltHex>$<claveHex>
// Guardarlos permite subir el coste más adelante sin invalidar los hashes
// antiguos: cada uno se verifica con los parámetros con los que se creó.

// promisify escoge la sobrecarga sin `options`; se reanota para poder pasar los
// parámetros de coste.
const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: ScryptOptions,
) => Promise<Buffer>;

/** Coste actual. 2^15 · 8 · 1 ≈ 33 MB y ~60 ms por verificación. */
const SCRYPT_N = 32768;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;
/** El límite por defecto de Node (32 MB) se queda corto para 128·N·r. */
const MAX_MEM = 128 * 1024 * 1024;

export const PASSWORD_MIN_LENGTH = 8;
/** Techo defensivo: scrypt trabaja sobre la contraseña entera. */
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
 * Comprueba la contraseña contra un hash almacenado. La comparación es de
 * tiempo constante; un hash con formato desconocido devuelve false en vez de
 * lanzar, para que una fila corrupta no tumbe el login.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const parts = storedHash.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;

  const [, rawN, rawR, rawP, saltHex, keyHex] = parts;
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
    // Un hash guardado que no se puede leer no es un error de contraseña: es
    // un dato corrupto, y conviene saberlo.
    logWarning("password", "Hash almacenado ilegible; se rechaza la contraseña", { error: String(error) });
    return false;
  }
}

/**
 * Hash de descarte para gastar el mismo tiempo cuando el email no existe o la
 * cuenta no tiene credencial: sin esto, un atacante distingue emails dados de
 * alta por lo rápido que responde el login.
 */
export const DUMMY_PASSWORD_HASH = `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${"00".repeat(SALT_LENGTH)}$${"00".repeat(KEY_LENGTH)}`;

/** Motivo por el que una contraseña no sirve, o null si es aceptable. */
export function passwordProblem(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`;
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return `La contraseña no puede pasar de ${PASSWORD_MAX_LENGTH} caracteres.`;
  }
  return null;
}
