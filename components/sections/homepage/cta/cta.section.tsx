import { buildWhatsappUrl } from "@/lib/build-whatsapp-url";
import { getSiteSettingsData } from "@/services/site-settings/site-settings.service";
import { CtaInteractive } from "./cta-interactive.comp";

export async function CtaSection() {
  const { whatsappNumber, whatsappDefaultMessage } = await getSiteSettingsData();
  const whatsappUrl = buildWhatsappUrl(whatsappNumber, whatsappDefaultMessage);

  return <CtaInteractive whatsappUrl={whatsappUrl} />;
}
