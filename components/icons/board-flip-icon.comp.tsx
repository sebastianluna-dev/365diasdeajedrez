interface BoardFlipIconProps {
  className?: string;
}

export function BoardFlipIcon({ className }: BoardFlipIconProps) {
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
      <path d="M4 8h13l-3-3M20 16H7l3 3" />
    </svg>
  );
}
