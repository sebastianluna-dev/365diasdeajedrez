interface CircleCheckIconProps {
  className?: string;
}

/**
 * A tick in a ring: one line of what a plan includes, on the site.
 * `CircleCheckSolidIcon` is the filled one, for what is done. Font Awesome's
 * `circle-check`, Duotone Light.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function CircleCheckIcon({ className }: CircleCheckIconProps) {
  return (
    <svg className={className} viewBox="0 0 512 512" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path
        opacity=".4"
        d="M32 256a224 224 0 1 0 448 0 224 224 0 1 0 -448 0zm116.7 20.7c6.2-6.2 16.4-6.2 22.6 0l50.7 50.7 117-160.8c5.2-7.1 15.2-8.7 22.3-3.5s8.7 15.2 3.5 22.3l-128 176c-2.8 3.8-7 6.2-11.7 6.5s-9.3-1.3-12.6-4.6l-64-64c-6.2-6.2-6.2-16.4 0-22.6z"
      />
      <path d="M256 512a256 256 0 1 1 0-512 256 256 0 1 1 0 512zm0-480a224 224 0 1 0 0 448 224 224 0 1 0 0-448zm83.1 134.6c5.2-7.1 15.2-8.7 22.3-3.5s8.7 15.2 3.5 22.3l-128 176c-2.8 3.8-7 6.2-11.7 6.5s-9.3-1.3-12.6-4.6l-64-64c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0l50.7 50.7 117-160.8z" />
    </svg>
  );
}
