import "./platform-notice.comp.css";

interface PlatformNoticeProps {
  message: string;
  variant?: "error" | "success" | "info";
}

/**
 * Notice with the result of an action. Platform forms are
 * `<form action={serverAction}>` and return the failure by redirect with
 * `?error=<code>`; the page translates the code with its message map and
 * renders it here. `role="alert"` so a screen reader announces it on return.
 */
export function PlatformNotice({ message, variant = "error" }: PlatformNoticeProps) {
  return (
    <p className={`platform-notice platform-notice_variant_${variant}`} role="alert">
      {message}
    </p>
  );
}
