import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `angle-left`, in twelve styles (Duotone Light is the default), as `variant` says. Its Duotone Solid drawing
 * is a single layer, drawn at full strength: at 40 % it would read as switched
 * off.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function AngleLeftIcon({ className, variant = "duotone-light" }: IconProps) {
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
        <path d="M20.7 267.3c-6.2-6.2-6.2-16.4 0-22.6l160-160c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6L54.6 256 203.3 404.7c6.2 6.2 6.2 16.4 0 22.6s-16.4 6.2-22.6 0l-160-160z" />
      )}
      {variant === "duotone-solid" && (
        <path d="M9.4 278.6c-12.5-12.5-12.5-32.8 0-45.3l160-160c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3L77.3 256 214.6 393.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0l-160-160z" />
      )}
      {variant === "classic-solid" && (
        <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z" />
      )}
      {variant === "classic-light" && (
        <path d="M20.7 267.3c-6.2-6.2-6.2-16.4 0-22.6l160-160c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6L54.6 256 203.3 404.7c6.2 6.2 6.2 16.4 0 22.6s-16.4 6.2-22.6 0l-160-160z" />
      )}
      {variant === "sharp-duotone-light" && (
        <path d="M9.5 256l11.3-11.3 160-160 11.3-11.3 22.6 22.6-11.3 11.3-148.7 148.7 148.7 148.7 11.3 11.3-22.6 22.6-11.3-11.3-160-160-11.3-11.3z" />
      )}
      {variant === "sharp-light" && (
        <path d="M9.5 256l11.3-11.3 160-160 11.3-11.3 22.6 22.6-11.3 11.3-148.7 148.7 148.7 148.7 11.3 11.3-22.6 22.6-11.3-11.3-160-160-11.3-11.3z" />
      )}
      {variant === "classic-regular" && (
        <path d="M15.5 239c-9.4 9.4-9.4 24.6 0 33.9l160 160c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-143-143 143-143c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0L15.5 239z" />
      )}
      {variant === "duotone-regular" && (
        <path d="M15.5 239c-9.4 9.4-9.4 24.6 0 33.9l160 160c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-143-143 143-143c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0L15.5 239z" />
      )}
      {variant === "sharp-solid" && (
        <path d="M19 256l22.6 22.6 160 160 22.6 22.6 45.3-45.3-160-160 137.4-137.4 22.6-22.6-45.3-45.3-22.6 22.6-160 160-22.6 22.6z" />
      )}
      {variant === "sharp-duotone-solid" && (
        <path
          opacity=".4"
          d="M19 256l22.6-22.6 160-160 22.6-22.6 45.3 45.3-22.6 22.6-137.4 137.4 160 160-45.3 45.3-22.6-22.6-160-160-22.6-22.6z"
        />
      )}
      {variant === "sharp-regular" && (
        <path d="M-1.5 256l17-17 160-160 17-17 33.9 33.9-17 17-143 143 143 143 17 17-33.9 33.9-17-17-160-160-17-17z" />
      )}
      {variant === "sharp-duotone-regular" && (
        <path d="M-1.5 256l17-17 160-160 17-17 33.9 33.9-17 17-143 143 143 143 17 17-33.9 33.9-17-17-160-160-17-17z" />
      )}
    </svg>
  );
}
