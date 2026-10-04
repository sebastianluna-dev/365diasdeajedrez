interface PauseIconProps {
  className?: string;
}

/**
 * Pausing the board's autoplay and the site's reviews. Font Awesome's `pause`,
 * Duotone Solid. Its Duotone Solid drawing is one layer, the one at the back,
 * drawn here at full strength: at 40 % it would read as switched off.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function PauseIcon({ className }: PauseIconProps) {
  return (
    <svg
      className={className}
      viewBox="-149.33 -85.33 682.67 682.67"
      width="19"
      height="22"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M48 32C21.5 32 0 53.5 0 80L0 432c0 26.5 21.5 48 48 48l64 0c26.5 0 48-21.5 48-48l0-352c0-26.5-21.5-48-48-48L48 32zm224 0c-26.5 0-48 21.5-48 48l0 352c0 26.5 21.5 48 48 48l64 0c26.5 0 48-21.5 48-48l0-352c0-26.5-21.5-48-48-48l-64 0z" />
    </svg>
  );
}
