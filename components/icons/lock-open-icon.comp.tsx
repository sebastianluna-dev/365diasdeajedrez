import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `lock-open`, in Duotone Light (the default), Duotone Solid or
 * Classic Solid, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function LockOpenIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="-53.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "duotone-light" && (
        <>
          <path
            opacity=".4"
            d="M128 224l0 224c0 17.7 14.3 32 32 32l256 0c17.7 0 32-14.3 32-32l0-224c0-17.7-14.3-32-32-32l-256 0c-17.7 0-32 14.3-32 32z"
          />
          <path d="M352 96c0-53 43-96 96-96s96 43 96 96l0 48c0 8.8 7.2 16 16 16s16-7.2 16-16l0-48c0-70.7-57.3-128-128-128S320 25.3 320 96l0 64-160 0c-35.3 0-64 28.7-64 64l0 224c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-224c0-35.3-28.7-64-64-64l-64 0 0-64zM160 192l256 0c17.7 0 32 14.3 32 32l0 224c0 17.7-14.3 32-32 32l-256 0c-17.7 0-32-14.3-32-32l0-224c0-17.7 14.3-32 32-32z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M320 96l0 64 64 0 0-64c0-35.3 28.7-64 64-64s64 28.7 64 64l0 32c0 17.7 14.3 32 32 32s32-14.3 32-32l0-32c0-70.7-57.3-128-128-128S320 25.3 320 96z"
          />
          <path d="M96 224c0-35.3 28.7-64 64-64l256 0c35.3 0 64 28.7 64 64l0 224c0 35.3-28.7 64-64 64l-256 0c-35.3 0-64-28.7-64-64l0-224z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M384 96c0-35.3 28.7-64 64-64s64 28.7 64 64l0 32c0 17.7 14.3 32 32 32s32-14.3 32-32l0-32c0-70.7-57.3-128-128-128S320 25.3 320 96l0 64-160 0c-35.3 0-64 28.7-64 64l0 224c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-224c0-35.3-28.7-64-64-64l-32 0 0-64z" />
      )}
    </svg>
  );
}
