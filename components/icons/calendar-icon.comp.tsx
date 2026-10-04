interface CalendarIconProps {
  className?: string;
}

/**
 * The date picker's field. Font Awesome's `calendar`, Duotone Light.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function CalendarIcon({ className }: CalendarIconProps) {
  return (
    <svg
      className={className}
      viewBox="-117.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path opacity=".4" d="M32 192l0 224c0 17.7 14.3 32 32 32l320 0c17.7 0 32-14.3 32-32l0-224-384 0z" />
      <path d="M112 0c8.8 0 16 7.2 16 16l0 48 192 0 0-48c0-8.8 7.2-16 16-16s16 7.2 16 16l0 48 32 0c35.3 0 64 28.7 64 64l0 288c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 128C0 92.7 28.7 64 64 64l32 0 0-48c0-8.8 7.2-16 16-16zM384 96L64 96c-17.7 0-32 14.3-32 32l0 32 384 0 0-32c0-17.7-14.3-32-32-32zm32 96l-384 0 0 224c0 17.7 14.3 32 32 32l320 0c17.7 0 32-14.3 32-32l0-224z" />
    </svg>
  );
}
