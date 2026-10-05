import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `lock`, in Duotone Light (the default), Duotone Solid,
 * Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function LockIcon({ className, variant = "duotone-light" }: IconProps) {
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
          <path d="M96 96l0 64 192 0 0-64c0-53-43-96-96-96S96 43 96 96zM64 160l0-64C64 25.3 121.3-32 192-32S320 25.3 320 96l0 64c35.3 0 64 28.7 64 64l0 224c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 224c0-35.3 28.7-64 64-64zM32 224l0 224c0 17.7 14.3 32 32 32l256 0c17.7 0 32-14.3 32-32l0-224c0-17.7-14.3-32-32-32L64 192c-17.7 0-32 14.3-32 32z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M64 96l0 64 64 0 0-64c0-35.3 28.7-64 64-64s64 28.7 64 64l0 64 64 0 0-64c0-70.7-57.3-128-128-128S64 25.3 64 96z"
          />
          <path d="M64 160l256 0c35.3 0 64 28.7 64 64l0 224c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 224c0-35.3 28.7-64 64-64z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M128 96l0 64 128 0 0-64c0-35.3-28.7-64-64-64s-64 28.7-64 64zM64 160l0-64C64 25.3 121.3-32 192-32S320 25.3 320 96l0 64c35.3 0 64 28.7 64 64l0 224c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 224c0-35.3 28.7-64 64-64z" />
      )}
      {variant === "classic-light" && (
        <path d="M96 96l0 64 192 0 0-64c0-53-43-96-96-96S96 43 96 96zM64 160l0-64C64 25.3 121.3-32 192-32S320 25.3 320 96l0 64c35.3 0 64 28.7 64 64l0 224c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 224c0-35.3 28.7-64 64-64zM32 224l0 224c0 17.7 14.3 32 32 32l256 0c17.7 0 32-14.3 32-32l0-224c0-17.7-14.3-32-32-32L64 192c-17.7 0-32 14.3-32 32z" />
      )}
    </svg>
  );
}
