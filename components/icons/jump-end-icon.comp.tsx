interface JumpEndIconProps {
  className?: string;
}

/**
 * Triangle and bar: to the last move, in the game viewer. Font Awesome's
 * `forward-step`, Duotone Solid.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function JumpEndIcon({ className }: JumpEndIconProps) {
  return (
    <svg
      className={className}
      viewBox="-149.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        opacity=".4"
        d="M0 72L0 440c0 14.7 8.1 28.2 21 35.2s28.7 6.3 41-1.8l258-169.6 0-95.7-258-169.6c-12.3-8.1-28-8.8-41-1.8S0 57.3 0 72z"
      />
      <path d="M352 32l0 0c17.7 0 32 14.3 32 32l0 384c0 17.7-14.3 32-32 32l0 0c-17.7 0-32-14.3-32-32l0-384c0-17.7 14.3-32 32-32z" />
    </svg>
  );
}
