interface MoreIconProps {
  className?: string;
}

/**
 * The three dots that open what else can be done to a row. Its `viewBox` is
 * cut close around the dots, because its callers draw it in a 16×4 box. Font
 * Awesome's `ellipsis`, Duotone Light.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function MoreIcon({ className }: MoreIconProps) {
  return (
    <svg className={className} viewBox="0 200 448 112" width="16" height="4" fill="currentColor" aria-hidden="true">
      <path d="M448 256a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zm-192 0a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zM32 288a32 32 0 1 1 0-64 32 32 0 1 1 0 64z" />
    </svg>
  );
}
