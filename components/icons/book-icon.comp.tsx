interface BookIconProps {
  className?: string;
}

export function BookIcon({ className }: BookIconProps) {
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
      <path d="M12 6.5C10.5 5 8.4 4.6 4 5v13c4.4-.4 6.5 0 8 1.5 1.5-1.5 3.6-1.9 8-1.5V5c-4.4-.4-6.5 0-8 1.5z" />
      <path d="M12 6.5v13" />
    </svg>
  );
}
