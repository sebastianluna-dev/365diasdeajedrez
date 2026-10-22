import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `tablet-screen-button`, in Duotone Light (the default),
 * Duotone Solid, Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function TabletScreenButtonIcon({ className, variant = "duotone-light" }: IconProps) {
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
          <path opacity=".4" d="M32 64l0 256 384 0 0-256c0-17.7-14.3-32-32-32L64 32C46.3 32 32 46.3 32 64z" />
          <path d="M32 448c0 17.7 14.3 32 32 32l320 0c17.7 0 32-14.3 32-32l0-96-384 0 0 96zm0-128l384 0 0-256c0-17.7-14.3-32-32-32L64 32C46.3 32 32 46.3 32 64l0 256zM0 64C0 28.7 28.7 0 64 0L384 0c35.3 0 64 28.7 64 64l0 384c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zM224 392a24 24 0 1 1 0 48 24 24 0 1 1 0-48z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M0 64C0 28.7 28.7 0 64 0L384 0c35.3 0 64 28.7 64 64l0 384c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zm64 0l0 288 320 0 0-288-320 0zM192 432a32 32 0 1 0 64 0 32 32 0 1 0 -64 0z"
          />
          <path d="M64 64l320 0 0 288-320 0z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M0 64C0 28.7 28.7 0 64 0L384 0c35.3 0 64 28.7 64 64l0 384c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zM256 432a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zM384 64l-320 0 0 288 320 0 0-288z" />
      )}
      {variant === "classic-light" && (
        <path d="M32 448c0 17.7 14.3 32 32 32l320 0c17.7 0 32-14.3 32-32l0-96-384 0 0 96zm0-128l384 0 0-256c0-17.7-14.3-32-32-32L64 32C46.3 32 32 46.3 32 64l0 256zM0 64C0 28.7 28.7 0 64 0L384 0c35.3 0 64 28.7 64 64l0 384c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zM224 392a24 24 0 1 1 0 48 24 24 0 1 1 0-48z" />
      )}
      {variant === "sharp-duotone-light" && (
        <>
          <path opacity=".4" d="M32 32l0 288 384 0 0-288-384 0z" />
          <path d="M32 480l384 0 0-128-384 0 0 128zm0-160l384 0 0-288-384 0 0 288zM0 0L448 0 448 512 0 512 0 0zM224 392a24 24 0 1 1 0 48 24 24 0 1 1 0-48z" />
        </>
      )}
      {variant === "sharp-light" && (
        <path d="M32 480l384 0 0-128-384 0 0 128zm0-160l384 0 0-288-384 0 0 288zM0 0L448 0 448 512 0 512 0 0zM224 392a24 24 0 1 1 0 48 24 24 0 1 1 0-48z" />
      )}
    </svg>
  );
}
