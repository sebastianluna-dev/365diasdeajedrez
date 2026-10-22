import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `chevron-down`, in Duotone Light (the default), Duotone
 * Solid, Classic Solid or Classic Light, as `variant` says. Its Duotone Solid
 * drawing is a single layer, drawn at full strength: at 40 % it would read as
 * switched off.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ChevronDownIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="-117.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "duotone-light" && (
        <path d="M235.3 411.3c-6.2 6.2-16.4 6.2-22.6 0l-208-208c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0L224 377.4 420.7 180.7c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6l-208 208z" />
      )}
      {variant === "duotone-solid" && (
        <path d="M246.6 406.6c-12.5 12.5-32.8 12.5-45.3 0l-192-192c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L224 338.7 393.4 169.4c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3l-192 192z" />
      )}
      {variant === "classic-solid" && (
        <path d="M201.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 338.7 54.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z" />
      )}
      {variant === "classic-light" && (
        <path d="M235.3 411.3c-6.2 6.2-16.4 6.2-22.6 0l-208-208c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0L224 377.4 420.7 180.7c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6l-208 208z" />
      )}
      {variant === "sharp-duotone-light" && (
        <path d="M224.1 422.6l11.3-11.3 208-208 11.3-11.3-22.6-22.6-11.3 11.3-196.7 196.7-196.7-196.7-11.3-11.3-22.6 22.6 11.3 11.3 208 208 11.3 11.3z" />
      )}
      {variant === "sharp-light" && (
        <path d="M224.1 422.6l11.3-11.3 208-208 11.3-11.3-22.6-22.6-11.3 11.3-196.7 196.7-196.7-196.7-11.3-11.3-22.6 22.6 11.3 11.3 208 208 11.3 11.3z" />
      )}
    </svg>
  );
}
