interface ArrowUpIconProps {
  className?: string;
}

export function ArrowUpIcon({ className }: ArrowUpIconProps) {
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
      <path d="M12 19V6" />
      <path d="M5.5 12.5L12 6l6.5 6.5" />
    </svg>
  );
}
