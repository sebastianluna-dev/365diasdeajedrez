interface JumpStartIconProps {
  className?: string;
}

export function JumpStartIcon({ className }: JumpStartIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
      <path d="M5 5h2.2v14H5zM19 5.5v13l-9-6.5z" />
    </svg>
  );
}
