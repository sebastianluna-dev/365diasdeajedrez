import { buildWhatsappUrl } from "@/lib/build-whatsapp-url";

// How a student or a teacher writes to the academy from the platform (D9):
// the WhatsApp number, the same one the CMS holds for the site. A constant
// and not a read of Payload, so no page of the platform opens the CMS's
// database; the duplication is noted in IMPROVEMENTS.

/** The academy's WhatsApp, in international format without «+» (what wa.me takes). */
export const ACADEMY_WHATSAPP_NUMBER = "522291348338";

/** A wa.me link to the academy with a message already written. */
export function academyWhatsappHref(message: string): string {
  return buildWhatsappUrl(ACADEMY_WHATSAPP_NUMBER, message);
}
