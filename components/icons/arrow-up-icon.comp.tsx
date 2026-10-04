interface ArrowUpIconProps {
  className?: string;
}

/**
 * Up: promoting a variation in the move menu and, turned 45°, the way out to
 * the public site in the user menu. Font Awesome's `arrow-up`, Duotone Light.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ArrowUpIcon({ className }: ArrowUpIconProps) {
  return (
    <svg
      className={className}
      viewBox="-149.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M181.2 4.7c6.2-6.2 16.4-6.2 22.6 0l176 176c6.2 6.2 6.2 16.4 0 22.6s-16.4 6.2-22.6 0L208.5 54.6 208.5 496c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-441.4-148.7 148.7c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l176-176z" />
    </svg>
  );
}
