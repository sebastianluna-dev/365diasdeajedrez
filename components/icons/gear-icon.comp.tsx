interface GearIconProps {
  className?: string;
}

/**
 * Settings, drawn as three sliders and not as a cog: a toothed wheel at 19px
 * turns to mush, and eight ticks around a circle read as a sun.
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
      <path d="M3.4 6.8h17.2M3.4 12h17.2M3.4 17.2h17.2" />
      <circle cx="8.4" cy="6.8" r="2.1" fill="var(--icon-knob, transparent)" />
      <circle cx="15.2" cy="12" r="2.1" fill="var(--icon-knob, transparent)" />
      <circle cx="9.6" cy="17.2" r="2.1" fill="var(--icon-knob, transparent)" />
    </svg>
  );
}
