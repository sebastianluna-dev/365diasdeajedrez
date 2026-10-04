import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `bold`, in Duotone Light (the default), Duotone Solid or
 * Classic Solid, as `variant` says. Its Duotone Solid drawing is a single
 * layer, drawn at full strength: at 40 % it would read as switched off.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function BoldIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="-149.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "duotone-light" && (
        <path d="M16 32C7.2 32 0 39.2 0 48S7.2 64 16 64l48 0 0 384-48 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l240 0c70.7 0 128-57.3 128-128 0-52.8-32-98.2-77.7-117.7 27.7-20.4 45.7-53.2 45.7-90.3 0-61.9-50.1-112-112-112L16 32zM96 448l0-192 160 0c53 0 96 43 96 96s-43 96-96 96L96 448zM96 64l144 0c44.2 0 80 35.8 80 80s-35.8 80-80 80L96 224 96 64z" />
      )}
      {variant === "duotone-solid" && (
        <path d="M32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l32 0 0 320-32 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l224 0c70.7 0 128-57.3 128-128 0-46.5-24.8-87.3-62-109.7 18.7-22.3 30-51 30-82.3 0-70.7-57.3-128-128-128L32 32zM288 160c0 35.3-28.7 64-64 64l-96 0 0-128 96 0c35.3 0 64 28.7 64 64zM128 416l0-128 128 0c35.3 0 64 28.7 64 64s-28.7 64-64 64l-128 0z" />
      )}
      {variant === "classic-solid" && (
        <path d="M32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l32 0 0 320-32 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l224 0c70.7 0 128-57.3 128-128 0-46.5-24.8-87.3-62-109.7 18.7-22.3 30-51 30-82.3 0-70.7-57.3-128-128-128L32 32zM288 160c0 35.3-28.7 64-64 64l-96 0 0-128 96 0c35.3 0 64 28.7 64 64zM128 416l0-128 128 0c35.3 0 64 28.7 64 64s-28.7 64-64 64l-128 0z" />
      )}
    </svg>
  );
}
