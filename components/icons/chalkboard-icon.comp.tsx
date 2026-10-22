import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `chalkboard`, in Duotone Light (the default), Duotone Solid,
 * Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ChalkboardIcon({ className, variant = "duotone-light" }: IconProps) {
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
            d="M64 120c0-13.3 10.7-24 24-24l400 0c13.3 0 24 10.7 24 24l0 296-64 0 0-48c0-26.5-21.5-48-48-48l-96 0c-26.5 0-48 21.5-48 48l0 48-192 0 0-296z"
          />
          <path d="M64 120l0 296 192 0 0-48c0-26.5 21.5-48 48-48l96 0c26.5 0 48 21.5 48 48l0 48 64 0 0-296c0-13.3-10.7-24-24-24L88 96c-13.3 0-24 10.7-24 24zM32 416l0-296c0-30.9 25.1-56 56-56l400 0c30.9 0 56 25.1 56 56l0 296 16 0c8.8 0 16 7.2 16 16s-7.2 16-16 16L16 448c-8.8 0-16-7.2-16-16s7.2-16 16-16l16 0zm384-48c0-8.8-7.2-16-16-16l-96 0c-8.8 0-16 7.2-16 16l0 48 128 0 0-48z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M96 128l0 256 160 0 0-32c0-17.7 14.3-32 32-32l96 0c17.7 0 32 14.3 32 32l0 32 64 0 0-256-384 0z"
          />
          <path d="M96 64c-35.3 0-64 28.7-64 64l0 256c-17.7 0-32 14.3-32 32s14.3 32 32 32l512 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l0-256c0-35.3-28.7-64-64-64L96 64zM480 384l-384 0 0-256 384 0 0 256z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M96 64c-35.3 0-64 28.7-64 64l0 256c-17.7 0-32 14.3-32 32s14.3 32 32 32l512 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l0-256c0-35.3-28.7-64-64-64L96 64zM480 384l-64 0 0-32c0-17.7-14.3-32-32-32l-96 0c-17.7 0-32 14.3-32 32l0 32-160 0 0-256 384 0 0 256z" />
      )}
      {variant === "classic-light" && (
        <path d="M64 120l0 296 192 0 0-48c0-26.5 21.5-48 48-48l96 0c26.5 0 48 21.5 48 48l0 48 64 0 0-296c0-13.3-10.7-24-24-24L88 96c-13.3 0-24 10.7-24 24zM32 416l0-296c0-30.9 25.1-56 56-56l400 0c30.9 0 56 25.1 56 56l0 296 16 0c8.8 0 16 7.2 16 16s-7.2 16-16 16L16 448c-8.8 0-16-7.2-16-16s7.2-16 16-16l16 0zm384-48c0-8.8-7.2-16-16-16l-96 0c-8.8 0-16 7.2-16 16l0 48 128 0 0-48z" />
      )}
      {variant === "sharp-duotone-light" && (
        <>
          <path opacity=".4" d="M64 96l0 320 192 0 0-96 192 0 0 96 64 0 0-320-448 0z" />
          <path d="M48 64l-16 0 0 352-32 0 0 32 576 0 0-32-32 0 0-352-496 0zM512 416l-64 0 0-96-192 0 0 96-192 0 0-320 448 0 0 320zm-96-64l0 64-128 0 0-64 128 0z" />
        </>
      )}
      {variant === "sharp-light" && (
        <path d="M48 64l-16 0 0 352-32 0 0 32 576 0 0-32-32 0 0-352-496 0zM512 416l-64 0 0-96-192 0 0 96-192 0 0-320 448 0 0 320zm-96-64l0 64-128 0 0-64 128 0z" />
      )}
    </svg>
  );
}
