import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `xmark-large`, in Duotone Light (the default), Duotone Solid,
 * Classic Solid or Classic Light, as `variant` says. Its Duotone Solid drawing
 * is a single layer, drawn at full strength: at 40 % it would read as switched
 * off.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function XmarkLargeIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="-85.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "duotone-light" && (
        <path d="M4.7 27.3c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0L256 233.4 484.7 4.7c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6L278.6 256 507.3 484.7c6.2 6.2 6.2 16.4 0 22.6s-16.4 6.2-22.6 0L256 278.6 27.3 507.3c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6L233.4 256 4.7 27.3z" />
      )}
      {variant === "duotone-solid" && (
        <path d="M502.6 54.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 210.7 54.6 9.4C42.1-3.1 21.9-3.1 9.4 9.4s-12.5 32.8 0 45.3L210.7 256 9.4 457.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L256 301.3 457.4 502.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L301.3 256 502.6 54.6z" />
      )}
      {variant === "classic-solid" && (
        <path d="M502.6 54.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 210.7 54.6 9.4C42.1-3.1 21.9-3.1 9.4 9.4s-12.5 32.8 0 45.3L210.7 256 9.4 457.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L256 301.3 457.4 502.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L301.3 256 502.6 54.6z" />
      )}
      {variant === "classic-light" && (
        <path d="M4.7 27.3c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0L256 233.4 484.7 4.7c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6L278.6 256 507.3 484.7c6.2 6.2 6.2 16.4 0 22.6s-16.4 6.2-22.6 0L256 278.6 27.3 507.3c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6L233.4 256 4.7 27.3z" />
      )}
      {variant === "sharp-duotone-light" && (
        <path d="M4.8 27.3L-6.5 16 16.1-6.6 27.4 4.7 256.1 233.4 484.8 4.7 496.1-6.6 518.8 16 507.4 27.3 278.8 256 507.4 484.7 518.8 496 496.1 518.6 484.8 507.3 256.1 278.6 27.4 507.3 16.1 518.6-6.5 496 4.8 484.7 233.5 256 4.8 27.3z" />
      )}
      {variant === "sharp-light" && (
        <path d="M4.8 27.3L-6.5 16 16.1-6.6 27.4 4.7 256.1 233.4 484.8 4.7 496.1-6.6 518.8 16 507.4 27.3 278.8 256 507.4 484.7 518.8 496 496.1 518.6 484.8 507.3 256.1 278.6 27.4 507.3 16.1 518.6-6.5 496 4.8 484.7 233.5 256 4.8 27.3z" />
      )}
    </svg>
  );
}
