interface GearIconProps {
  className?: string;
}

/**
 * Settings, drawn as three sliders and not as a cog: a toothed wheel at 19px
 * turns to mush, and eight ticks around a circle read as a sun.
 *
 * Each slider's line stops at its knob instead of running under it, so the
 * knob is an empty ring on whatever ground the icon sits — a filled knob would
 * have to be painted in that ground's colour, which only the caller knows.
 */
export function GearIcon({ className }: GearIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3.4 6.8h2.9M10.5 6.8h10.1M3.4 12h9.7M17.3 12h3.3M3.4 17.2h4.1M11.7 17.2h8.9" />
      <circle cx="8.4" cy="6.8" r="2.1" />
      <circle cx="15.2" cy="12" r="2.1" />
      <circle cx="9.6" cy="17.2" r="2.1" />
    </svg>
  );
}
