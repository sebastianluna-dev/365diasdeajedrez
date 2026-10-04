interface ArrowRightIconProps {
  className?: string;
}

/**
 * Forward one move, in the game viewer; also the arrow after the site's call
 * to log in. Font Awesome's `chevron-right`, Duotone Light.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ArrowRightIcon({ className }: ArrowRightIconProps) {
  return (
    <svg
      className={className}
      viewBox="-181.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M315.3 244.7c6.2 6.2 6.2 16.4 0 22.6l-208 208c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6L281.4 256 84.7 59.3c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0l208 208z" />
    </svg>
  );
}
