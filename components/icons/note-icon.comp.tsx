interface NoteIconProps {
  className?: string;
}

export function NoteIcon({ className }: NoteIconProps) {
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
      <path d="M20 12.5c0 3.6-3.6 6.5-8 6.5-.9 0-1.8-.1-2.6-.3L5 20.5l1.2-3.2A6.7 6.7 0 0 1 4 12.5C4 8.9 7.6 6 12 6s8 2.9 8 6.5z" />
    </svg>
  );
}
