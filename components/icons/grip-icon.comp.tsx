interface GripIconProps {
  className?: string;
}

/** The two columns of dots a row is dragged by. */
export function GripIcon({ className }: GripIconProps) {
  return (
    <svg className={className} viewBox="0 0 10 16" width="10" height="16" fill="currentColor" aria-hidden="true">
      <circle cx="2" cy="3" r="1.5" />
      <circle cx="8" cy="3" r="1.5" />
      <circle cx="2" cy="8" r="1.5" />
      <circle cx="8" cy="8" r="1.5" />
      <circle cx="2" cy="13" r="1.5" />
      <circle cx="8" cy="13" r="1.5" />
    </svg>
  );
}
