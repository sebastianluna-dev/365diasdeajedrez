interface ClipboardIconProps {
  className?: string;
}

export function ClipboardIcon({ className }: ClipboardIconProps) {
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
      <path d="M9 4.5h6v3H9z" />
      <path d="M9 6H6.8A1.8 1.8 0 0 0 5 7.8v10.4A1.8 1.8 0 0 0 6.8 20h10.4a1.8 1.8 0 0 0 1.8-1.8V7.8A1.8 1.8 0 0 0 17.2 6H15" />
    </svg>
  );
}
