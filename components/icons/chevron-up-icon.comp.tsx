import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `chevron-up`, in twelve styles (Duotone Light is the default), as `variant` says. Its Duotone Solid drawing
 * is a single layer, drawn at full strength: at 40 % it would read as switched
 * off.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ChevronUpIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox={
        {
          "duotone-light": "-117.33 -85.33 682.67 682.67",
          "duotone-solid": "-117.33 -85.33 682.67 682.67",
          "classic-solid": "-117.33 -85.33 682.67 682.67",
          "classic-light": "-117.33 -85.33 682.67 682.67",
          "sharp-duotone-light": "-117.33 -85.33 682.67 682.67",
          "sharp-light": "-117.33 -85.33 682.67 682.67",
          "classic-regular": "-117.33 -85.33 682.67 682.67",
          "duotone-regular": "-117.33 -85.33 682.67 682.67",
          "sharp-solid": "-85.33 -85.33 682.67 682.67",
          "sharp-duotone-solid": "-85.33 -85.33 682.67 682.67",
          "sharp-regular": "-85.33 -85.33 682.67 682.67",
          "sharp-duotone-regular": "-85.33 -85.33 682.67 682.67",
        }[variant]
      }
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "duotone-light" && (
        <path d="M212.7 100.7c6.2-6.2 16.4-6.2 22.6 0l208 208c6.2 6.2 6.2 16.4 0 22.6s-16.4 6.2-22.6 0L224 134.6 27.3 331.3c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l208-208z" />
      )}
      {variant === "duotone-solid" && (
        <path d="M201.4 105.4c12.5-12.5 32.8-12.5 45.3 0l192 192c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L224 173.3 54.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l192-192z" />
      )}
      {variant === "classic-solid" && (
        <path d="M201.4 105.4c12.5-12.5 32.8-12.5 45.3 0l192 192c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L224 173.3 54.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l192-192z" />
      )}
      {variant === "classic-light" && (
        <path d="M212.7 100.7c6.2-6.2 16.4-6.2 22.6 0l208 208c6.2 6.2 6.2 16.4 0 22.6s-16.4 6.2-22.6 0L224 134.6 27.3 331.3c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l208-208z" />
      )}
      {variant === "sharp-duotone-light" && (
        <path d="M224.1 89.4l11.3 11.3 208 208 11.3 11.3-22.6 22.6-11.3-11.3-196.7-196.7-196.7 196.7-11.3 11.3-22.6-22.6 11.3-11.3 208-208 11.3-11.3z" />
      )}
      {variant === "sharp-light" && (
        <path d="M224.1 89.4l11.3 11.3 208 208 11.3 11.3-22.6 22.6-11.3-11.3-196.7-196.7-196.7 196.7-11.3 11.3-22.6-22.6 11.3-11.3 208-208 11.3-11.3z" />
      )}
      {variant === "classic-regular" && (
        <path d="M207.5 103c9.4-9.4 24.6-9.4 33.9 0l200 200c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-183-183-183 183c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l200-200z" />
      )}
      {variant === "duotone-regular" && (
        <path d="M207.5 103c9.4-9.4 24.6-9.4 33.9 0l200 200c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-183-183-183 183c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l200-200z" />
      )}
      {variant === "sharp-solid" && (
        <path d="M256.3 82.7l22.6 22.6 214.6 214.6-45.3 45.3-22.6-22.6-169.4-169.4-169.4 169.4-22.6 22.6-45.3-45.3 22.6-22.6 192-192 22.6-22.6z" />
      )}
      {variant === "sharp-duotone-solid" && (
        <path
          opacity=".4"
          d="M256.3 82.7l22.6 22.6 214.6 214.6-45.3 45.3-22.6-22.6-169.4-169.4-169.4 169.4-22.6 22.6-45.3-45.3 22.6-22.6 192-192 22.6-22.6z"
        />
      )}
      {variant === "sharp-regular" && (
        <path d="M256.4 86.1l17 17 200 200 17 17-33.9 33.9-17-17-183-183-183 183-17 17-33.9-33.9 17-17 200-200 17-17z" />
      )}
      {variant === "sharp-duotone-regular" && (
        <path d="M256.4 86.1l17 17 200 200 17 17-33.9 33.9-17-17-183-183-183 183-17 17-33.9-33.9 17-17 200-200 17-17z" />
      )}
    </svg>
  );
}
