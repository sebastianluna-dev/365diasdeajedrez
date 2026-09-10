interface ImageIconProps {
  className?: string;
}

/** Frame with a mountain and a sun: the slot where there is no image yet. */
export function ImageIcon({ className }: ImageIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <circle cx="8.75" cy="9.5" r="1.4" />
      <path d="M4 17l4.5-4.6a2 2 0 0 1 2.8 0L15 16" />
      <path d="M13.5 14.5l1.8-1.7a2 2 0 0 1 2.8 0L20 14.8" />
    </svg>
  );
}
