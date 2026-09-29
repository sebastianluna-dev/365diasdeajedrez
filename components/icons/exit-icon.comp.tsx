interface ExitIconProps {
  className?: string;
}

/** A door with the way out through it: signing off. */
export function ExitIcon({ className }: ExitIconProps) {
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
      <path d="M14.4 4.6H18a1.4 1.4 0 0 1 1.4 1.4v12a1.4 1.4 0 0 1-1.4 1.4h-3.6" />
      <path d="M10.2 15.8 14 12l-3.8-3.8M14 12H4.6" />
    </svg>
  );
}
