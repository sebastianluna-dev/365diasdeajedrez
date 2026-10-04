interface GripIconProps {
  className?: string;
}

/**
 * The two columns of dots a row is dragged by. Font Awesome's
 * `grip-dots-vertical`, Duotone Solid.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function GripIcon({ className }: GripIconProps) {
  return (
    <svg className={className} viewBox="0 0 320 512" width="10" height="16" fill="currentColor" aria-hidden="true">
      <path
        opacity=".4"
        d="M320 64a64 64 0 1 1 -128 0 64 64 0 1 1 128 0zm0 192a64 64 0 1 1 -128 0 64 64 0 1 1 128 0zM192 448c0-35.3 28.7-64 64-64s64 28.7 64 64-28.7 64-64 64-64-28.7-64-64z"
      />
      <path d="M128 64A64 64 0 1 1 0 64 64 64 0 1 1 128 64zm0 192a64 64 0 1 1 -128 0 64 64 0 1 1 128 0zm0 192c0 35.3-28.7 64-64 64s-64-28.7-64-64 28.7-64 64-64 64 28.7 64 64z" />
    </svg>
  );
}
