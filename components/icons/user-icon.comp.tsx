interface UserIconProps {
  className?: string;
}

/**
 * A person: whoever is signed in, in the menu of the bar. Font Awesome's
 * `user`, Duotone Light.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function UserIcon({ className }: UserIconProps) {
  return (
    <svg
      className={className}
      viewBox="-117.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        opacity=".4"
        d="M16 512c8.8 0 16-7.2 16-16l0-16c0-79.5 64.5-144 144-144l96 0c79.5 0 144 64.5 144 144l0 16c0 8.8 7.2 16 16 16L16 512zM320 128a96 96 0 1 1 -192 0 96 96 0 1 1 192 0z"
      />
      <path d="M128 128a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zm224 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0zM32 480c0-79.5 64.5-144 144-144l96 0c79.5 0 144 64.5 144 144l0 16c0 8.8 7.2 16 16 16s16-7.2 16-16l0-16c0-97.2-78.8-176-176-176l-96 0C78.8 304 0 382.8 0 480l0 16c0 8.8 7.2 16 16 16s16-7.2 16-16l0-16z" />
    </svg>
  );
}
