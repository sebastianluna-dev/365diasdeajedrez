import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Forward one move, in the game viewer (in Classic Solid); also the arrow
 * after the site's call to log in. Font Awesome's `chevron-right`, in twelve styles (Duotone Light is the default), as `variant` says. Its
 * Duotone Solid drawing is a single layer, drawn at full strength: at 40 % it
 * would read as switched off.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ChevronRightIcon({ className, variant = "duotone-light" }: IconProps) {
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
        <path d="M315.3 244.7c6.2 6.2 6.2 16.4 0 22.6l-208 208c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6L281.4 256 84.7 59.3c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0l208 208z" />
      )}
      {variant === "duotone-solid" && (
        <path d="M311.1 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L243.2 256 73.9 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z" />
      )}
      {variant === "classic-solid" && (
        <path d="M311.1 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L243.2 256 73.9 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z" />
      )}
      {variant === "classic-light" && (
        <path d="M315.3 244.7c6.2 6.2 6.2 16.4 0 22.6l-208 208c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6L281.4 256 84.7 59.3c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0l208 208z" />
      )}
      {variant === "sharp-duotone-light" && (
        <path d="M326.8 256l-11.3 11.3-208 208-11.3 11.3-22.6-22.6 11.3-11.3 196.7-196.7-208-208 22.6-22.6 11.3 11.3 208 208 11.3 11.3z" />
      )}
      {variant === "sharp-light" && (
        <path d="M326.8 256l-11.3 11.3-208 208-11.3 11.3-22.6-22.6 11.3-11.3 196.7-196.7-208-208 22.6-22.6 11.3 11.3 208 208 11.3 11.3z" />
      )}
      {variant === "classic-regular" && (
        <path d="M313.5 239c9.4 9.4 9.4 24.6 0 33.9l-200 200c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l183-183-183-183c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l200 200z" />
      )}
      {variant === "duotone-regular" && (
        <path d="M313.5 239c9.4 9.4 9.4 24.6 0 33.9l-200 200c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l183-183-183-183c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l200 200z" />
      )}
      {variant === "sharp-solid" && (
        <path d="M317.5 256L294.9 278.6 102.9 470.6 80.3 493.3 35 448 57.6 425.4 227 256 57.6 86.6 35 64 80.3 18.7 102.9 41.4 294.9 233.4 317.5 256z" />
      )}
      {variant === "sharp-duotone-solid" && (
        <path
          opacity=".4"
          d="M317.5 256L294.9 278.6 102.9 470.6 80.3 493.3 35 448 57.6 425.4 227 256 57.6 86.6 35 64 80.3 18.7 102.9 41.4 294.9 233.4 317.5 256z"
        />
      )}
      {variant === "sharp-regular" && (
        <path d="M362.4 256l-17 17-200 200-17 17-33.9-33.9 17-17 183-183-183-183-17-17 33.9-33.9 17 17 200 200 17 17z" />
      )}
      {variant === "sharp-duotone-regular" && (
        <path d="M362.4 256l-17 17-200 200-17 17-33.9-33.9 17-17 183-183-183-183-17-17 33.9-33.9 17 17 200 200 17 17z" />
      )}
    </svg>
  );
}
