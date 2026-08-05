interface PauseIconProps {
  className?: string;
}

export function PauseIcon({ className }: PauseIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="19" height="22" fill="currentColor" aria-hidden="true">
      <rect x="4" y="2" width="6" height="20" rx="1" />
      <rect x="14" y="2" width="6" height="20" rx="1" />
    </svg>
  );
}
