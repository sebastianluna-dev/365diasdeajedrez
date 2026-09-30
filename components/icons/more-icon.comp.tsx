interface MoreIconProps {
  className?: string;
}

/** The three dots that open what else can be done to a row. */
export function MoreIcon({ className }: MoreIconProps) {
  return (
    <svg className={className} viewBox="0 0 16 4" width="16" height="4" fill="currentColor" aria-hidden="true">
      <circle cx="2" cy="2" r="1.6" />
      <circle cx="8" cy="2" r="1.6" />
      <circle cx="14" cy="2" r="1.6" />
    </svg>
  );
}
