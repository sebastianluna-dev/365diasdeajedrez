interface PlusIconProps {
  className?: string;
}

export function PlusIcon({ className }: PlusIconProps) {
  return (
    <svg className={className} viewBox="0 0 448 512" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M256 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 160-160 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l160 0 0 160c0 17.7 14.3 32 32 32s32-14.3 32-32l0-160 160 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-160 0 0-160z" />
    </svg>
  );
}
