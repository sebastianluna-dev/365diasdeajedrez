interface MoreIconProps {
  className?: string;
}

/**
 * The three dots that open what else can be done to a row. Its `viewBox` is
 * cut close around the dots, because its callers draw it in a 16×4 box. Font
 * Awesome's `ellipsis`, Duotone Solid.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function MoreIcon({ className }: MoreIconProps) {
  return (
    <svg className={className} viewBox="0 200 448 112" width="16" height="4" fill="currentColor" aria-hidden="true">
      <path opacity=".4" d="M168 256a56 56 0 1 0 112 0 56 56 0 1 0 -112 0z" />
      <path d="M56 312a56 56 0 1 0 0-112 56 56 0 1 0 0 112zm336 0a56 56 0 1 0 0-112 56 56 0 1 0 0 112z" />
    </svg>
  );
}
