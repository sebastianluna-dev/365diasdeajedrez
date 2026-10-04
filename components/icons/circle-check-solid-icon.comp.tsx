interface CircleCheckSolidIconProps {
  className?: string;
}

/**
 * The filled check, for what is done: a finished chapter, a learned lesson. It
 * is the one icon in Duotone's Solid weight and not Light: in Light it would
 * be `CircleCheckIcon`, and a done mark has to read filled next to the empty
 * ring of what is not. Font Awesome's `circle-check`, Duotone Solid.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function CircleCheckSolidIcon({ className }: CircleCheckSolidIconProps) {
  return (
    <svg className={className} viewBox="0 0 512 512" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path
        opacity=".4"
        d="M0 256a256 256 0 1 0 512 0 256 256 0 1 0 -512 0zm135.1 7.1c9.4-9.4 24.6-9.4 33.9 0L221.1 315.2 340.5 151c7.8-10.7 22.8-13.1 33.5-5.3s13.1 22.8 5.3 33.5L243.4 366.1c-4.1 5.7-10.5 9.3-17.5 9.8s-13.9-2-18.8-7l-72-72c-9.4-9.4-9.4-24.6 0-33.9z"
      />
      <path d="M340.5 151c7.8-10.7 22.8-13.1 33.5-5.3s13.1 22.8 5.3 33.5L243.4 366.1c-4.1 5.7-10.5 9.3-17.5 9.8s-13.9-2-18.8-7l-72-72c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0L221.1 315.2 340.5 151z" />
    </svg>
  );
}
