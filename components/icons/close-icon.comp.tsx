interface CloseIconProps {
  className?: string;
}

/**
 * Closing: the staff's dialogs, the new study's, and the site's mobile menu
 * while it is open. Font Awesome's `xmark`, Duotone Light.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function CloseIcon({ className }: CloseIconProps) {
  return (
    <svg
      className={className}
      viewBox="-149.33 -85.33 682.67 682.67"
      width="20"
      height="20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M379.3 91.3c6.2-6.2 6.2-16.4 0-22.6s-16.4-6.2-22.6 0L192 233.4 27.3 68.7c-6.2-6.2-16.4-6.2-22.6 0s-6.2 16.4 0 22.6L169.4 256 4.7 420.7c-6.2 6.2-6.2 16.4 0 22.6s16.4 6.2 22.6 0L192 278.6 356.7 443.3c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6L214.6 256 379.3 91.3z" />
    </svg>
  );
}
