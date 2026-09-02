interface SoundOnIconProps {
  className?: string;
}

export function SoundOnIcon({ className }: SoundOnIconProps) {
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
      <path d="M16 9.5a4 4 0 0 1 0 5" />
    </svg>
  );
}
