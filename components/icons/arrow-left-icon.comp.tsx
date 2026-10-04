interface ArrowLeftIconProps {
  className?: string;
}

/**
 * Back one move, in the game viewer. Font Awesome's `chevron-left`, Duotone
 * Light.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ArrowLeftIcon({ className }: ArrowLeftIconProps) {
  return (
    <svg
      className={className}
      viewBox="-181.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M4.7 267.3c-6.2-6.2-6.2-16.4 0-22.6l208-208c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6L38.6 256 235.3 452.7c6.2 6.2 6.2 16.4 0 22.6s-16.4 6.2-22.6 0l-208-208z" />
    </svg>
  );
}
