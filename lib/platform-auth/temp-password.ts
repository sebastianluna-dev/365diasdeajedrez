import { randomBytes } from "node:crypto";

// Contraseña temporal para las altas y los reinicios que hace el staff.
//
// La plataforma no tiene servicio de correo, así que no hay enlace de
// activación: el staff genera esta contraseña, se la entrega a la persona por
// el canal que corresponda y ella la cambia. Se muestra UNA sola vez y no se
// guarda en claro en ninguna parte.
//
// Sin "server-only" a propósito: `scripts/platform-user.ts` corre fuera de Next.

/** 9 bytes aleatorios en base64url ⇒ 12 caracteres, 72 bits de entropía. */
const TEMP_PASSWORD_BYTES = 9;

export const TEMP_PASSWORD_LENGTH = 12;

export function generateTempPassword(): string {
  return randomBytes(TEMP_PASSWORD_BYTES).toString("base64url");
}
