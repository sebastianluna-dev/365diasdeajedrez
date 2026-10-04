import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * The two columns of dots a row is dragged by; its callers draw it in Duotone
 * Solid. Font Awesome's `grip-dots-vertical`, in Duotone Light (the default),
 * Duotone Solid or Classic Solid, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function GripDotsVerticalIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 320 512" width="10" height="16" fill="currentColor" aria-hidden="true">
      {variant === "duotone-light" && (
        <>
          <path
            opacity=".4"
            d="M32 64a32 32 0 1 0 64 0 32 32 0 1 0 -64 0zm0 192a32 32 0 1 0 64 0 32 32 0 1 0 -64 0zm0 192c0 17.7 14.3 32 32 32s32-14.3 32-32-14.3-32-32-32-32 14.3-32 32zM224 64a32 32 0 1 0 64 0 32 32 0 1 0 -64 0zm0 192a32 32 0 1 0 64 0 32 32 0 1 0 -64 0zm0 192c0 17.7 14.3 32 32 32s32-14.3 32-32-14.3-32-32-32-32 14.3-32 32z"
          />
          <path d="M224 64a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm32 64a64 64 0 1 0 0-128 64 64 0 1 0 0 128zm0 160a32 32 0 1 1 0-64 32 32 0 1 1 0 64zm64-32a64 64 0 1 0 -128 0 64 64 0 1 0 128 0zM256 416c17.7 0 32 14.3 32 32s-14.3 32-32 32-32-14.3-32-32 14.3-32 32-32zm64 32c0-35.3-28.7-64-64-64s-64 28.7-64 64 28.7 64 64 64 64-28.7 64-64zM64 416c17.7 0 32 14.3 32 32s-14.3 32-32 32-32-14.3-32-32 14.3-32 32-32zm64 32c0-35.3-28.7-64-64-64s-64 28.7-64 64 28.7 64 64 64 64-28.7 64-64zM32 256a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm32 64a64 64 0 1 0 0-128 64 64 0 1 0 0 128zM64 96a32 32 0 1 1 0-64 32 32 0 1 1 0 64zm64-32A64 64 0 1 0 0 64 64 64 0 1 0 128 64z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M320 64a64 64 0 1 1 -128 0 64 64 0 1 1 128 0zm0 192a64 64 0 1 1 -128 0 64 64 0 1 1 128 0zM192 448c0-35.3 28.7-64 64-64s64 28.7 64 64-28.7 64-64 64-64-28.7-64-64z"
          />
          <path d="M128 64A64 64 0 1 1 0 64 64 64 0 1 1 128 64zm0 192a64 64 0 1 1 -128 0 64 64 0 1 1 128 0zm0 192c0 35.3-28.7 64-64 64s-64-28.7-64-64 28.7-64 64-64 64 28.7 64 64z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M128 64A64 64 0 1 0 0 64 64 64 0 1 0 128 64zm0 192a64 64 0 1 0 -128 0 64 64 0 1 0 128 0zM0 448c0 35.3 28.7 64 64 64s64-28.7 64-64-28.7-64-64-64-64 28.7-64 64zM320 64a64 64 0 1 0 -128 0 64 64 0 1 0 128 0zM192 256a64 64 0 1 0 128 0 64 64 0 1 0 -128 0zM320 448c0-35.3-28.7-64-64-64s-64 28.7-64 64 28.7 64 64 64 64-28.7 64-64z" />
      )}
    </svg>
  );
}
