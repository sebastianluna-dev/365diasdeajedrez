interface ChevronIconProps {
  className?: string;
}

/**
 * The short chevron, pointing right; its callers turn it for what opens and
 * closes (the select, the date picker, the engine panel, the site's dropdown).
 * Font Awesome's `angle-right`, Duotone Light.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ChevronIcon({ className }: ChevronIconProps) {
  return (
    <svg
      className={className}
      viewBox="-213.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M235.3 244.7c6.2 6.2 6.2 16.4 0 22.6l-160 160c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6L201.4 256 52.7 107.3c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0l160 160z" />
    </svg>
  );
}
