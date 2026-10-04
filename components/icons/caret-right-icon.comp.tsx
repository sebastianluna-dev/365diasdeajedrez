interface CaretRightIconProps {
  className?: string;
}

/**
 * Triangle pointing right: the step of the trail that says where one is in a
 * course. `ChevronIcon` is the open one, for what opens and closes. Font
 * Awesome's `caret-right`, Duotone Light.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function CaretRightIcon({ className }: CaretRightIconProps) {
  return (
    <svg className={className} viewBox="0 0 256 512" width="8" height="16" fill="currentColor" aria-hidden="true">
      <path
        opacity=".4"
        d="M80.3 128l0 256 16 16 144-144-144-144-16 16zm16 0L223.2 254.9c.3 .4 .6 .8 .7 1.1-42.5 42.8-85 85.4-127.6 128l0-256z"
      />
      <path d="M246.9 233.4c11.6 12.9 12.8 32.4 0 45.2l-128 128c-9.1 9.2-22.9 11.9-34.9 6.9l-4.3-2.2c-9.5-5.7-15.5-16.1-15.5-27.4l0-256 .3-4.8c1.4-9.4 7-17.7 15.1-22.6l4.3-2.2c10.5-4.3 22.3-2.8 31.2 3.8l3.7 3.1 128 128zm-23 22.7c-.1-.3-.3-.7-.7-1.1L96.3 128 96.3 384 224 256.3c0-.1-.1-.2-.1-.2z" />
    </svg>
  );
}
