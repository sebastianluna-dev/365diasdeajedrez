import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `tag`, in Duotone Light or, with `variant="solid"`, Duotone
 * Solid. Its Solid drawing is a single layer, drawn at full strength: at 40 %
 * it would read as switched off.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function TagIcon({ className, variant = "light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="-85.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "solid" ? (
        <path d="M32.5 96l0 149.5c0 17 6.7 33.3 18.7 45.3l192 192c25 25 65.5 25 90.5 0L483.2 333.3c25-25 25-65.5 0-90.5l-192-192C279.2 38.7 263 32 246 32L96.5 32c-35.3 0-64 28.7-64 64zm112 16a32 32 0 1 1 0 64 32 32 0 1 1 0-64z" />
      ) : (
        <>
          <path
            opacity=".4"
            d="M64.1 96c0-17.7 14.3-32 32-32l156.1 0c8.5 0 16.6 3.4 22.6 9.4l192 192c12.5 12.5 12.5 32.8 0 45.3L310.7 466.7c-12.5 12.5-32.8 12.5-45.3 0l-192-192c-6-6-9.4-14.1-9.4-22.6L64.1 96zm56 48a24 24 0 1 0 48 0 24 24 0 1 0 -48 0z"
          />
          <path d="M64.1 96c0-17.7 14.3-32 32-32l156.1 0c8.5 0 16.6 3.4 22.6 9.4l192 192c12.5 12.5 12.5 32.8 0 45.3L310.7 466.7c-12.5 12.5-32.8 12.5-45.3 0l-192-192c-6-6-9.4-14.1-9.4-22.6L64.1 96zm32-64c-35.3 0-64 28.7-64 64l0 156.1c0 17 6.7 33.3 18.7 45.3l192 192c25 25 65.5 25 90.5 0L489.5 333.3c25-25 25-65.5 0-90.5l-192-192c-12-12-28.3-18.7-45.3-18.7L96.1 32zm48 136a24 24 0 1 0 0-48 24 24 0 1 0 0 48z" />
        </>
      )}
    </svg>
  );
}
