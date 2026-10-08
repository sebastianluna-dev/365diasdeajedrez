import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `plus-minus`, in Duotone Light (the default), Duotone Solid,
 * Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function PlusMinusIcon({ className, variant = "duotone-light" }: IconProps) {
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
        <path d="M176 208l0 160c0 8.8 7.2 16 16 16s16-7.2 16-16l0-160 160 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-160 0 0-160c0-8.8-7.2-16-16-16s-16 7.2-16 16l0 160-160 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l160 0zM0 496c0 8.8 7.2 16 16 16l352 0c8.8 0 16-7.2 16-16s-7.2-16-16-16L16 480c-8.8 0-16 7.2-16 16z" />
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M0 480c0-17.7 14.3-32 32-32l320 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 512c-17.7 0-32-14.3-32-32z"
          />
          <path d="M224 32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 128-128 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l128 0 0 128c0 17.7 14.3 32 32 32s32-14.3 32-32l0-128 128 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-128 0 0-128z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M224 32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 128-128 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l128 0 0 128c0 17.7 14.3 32 32 32s32-14.3 32-32l0-128 128 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-128 0 0-128zM0 480c0 17.7 14.3 32 32 32l320 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 448c-17.7 0-32 14.3-32 32z" />
      )}
      {variant === "classic-light" && (
        <path d="M176 208l0 160c0 8.8 7.2 16 16 16s16-7.2 16-16l0-160 160 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-160 0 0-160c0-8.8-7.2-16-16-16s-16 7.2-16 16l0 160-160 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l160 0zM0 496c0 8.8 7.2 16 16 16l352 0c8.8 0 16-7.2 16-16s-7.2-16-16-16L16 480c-8.8 0-16 7.2-16 16z" />
      )}
    </svg>
  );
}
