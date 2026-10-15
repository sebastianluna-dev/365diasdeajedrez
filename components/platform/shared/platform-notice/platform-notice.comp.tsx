import "./platform-notice.comp.css";

export type PlatformNoticeVariant = "error" | "success" | "info" | "warning";

interface PlatformNoticeProps {
  message: string;
  variant?: PlatformNoticeVariant;
}

/** How a screen reader hears each tone: an error interrupts, news waits its turn, a warning is read where it is. */
const ROLES: Record<PlatformNoticeVariant, "alert" | "status" | undefined> = {
  error: "alert",
  success: "status",
  info: "status",
  warning: undefined,
};

/**
 * Notice with the result of an action, or a warning about the page. Platform
 * forms are `<form action={serverAction}>` and return the failure by redirect
 * with `?error=<code>`, and since 2026-10-15 a success with `?aviso=<code>`;
 * the page translates the code with its message map and renders it here.
 * `role="alert"` on an error so a screen reader announces it on return;
 * `status` on a success or a piece of information; nothing on a warning,
 * which is part of the page («Sin zona horaria configurada: …»).
 */
export function PlatformNotice({ message, variant = "error" }: PlatformNoticeProps) {
  return (
    <p className={`platform-notice platform-notice_variant_${variant}`} role={ROLES[variant]}>
      {message}
    </p>
  );
}
