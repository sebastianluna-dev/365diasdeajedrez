import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Closing: the staff's dialogs, the new study's, and the site's mobile menu
 * while it is open. Font Awesome's `xmark`, in Duotone Light (the default),
 * Duotone Solid, Classic Solid or Classic Light, as `variant` says. Its
 * Duotone Solid drawing is a single layer, drawn at full strength: at 40 % it
 * would read as switched off.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function XmarkIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="-149.33 -85.33 682.67 682.67"
      width="20"
      height="20"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "duotone-light" && (
        <path d="M379.3 91.3c6.2-6.2 6.2-16.4 0-22.6s-16.4-6.2-22.6 0L192 233.4 27.3 68.7c-6.2-6.2-16.4-6.2-22.6 0s-6.2 16.4 0 22.6L169.4 256 4.7 420.7c-6.2 6.2-6.2 16.4 0 22.6s16.4 6.2 22.6 0L192 278.6 356.7 443.3c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6L214.6 256 379.3 91.3z" />
      )}
      {variant === "duotone-solid" && (
        <path d="M55.1 73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L147.2 256 9.9 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192.5 301.3 329.9 438.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.8 256 375.1 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192.5 210.7 55.1 73.4z" />
      )}
      {variant === "classic-solid" && (
        <path d="M55.1 73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L147.2 256 9.9 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192.5 301.3 329.9 438.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.8 256 375.1 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192.5 210.7 55.1 73.4z" />
      )}
      {variant === "classic-light" && (
        <path d="M379.3 91.3c6.2-6.2 6.2-16.4 0-22.6s-16.4-6.2-22.6 0L192 233.4 27.3 68.7c-6.2-6.2-16.4-6.2-22.6 0s-6.2 16.4 0 22.6L169.4 256 4.7 420.7c-6.2 6.2-6.2 16.4 0 22.6s16.4 6.2 22.6 0L192 278.6 356.7 443.3c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6L214.6 256 379.3 91.3z" />
      )}
      {variant === "sharp-duotone-light" && (
        <path d="M379.4 91.3L390.8 80 368.1 57.4 356.8 68.7 192.1 233.4 27.4 68.7 16.1 57.4-6.5 80 4.8 91.3 169.5 256 4.8 420.7-6.5 432 16.1 454.6 27.4 443.3 192.1 278.6 356.8 443.3 368.1 454.6 390.8 432 379.4 420.7 214.8 256 379.4 91.3z" />
      )}
      {variant === "sharp-light" && (
        <path d="M379.4 91.3L390.8 80 368.1 57.4 356.8 68.7 192.1 233.4 27.4 68.7 16.1 57.4-6.5 80 4.8 91.3 169.5 256 4.8 420.7-6.5 432 16.1 454.6 27.4 443.3 192.1 278.6 356.8 443.3 368.1 454.6 390.8 432 379.4 420.7 214.8 256 379.4 91.3z" />
      )}
    </svg>
  );
}
