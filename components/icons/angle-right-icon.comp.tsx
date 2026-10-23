import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * The short chevron, pointing right; its callers turn it for what opens and
 * closes (the select, the date picker, the engine panel, the site's dropdown).
 * Font Awesome's `angle-right`, in twelve styles (Duotone Light is the default), as `variant` says. Its Duotone Solid drawing
 * is a single layer, drawn at full strength: at 40 % it would read as switched
 * off.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function AngleRightIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox={
        {
          "duotone-light": "-213.33 -85.33 682.67 682.67",
          "duotone-solid": "-213.33 -85.33 682.67 682.67",
          "classic-solid": "-213.33 -85.33 682.67 682.67",
          "classic-light": "-213.33 -85.33 682.67 682.67",
          "sharp-duotone-light": "-213.33 -85.33 682.67 682.67",
          "sharp-light": "-213.33 -85.33 682.67 682.67",
          "classic-regular": "-213.33 -85.33 682.67 682.67",
          "duotone-regular": "-213.33 -85.33 682.67 682.67",
          "sharp-solid": "-181.33 -85.33 682.67 682.67",
          "sharp-duotone-solid": "-181.33 -85.33 682.67 682.67",
          "sharp-regular": "-213.33 -85.33 682.67 682.67",
          "sharp-duotone-regular": "-213.33 -85.33 682.67 682.67",
        }[variant]
      }
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "duotone-light" && (
        <path d="M235.3 244.7c6.2 6.2 6.2 16.4 0 22.6l-160 160c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6L201.4 256 52.7 107.3c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0l160 160z" />
      )}
      {variant === "duotone-solid" && (
        <path d="M247.1 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L179.2 256 41.9 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z" />
      )}
      {variant === "classic-solid" && (
        <path d="M247.1 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L179.2 256 41.9 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z" />
      )}
      {variant === "classic-light" && (
        <path d="M235.3 244.7c6.2 6.2 6.2 16.4 0 22.6l-160 160c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6L201.4 256 52.7 107.3c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0l160 160z" />
      )}
      {variant === "sharp-duotone-light" && (
        <path d="M246.8 256l-11.3 11.3-160 160-11.3 11.3-22.6-22.6 11.3-11.3 148.7-148.7-148.7-148.7-11.3-11.3 22.6-22.6 11.3 11.3 160 160 11.3 11.3z" />
      )}
      {variant === "sharp-light" && (
        <path d="M246.8 256l-11.3 11.3-160 160-11.3 11.3-22.6-22.6 11.3-11.3 148.7-148.7-148.7-148.7-11.3-11.3 22.6-22.6 11.3 11.3 160 160 11.3 11.3z" />
      )}
      {variant === "classic-regular" && (
        <path d="M241.5 239c9.4 9.4 9.4 24.6 0 33.9L81.5 433c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l143-143-143-143c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l160 160z" />
      )}
      {variant === "duotone-regular" && (
        <path d="M241.5 239c9.4 9.4 9.4 24.6 0 33.9L81.5 433c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l143-143-143-143c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l160 160z" />
      )}
      {variant === "sharp-solid" && (
        <path d="M301.5 256L278.9 278.6 118.9 438.6 96.3 461.3 51 416 73.6 393.4 211 256 73.6 118.6 51 96 96.3 50.7 118.9 73.4 278.9 233.4 301.5 256z" />
      )}
      {variant === "sharp-duotone-solid" && (
        <path
          opacity=".4"
          d="M301.5 256L278.9 278.6 118.9 438.6 96.3 461.3 51 416 73.6 393.4 211 256 73.6 118.6 51 96 96.3 50.7 118.9 73.4 278.9 233.4 301.5 256z"
        />
      )}
      {variant === "sharp-regular" && (
        <path d="M258.4 256l-17 17-160 160-17 17-33.9-33.9 17-17 143-143-143-143-17-17 33.9-33.9 17 17 160 160 17 17z" />
      )}
      {variant === "sharp-duotone-regular" && (
        <path d="M258.4 256l-17 17-160 160-17 17-33.9-33.9 17-17 143-143-143-143-17-17 33.9-33.9 17 17 160 160 17 17z" />
      )}
    </svg>
  );
}
