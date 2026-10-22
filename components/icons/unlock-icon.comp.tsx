import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `unlock`, in Duotone Light (the default), Duotone Solid,
 * Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function UnlockIcon({ className, variant = "duotone-light" }: IconProps) {
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
        <>
          <path
            opacity=".4"
            d="M32 224c0-17.7 14.3-32 32-32l256 0c17.7 0 32 14.3 32 32l0 224c0 17.7-14.3 32-32 32L64 480c-17.7 0-32-14.3-32-32l0-224z"
          />
          <path d="M96 96c0-53 43-96 96-96s96 43 96 96c0 8.8 7.2 16 16 16s16-7.2 16-16c0-70.7-57.3-128-128-128S64 25.3 64 96l0 64c-35.3 0-64 28.7-64 64L0 448c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-224c0-35.3-28.7-64-64-64l-224 0 0-64zM32 224c0-17.7 14.3-32 32-32l256 0c17.7 0 32 14.3 32 32l0 224c0 17.7-14.3 32-32 32L64 480c-17.7 0-32-14.3-32-32l0-224z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M64 96l0 64 64 0 0-64c0-35.3 28.7-64 64-64 31.7 0 58 23 63.1 53.3 2.9 17.4 19.4 29.2 36.9 26.3s29.2-19.4 26.3-36.9C308.1 14.1 255.5-32 192-32 121.3-32 64 25.3 64 96z"
          />
          <path d="M0 224c0-35.3 28.7-64 64-64l256 0c35.3 0 64 28.7 64 64l0 224c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 224z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M128 96c0-35.3 28.7-64 64-64 31.7 0 58 23 63.1 53.3 2.9 17.4 19.4 29.2 36.9 26.3s29.2-19.4 26.3-36.9C308.1 14.1 255.5-32 192-32 121.3-32 64 25.3 64 96l0 64c-35.3 0-64 28.7-64 64L0 448c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-224c0-35.3-28.7-64-64-64l-192 0 0-64z" />
      )}
      {variant === "classic-light" && (
        <path d="M96 96c0-53 43-96 96-96s96 43 96 96c0 8.8 7.2 16 16 16s16-7.2 16-16c0-70.7-57.3-128-128-128S64 25.3 64 96l0 64c-35.3 0-64 28.7-64 64L0 448c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-224c0-35.3-28.7-64-64-64l-224 0 0-64zM32 224c0-17.7 14.3-32 32-32l256 0c17.7 0 32 14.3 32 32l0 224c0 17.7-14.3 32-32 32L64 480c-17.7 0-32-14.3-32-32l0-224z" />
      )}
      {variant === "sharp-duotone-light" && (
        <>
          <path opacity=".4" d="M32 192l0 288 320 0 0-288-320 0z" />
          <path d="M96 96c0-53 43-96 96-96s96 43 96 96l0 16 32 0 0-16c0-70.7-57.3-128-128-128S64 25.3 64 96l0 64-64 0 0 352 384 0 0-352-288 0 0-64zM32 480l0-288 320 0 0 288-320 0z" />
        </>
      )}
      {variant === "sharp-light" && (
        <path d="M96 96c0-53 43-96 96-96s96 43 96 96l0 16 32 0 0-16c0-70.7-57.3-128-128-128S64 25.3 64 96l0 64-64 0 0 352 384 0 0-352-288 0 0-64zM32 480l0-288 320 0 0 288-320 0z" />
      )}
    </svg>
  );
}
