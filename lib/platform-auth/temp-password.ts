import { randomBytes } from "node:crypto";

// Temporary password for the account creations and resets the staff performs.
//
// The platform has no mail service, so there is no activation link: the staff
// generates this password, hands it to the person through whatever channel
// fits, and they change it. It is shown ONCE and is never stored in the clear
// anywhere.
//
// Without "server-only" on purpose: `scripts/platform-user.ts` runs outside Next.

/** 9 random bytes in base64url ⇒ 12 characters, 72 bits of entropy. */
const TEMP_PASSWORD_BYTES = 9;

export const TEMP_PASSWORD_LENGTH = 12;

export function generateTempPassword(): string {
  return randomBytes(TEMP_PASSWORD_BYTES).toString("base64url");
}
