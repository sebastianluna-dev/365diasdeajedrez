interface JumpEndIconProps {
  className?: string;
}

export function JumpEndIcon({ className }: JumpEndIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
      <path d="M16.8 5H19v14h-2.2zM6 5.5v13l9-6.5z" />
    </svg>
  );
}
