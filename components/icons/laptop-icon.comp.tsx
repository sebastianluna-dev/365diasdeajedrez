import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `laptop`, in Duotone Light (the default), Duotone Solid,
 * Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function LaptopIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="-21.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "duotone-light" && (
        <>
          <path
            opacity=".4"
            d="M32.5 400l575.1 0c-3.5 27.1-26.6 48-54.7 48L87.1 448c-28 0-51.2-20.9-54.7-48zM96 96c0-17.7 14.3-32 32-32l384 0c17.7 0 32 14.3 32 32l0 224-448 0 0-224z"
          />
          <path d="M512 64L128 64c-17.7 0-32 14.3-32 32l0 224-32 0 0-224c0-35.3 28.7-64 64-64l384 0c35.3 0 64 28.7 64 64l0 224-32 0 0-224c0-17.7-14.3-32-32-32zM87.1 448l465.8 0c28 0 51.2-20.9 54.7-48L32.5 400c3.5 27.1 26.6 48 54.7 48zM0 392.9C0 379.1 11.1 368 24.9 368l590.2 0c13.7 0 24.9 11.1 24.9 24.9 0 48.1-39 87.1-87.1 87.1L87.1 480C39 480 0 441 0 392.9z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M0 403.2C0 445.6 34.4 480 76.8 480l486.4 0c42.4 0 76.8-34.4 76.8-76.8 0-10.6-8.6-19.2-19.2-19.2L19.2 384C8.6 384 0 392.6 0 403.2zM64 96l0 240 64 0 0-240 384 0 0 240 64 0 0-240c0-35.3-28.7-64-64-64L128 32C92.7 32 64 60.7 64 96z"
          />
          <path d="M128 96l384 0 0 240-384 0 0-240z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M128 32C92.7 32 64 60.7 64 96l0 240 64 0 0-240 384 0 0 240 64 0 0-240c0-35.3-28.7-64-64-64L128 32zM19.2 384C8.6 384 0 392.6 0 403.2 0 445.6 34.4 480 76.8 480l486.4 0c42.4 0 76.8-34.4 76.8-76.8 0-10.6-8.6-19.2-19.2-19.2L19.2 384z" />
      )}
      {variant === "classic-light" && (
        <path d="M512 64L128 64c-17.7 0-32 14.3-32 32l0 224-32 0 0-224c0-35.3 28.7-64 64-64l384 0c35.3 0 64 28.7 64 64l0 224-32 0 0-224c0-17.7-14.3-32-32-32zM87.1 448l465.8 0c28 0 51.2-20.9 54.7-48L32.5 400c3.5 27.1 26.6 48 54.7 48zM0 392.9C0 379.1 11.1 368 24.9 368l590.2 0c13.7 0 24.9 11.1 24.9 24.9 0 48.1-39 87.1-87.1 87.1L87.1 480C39 480 0 441 0 392.9z" />
      )}
    </svg>
  );
}
