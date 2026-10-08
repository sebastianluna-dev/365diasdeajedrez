import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `horizontal-rule`, in Duotone Light (the default), Duotone
 * Solid, Classic Solid or Classic Light, as `variant` says. Its Duotone Solid
 * drawing is a single layer, drawn at full strength: at 40 % it would read as
 * switched off.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function HorizontalRuleIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="-21.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "duotone-light" && (
        <path d="M0 256c0-8.8 7.2-16 16-16l608 0c8.8 0 16 7.2 16 16s-7.2 16-16 16L16 272c-8.8 0-16-7.2-16-16z" />
      )}
      {variant === "duotone-solid" && (
        <path d="M0 256c0-17.7 14.3-32 32-32l576 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 288c-17.7 0-32-14.3-32-32z" />
      )}
      {variant === "classic-solid" && (
        <path d="M0 256c0-17.7 14.3-32 32-32l576 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 288c-17.7 0-32-14.3-32-32z" />
      )}
      {variant === "classic-light" && (
        <path d="M0 256c0-8.8 7.2-16 16-16l608 0c8.8 0 16 7.2 16 16s-7.2 16-16 16L16 272c-8.8 0-16-7.2-16-16z" />
      )}
    </svg>
  );
}
