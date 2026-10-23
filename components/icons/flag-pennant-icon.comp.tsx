import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `flag-pennant`, in twelve styles (Duotone Light is the default), as `variant` says.
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
      {variant === "classic-regular" && (
        <path d="M48 24C48 10.7 37.3 0 24 0S0 10.7 0 24L0 488c0 13.3 10.7 24 24 24s24-10.7 24-24l0-137.1 384.9-137.5c9-3.2 15.1-11.8 15.1-21.4s-6-18.2-15.1-21.4L48 33.1 48 24zm0 60.1L350.1 192 48 299.9 48 84.1z" />
      )}
      {variant === "duotone-regular" && (
        <>
          <path opacity=".4" d="M48 84.1L350.1 192 48 299.9 48 84.1z" />
          <path d="M48 24C48 10.7 37.3 0 24 0S0 10.7 0 24L0 488c0 13.3 10.7 24 24 24s24-10.7 24-24l0-137.1 384.9-137.5c9-3.2 15.1-11.8 15.1-21.4s-6-18.2-15.1-21.4L48 33.1 48 24zm0 60.1L350.1 192 48 299.9 48 84.1z" />
        </>
      )}
      {variant === "sharp-solid" && <path d="M64 32L64 0 0 0 0 512 64 512 64 352 448 192 64 32z" />}
      {variant === "sharp-duotone-solid" && (
        <>
          <path opacity=".4" d="M64 32L448 192 64 352 64 32z" />
          <path d="M64 0L64 512 0 512 0 0 64 0z" />
        </>
      )}
      {variant === "sharp-regular" && (
        <path d="M48 24L48 0 0 0 0 512 48 512 48 350.7 382.9 217.8 448 192 382.9 166.2 48 33.3 48 24zm0 60.9L317.9 192 48 299.1 48 84.9z" />
      )}
      {variant === "sharp-duotone-regular" && (
        <>
          <path opacity=".4" d="M48 84.9L317.9 192 48 299.1 48 84.9z" />
          <path d="M48 24L48 0 0 0 0 512 48 512 48 350.7 382.9 217.8 448 192 382.9 166.2 48 33.3 48 24zm0 60.9L317.9 192 48 299.1 48 84.9z" />
        </>
      )}
    </svg>
  );
}
