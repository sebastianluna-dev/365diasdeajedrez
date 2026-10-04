import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `chevron-up`, in Duotone Light or, with `variant="solid"`,
 * Duotone Solid. Its Solid drawing is a single layer, drawn at full strength:
 * at 40 % it would read as switched off.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ChevronUpIcon({ className, variant = "light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="-117.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "solid" ? (
        <path d="M201.4 105.4c12.5-12.5 32.8-12.5 45.3 0l192 192c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L224 173.3 54.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l192-192z" />
      ) : (
        <path d="M212.7 100.7c6.2-6.2 16.4-6.2 22.6 0l208 208c6.2 6.2 6.2 16.4 0 22.6s-16.4 6.2-22.6 0L224 134.6 27.3 331.3c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l208-208z" />
      )}
    </svg>
  );
}
