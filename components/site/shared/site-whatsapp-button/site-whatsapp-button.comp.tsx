import { CalendarIcon } from "@/components/icons/calendar-icon.comp";
import { WhatsappIcon } from "@/components/icons/whatsapp-icon.comp";
import { mdButton, type MaterialButtonColor, type MaterialSize } from "@/lib/material/material-classes";
import { getWhatsappHref } from "@/services/site-settings/site-settings.service";

interface SiteWhatsappButtonProps {
  /** What the button says. */
  label: string;
  /** The message the chat opens with; the CMS's default message when it is left out. */
  message?: string;
  /** Material's button: `filled` the page's main action, `tonal`, `outlined` or `text`. */
  color: MaterialButtonColor;
  /** Material's size: `sm` 40 px, `md` 56 px. */
  size?: MaterialSize;
  /** `calendar` for an action that books a class, `whatsapp` for one that asks something (the default). */
  icon?: "calendar" | "whatsapp";
  /** The caller's own block class, for where the button sits. */
  className?: string;
}

/**
 * A button of the site that opens the academy's WhatsApp with its message
 * already written, to the number the CMS holds (`site-settings`). There is no
 * form backend: asking for a class or for information is always this. It says
 * to a screen reader that it opens WhatsApp in another tab.
 */
export async function SiteWhatsappButton({
  label,
  message,
  color,
  size = "sm",
  icon = "whatsapp",
  className,
}: SiteWhatsappButtonProps) {
  const href = await getWhatsappHref(message);
  const Icon = icon === "calendar" ? CalendarIcon : WhatsappIcon;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`${mdButton(color, size)}${className ? ` ${className}` : ""}`}
    >
      <Icon className="site-md-icon" />
      {label}
      <span className="site-sr-only"> (abre WhatsApp en una pestaña nueva)</span>
    </a>
  );
}
