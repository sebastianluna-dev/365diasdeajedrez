interface MenuIconProps {
  className?: string;
}

export function MenuIcon({ className }: MenuIconProps) {
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
      aria-hidden="true"
    >
      <path d="M4.5 7h15M4.5 12h15M4.5 17h15" />
    </svg>
  );
}
