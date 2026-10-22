import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Forward one move, in the game viewer (in Classic Solid); also the arrow
 * after the site's call to log in. Font Awesome's `chevron-right`, in Duotone Light (the default),
 * Duotone Solid, Classic Solid or Classic Light, as `variant` says. Its
 * Duotone Solid drawing is a single layer, drawn at full strength: at 40 % it
 * would read as switched off.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ChevronRightIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="-181.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "duotone-light" && (
        <path d="M315.3 244.7c6.2 6.2 6.2 16.4 0 22.6l-208 208c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6L281.4 256 84.7 59.3c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0l208 208z" />
      )}
      {variant === "duotone-solid" && (
        <path d="M311.1 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L243.2 256 73.9 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z" />
      )}
      {variant === "classic-solid" && (
        <path d="M311.1 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L243.2 256 73.9 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z" />
      )}
      {variant === "classic-light" && (
        <path d="M315.3 244.7c6.2 6.2 6.2 16.4 0 22.6l-208 208c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6L281.4 256 84.7 59.3c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0l208 208z" />
      )}
      {variant === "sharp-duotone-light" && (
        <path d="M326.8 256l-11.3 11.3-208 208-11.3 11.3-22.6-22.6 11.3-11.3 196.7-196.7-208-208 22.6-22.6 11.3 11.3 208 208 11.3 11.3z" />
      )}
      {variant === "sharp-light" && (
        <path d="M326.8 256l-11.3 11.3-208 208-11.3 11.3-22.6-22.6 11.3-11.3 196.7-196.7-208-208 22.6-22.6 11.3 11.3 208 208 11.3 11.3z" />
      )}
    </svg>
  );
}
