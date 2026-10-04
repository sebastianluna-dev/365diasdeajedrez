interface CaretRightIconProps {
  className?: string;
}

/**
 * Triangle pointing right: the step of the trail that says where one is in a
 * course. `ChevronIcon` is the open one, for what opens and closes. Font
 * Awesome's `caret-right`, Duotone Solid. Its Duotone Solid drawing is one
 * layer, the one at the back, drawn here at full strength: at 40 % it would
 * read as switched off.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function CaretRightIcon({ className }: CaretRightIconProps) {
  return (
    <svg className={className} viewBox="0 0 256 512" width="8" height="16" fill="currentColor" aria-hidden="true">
      <path d="M249.3 235.8c10.2 12.6 9.5 31.1-2.2 42.8l-128 128c-9.2 9.2-22.9 11.9-34.9 6.9S64.5 396.9 64.5 384l0-256c0-12.9 7.8-24.6 19.8-29.6s25.7-2.2 34.9 6.9l128 128 2.2 2.4z" />
    </svg>
  );
}
