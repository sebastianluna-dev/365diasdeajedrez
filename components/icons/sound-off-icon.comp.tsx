interface SoundOffIconProps {
  className?: string;
}

export function SoundOffIcon({ className }: SoundOffIconProps) {
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
      <path d="M5 10v4h3l4 3.5v-11L8 10z" />
      <path d="M16 10l4 4M20 10l-4 4" />
    </svg>
  );
}
