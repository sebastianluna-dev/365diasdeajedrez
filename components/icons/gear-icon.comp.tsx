interface GearIconProps {
  className?: string;
}

/**
 * Settings, drawn as three sliders and not as a cog: a toothed wheel at 19px
 * turns to mush, and eight ticks around a circle read as a sun. Font Awesome's
 * `sliders`, Duotone Light.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function GearIcon({ className }: GearIconProps) {
  return (
    <svg
      className={className}
      viewBox="-85.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        opacity=".4"
        d="M112 416a48 48 0 1 0 96 0 48 48 0 1 0 -96 0zM144 96a48 48 0 1 0 96 0 48 48 0 1 0 -96 0zM304 256a48 48 0 1 0 96 0 48 48 0 1 0 -96 0z"
      />
      <path d="M0 416c0-8.8 7.2-16 16-16l65.6 0c7.4-36.5 39.7-64 78.4-64s71 27.5 78.4 64L496 400c8.8 0 16 7.2 16 16s-7.2 16-16 16l-257.6 0c-7.4 36.5-39.7 64-78.4 64s-71-27.5-78.4-64L16 432c-8.8 0-16-7.2-16-16zm208 0a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM400 256a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zm-48-80c38.7 0 71 27.5 78.4 64l65.6 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-65.6 0c-7.4 36.5-39.7 64-78.4 64s-71-27.5-78.4-64L16 272c-8.8 0-16-7.2-16-16s7.2-16 16-16l257.6 0c7.4-36.5 39.7-64 78.4-64zM192 48a48 48 0 1 0 0 96 48 48 0 1 0 0-96zm78.4 32L496 80c8.8 0 16 7.2 16 16s-7.2 16-16 16l-225.6 0c-7.4 36.5-39.7 64-78.4 64s-71-27.5-78.4-64L16 112c-8.8 0-16-7.2-16-16S7.2 80 16 80l97.6 0C121 43.5 153.3 16 192 16s71 27.5 78.4 64z" />
    </svg>
  );
}
