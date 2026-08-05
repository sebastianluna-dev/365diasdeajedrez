interface PlayIconProps {
  className?: string;
}

export function PlayIcon({ className }: PlayIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="19" height="22" fill="currentColor" aria-hidden="true">
      <path d="M3 2l18 11L3 24V2z" />
    </svg>
  );
}
