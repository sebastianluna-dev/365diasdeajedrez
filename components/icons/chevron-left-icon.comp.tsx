import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Back one move, in the game viewer, in Classic Solid. Font Awesome's `chevron-left`, in Duotone
 * Light (the default), Duotone Solid, Classic Solid or Classic Light, as
 * `variant` says. Its Duotone Solid drawing is a single layer, drawn at full
 * strength: at 40 % it would read as switched off.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ChevronLeftIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox={
        {
          "duotone-light": "-181.33 -85.33 682.67 682.67",
          "duotone-solid": "-181.33 -85.33 682.67 682.67",
          "classic-solid": "-181.33 -85.33 682.67 682.67",
          "classic-light": "-181.33 -85.33 682.67 682.67",
          "sharp-duotone-light": "-181.33 -85.33 682.67 682.67",
          "sharp-light": "-181.33 -85.33 682.67 682.67",
          "classic-regular": "-181.33 -85.33 682.67 682.67",
          "duotone-regular": "-181.33 -85.33 682.67 682.67",
          "sharp-solid": "-181.33 -85.33 682.67 682.67",
          "sharp-duotone-solid": "-181.33 -85.33 682.67 682.67",
          "sharp-regular": "-149.33 -85.33 682.67 682.67",
          "sharp-duotone-regular": "-149.33 -85.33 682.67 682.67",
        }[variant]
      }
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "duotone-light" && (
        <path d="M4.7 267.3c-6.2-6.2-6.2-16.4 0-22.6l208-208c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6L38.6 256 235.3 452.7c6.2 6.2 6.2 16.4 0 22.6s-16.4 6.2-22.6 0l-208-208z" />
      )}
      {variant === "duotone-solid" && (
        <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z" />
      )}
      {variant === "classic-solid" && (
        <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z" />
      )}
      {variant === "classic-light" && (
        <path d="M4.7 267.3c-6.2-6.2-6.2-16.4 0-22.6l208-208c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6L38.6 256 235.3 452.7c6.2 6.2 6.2 16.4 0 22.6s-16.4 6.2-22.6 0l-208-208z" />
      )}
      {variant === "sharp-duotone-light" && (
        <path d="M-6.5 256l11.3-11.3 208-208 11.3-11.3 22.6 22.6-11.3 11.3-196.7 196.7 196.7 196.7 11.3 11.3-22.6 22.6-11.3-11.3-208-208-11.3-11.3z" />
      )}
      {variant === "sharp-light" && (
        <path d="M-6.5 256l11.3-11.3 208-208 11.3-11.3 22.6 22.6-11.3 11.3-196.7 196.7 196.7 196.7 11.3 11.3-22.6 22.6-11.3-11.3-208-208-11.3-11.3z" />
      )}
      {variant === "classic-regular" && (
        <path d="M7.5 239c-9.4 9.4-9.4 24.6 0 33.9l200 200c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-183-183 183-183c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0L7.5 239z" />
      )}
      {variant === "duotone-regular" && (
        <path d="M7.5 239c-9.4 9.4-9.4 24.6 0 33.9l200 200c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-183-183 183-183c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0L7.5 239z" />
      )}
      {variant === "sharp-solid" && (
        <path d="M3 256l22.6 22.6 192 192 22.6 22.6 45.3-45.3-22.6-22.6-169.4-169.4 169.4-169.4 22.6-22.6-45.3-45.3-22.6 22.6-192 192-22.6 22.6z" />
      )}
      {variant === "sharp-duotone-solid" && (
        <path
          opacity=".4"
          d="M3 256l22.6 22.6 192 192 22.6 22.6 45.3-45.3-22.6-22.6-169.4-169.4 169.4-169.4 22.6-22.6-45.3-45.3-22.6 22.6-192 192-22.6 22.6z"
        />
      )}
      {variant === "sharp-regular" && (
        <path d="M22.5 256l17-17 200-200 17-17 33.9 33.9-17 17-183 183 183 183 17 17-33.9 33.9-17-17-200-200-17-17z" />
      )}
      {variant === "sharp-duotone-regular" && (
        <path d="M22.5 256l17-17 200-200 17-17 33.9 33.9-17 17-183 183 183 183 17 17-33.9 33.9-17-17-200-200-17-17z" />
      )}
    </svg>
  );
}
