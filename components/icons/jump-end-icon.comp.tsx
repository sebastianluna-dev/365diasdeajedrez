interface JumpEndIconProps {
  className?: string;
}

/**
 * Triangle and bar: to the last move, in the game viewer. Font Awesome's
 * `forward-step`, Duotone Light.
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
        d="M32 72l0 368c0 2.9 1.6 5.6 4.2 7s5.7 1.3 8.2-.4l280-184 10.2-6.7-10.2-6.7-280-184c-2.5-1.6-5.6-1.8-8.2-.4S32 69.1 32 72z"
      />
      <path d="M368 32c-8.8 0-16 7.2-16 16l0 181.2-10-6.6-280-184c-12.3-8.1-28-8.8-41-1.8S0 57.3 0 72L0 440c0 14.7 8.1 28.2 21 35.2s28.7 6.3 41-1.8l280-184 10-6.6 0 181.2c0 8.8 7.2 16 16 16s16-7.2 16-16l0-416c0-8.8-7.2-16-16-16zM44.4 65.3l280 184 10.2 6.7-10.2 6.7-280 184c-2.5 1.6-5.6 1.8-8.2 .4s-4.2-4.1-4.2-7L32 72c0-2.9 1.6-5.6 4.2-7s5.7-1.3 8.2 .4z" />
    </svg>
  );
}
