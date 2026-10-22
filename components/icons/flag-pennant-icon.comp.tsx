import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `flag-pennant`, in Duotone Light (the default), Duotone
 * Solid, Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function FlagPennantIcon({ className, variant = "duotone-light" }: IconProps) {
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
        <>
          <path opacity=".4" d="M32 66.9L396.1 192 32 317.1 32 66.9z" />
          <path d="M32 16C32 7.2 24.8 0 16 0S0 7.2 0 16L0 496c0 8.8 7.2 16 16 16s16-7.2 16-16l0-145.1 400.9-137.7c9.1-3.1 15.1-11.6 15.1-21.2s-6.1-18.1-15.1-21.2L32 33.1 32 16zm0 50.9L396.1 192 32 317.1 32 66.9z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path opacity=".4" d="M64 32L433 170.4c9 3.4 15 12 15 21.6s-6 18.2-15 21.6L64 352 64 32z" />
          <path d="M32 0C49.7 0 64 14.3 64 32l0 448c0 17.7-14.3 32-32 32S0 497.7 0 480L0 32C0 14.3 14.3 0 32 0z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M64 32C64 14.3 49.7 0 32 0S0 14.3 0 32L0 480c0 17.7 14.3 32 32 32s32-14.3 32-32l0-128 369-138.4c9-3.4 15-12 15-21.6s-6-18.2-15-21.6L64 32z" />
      )}
      {variant === "classic-light" && (
        <path d="M32 16C32 7.2 24.8 0 16 0S0 7.2 0 16L0 496c0 8.8 7.2 16 16 16s16-7.2 16-16l0-145.1 400.9-137.7c9.1-3.1 15.1-11.6 15.1-21.2s-6.1-18.1-15.1-21.2L32 33.1 32 16zm0 50.9L396.1 192 32 317.1 32 66.9z" />
      )}
      {variant === "sharp-duotone-light" && (
        <>
          <path opacity=".4" d="M32 67.5L358.3 192 32 316.5 32 67.5z" />
          <path d="M32 16L32 0 0 0 0 512 32 512 32 350.8 403.1 209.1 448 192 403.1 174.9 32 33.2 32 16zm0 51.5L358.3 192 32 316.5 32 67.5z" />
        </>
      )}
      {variant === "sharp-light" && (
        <path d="M32 16L32 0 0 0 0 512 32 512 32 350.8 403.1 209.1 448 192 403.1 174.9 32 33.2 32 16zm0 51.5L358.3 192 32 316.5 32 67.5z" />
      )}
    </svg>
  );
}
