import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `plus-large`, in Duotone Light (the default), Duotone Solid,
 * Classic Solid or Classic Light, as `variant` says. Its Duotone Solid drawing
 * is a single layer, drawn at full strength: at 40 % it would read as switched
 * off.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function PlusLargeIcon({ className, variant = "duotone-light" }: IconProps) {
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
        <path d="M272 16c0-8.8-7.2-16-16-16s-16 7.2-16 16l0 224-224 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l224 0 0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224 224 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-224 0 0-224z" />
      )}
      {variant === "duotone-solid" && (
        <path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 192-192 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l192 0 0 192c0 17.7 14.3 32 32 32s32-14.3 32-32l0-192 192 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-192 0 0-192z" />
      )}
      {variant === "classic-solid" && (
        <path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 192-192 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l192 0 0 192c0 17.7 14.3 32 32 32s32-14.3 32-32l0-192 192 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-192 0 0-192z" />
      )}
      {variant === "classic-light" && (
        <path d="M272 16c0-8.8-7.2-16-16-16s-16 7.2-16 16l0 224-224 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l224 0 0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224 224 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-224 0 0-224z" />
      )}
    </svg>
  );
}
