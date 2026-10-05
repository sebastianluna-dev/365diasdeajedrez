import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `door-open`, in Duotone Light (the default), Duotone Solid,
 * Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function DoorOpenIcon({ className, variant = "duotone-light" }: IconProps) {
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
            d="M64 64l0 416 224 0 0-416c0-17.7-14.3-32-32-32L96 32C78.3 32 64 46.3 64 64zM248 248a24 24 0 1 1 -48 0 24 24 0 1 1 48 0z"
          />
          <path d="M96 32C78.3 32 64 46.3 64 64l0 416 224 0 0-416c0-17.7-14.3-32-32-32L96 32zm215.4 0c5.4 9.4 8.6 20.3 8.6 32l0 448-304 0c-8.8 0-16-7.2-16-16s7.2-16 16-16l16 0 0-416C32 28.7 60.7 0 96 0L352 0c35.3 0 64 28.7 64 64l0 416 16 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-432c0-17.7-14.3-32-32-32l-40.6 0zM248 248a24 24 0 1 1 -48 0 24 24 0 1 1 48 0z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M32 64C32 28.7 60.7 0 96 0L224 0c35.3 0 64 28.7 64 64l0 384-256 0 0-384zM160 256a32 32 0 1 0 64 0 32 32 0 1 0 -64 0z"
          />
          <path d="M288 64l64 0 0 416c0 17.7 14.3 32 32 32l32 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l0-384c0-35.3-28.7-64-64-64L224 0c35.3 0 64 28.7 64 64zM224 256a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zM32 448c-17.7 0-32 14.3-32 32s14.3 32 32 32l256 0 0-64-256 0z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M288 64l64 0 0 416c0 17.7 14.3 32 32 32l32 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l0-384c0-35.3-28.7-64-64-64l-96 0 0 0-160 0C60.7 0 32 28.7 32 64l0 384c-17.7 0-32 14.3-32 32s14.3 32 32 32l224 0c17.7 0 32-14.3 32-32l0-416zM160 256a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z" />
      )}
      {variant === "classic-light" && (
        <path d="M96 32C78.3 32 64 46.3 64 64l0 416 224 0 0-416c0-17.7-14.3-32-32-32L96 32zm215.4 0c5.4 9.4 8.6 20.3 8.6 32l0 448-304 0c-8.8 0-16-7.2-16-16s7.2-16 16-16l16 0 0-416C32 28.7 60.7 0 96 0L352 0c35.3 0 64 28.7 64 64l0 416 16 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-432c0-17.7-14.3-32-32-32l-40.6 0zM248 248a24 24 0 1 1 -48 0 24 24 0 1 1 48 0z" />
      )}
    </svg>
  );
}
