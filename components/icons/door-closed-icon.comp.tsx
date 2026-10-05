import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `door-closed`, in Duotone Light (the default), Duotone Solid,
 * Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function DoorClosedIcon({ className, variant = "duotone-light" }: IconProps) {
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
          <path
            opacity=".4"
            d="M64 64l0 416 320 0 0-416c0-17.7-14.3-32-32-32L96 32C78.3 32 64 46.3 64 64zM344 248a24 24 0 1 1 -48 0 24 24 0 1 1 48 0z"
          />
          <path d="M352 32c17.7 0 32 14.3 32 32l0 416-320 0 0-416c0-17.7 14.3-32 32-32l256 0zm64 448l0-416c0-35.3-28.7-64-64-64L96 0C60.7 0 32 28.7 32 64l0 416-16 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l416 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-16 0zM320 224a24 24 0 1 0 0 48 24 24 0 1 0 0-48z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M32 64l0 384 384 0 0-384c0-35.3-28.7-64-64-64L96 0C60.7 0 32 28.7 32 64zM352 256a32 32 0 1 1 -64 0 32 32 0 1 1 64 0z"
          />
          <path d="M320 288a32 32 0 1 0 0-64 32 32 0 1 0 0 64zM32 448c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 448z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M32 64C32 28.7 60.7 0 96 0L352 0c35.3 0 64 28.7 64 64l0 384c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 512c-17.7 0-32-14.3-32-32s14.3-32 32-32L32 64zM320 288a32 32 0 1 0 0-64 32 32 0 1 0 0 64z" />
      )}
      {variant === "classic-light" && (
        <path d="M352 32c17.7 0 32 14.3 32 32l0 416-320 0 0-416c0-17.7 14.3-32 32-32l256 0zm64 448l0-416c0-35.3-28.7-64-64-64L96 0C60.7 0 32 28.7 32 64l0 416-16 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l416 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-16 0zM320 224a24 24 0 1 0 0 48 24 24 0 1 0 0-48z" />
      )}
    </svg>
  );
}
