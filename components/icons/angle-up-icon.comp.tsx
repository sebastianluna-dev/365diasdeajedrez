import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `angle-up`, in twelve styles (Duotone Light is the default), as `variant` says. Its Duotone Solid drawing
 * is a single layer, drawn at full strength: at 40 % it would read as switched
 * off.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function AngleUpIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox={
        {
          "duotone-light": "-149.33 -85.33 682.67 682.67",
          "duotone-solid": "-149.33 -85.33 682.67 682.67",
          "classic-solid": "-149.33 -85.33 682.67 682.67",
          "classic-light": "-149.33 -85.33 682.67 682.67",
          "sharp-duotone-light": "-149.33 -85.33 682.67 682.67",
          "sharp-light": "-149.33 -85.33 682.67 682.67",
          "classic-regular": "-149.33 -85.33 682.67 682.67",
          "duotone-regular": "-149.33 -85.33 682.67 682.67",
          "sharp-solid": "-117.33 -85.33 682.67 682.67",
          "sharp-duotone-solid": "-117.33 -85.33 682.67 682.67",
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
        <path d="M180.7 148.7c6.2-6.2 16.4-6.2 22.6 0l160 160c6.2 6.2 6.2 16.4 0 22.6s-16.4 6.2-22.6 0L192 182.6 43.3 331.3c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l160-160z" />
      )}
      {variant === "duotone-solid" && (
        <path d="M169.4 137.4c12.5-12.5 32.8-12.5 45.3 0l160 160c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L192 205.3 54.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l160-160z" />
      )}
      {variant === "classic-solid" && (
        <path d="M169.4 137.4c12.5-12.5 32.8-12.5 45.3 0l160 160c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L192 205.3 54.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l160-160z" />
      )}
      {variant === "classic-light" && (
        <path d="M180.7 148.7c6.2-6.2 16.4-6.2 22.6 0l160 160c6.2 6.2 6.2 16.4 0 22.6s-16.4 6.2-22.6 0L192 182.6 43.3 331.3c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l160-160z" />
      )}
      {variant === "sharp-duotone-light" && (
        <path d="M192.1 137.4l11.3 11.3 160 160 11.3 11.3-22.6 22.6-11.3-11.3-148.7-148.7-148.7 148.7-11.3 11.3-22.6-22.6 11.3-11.3 160-160 11.3-11.3z" />
      )}
      {variant === "sharp-light" && (
        <path d="M192.1 137.4l11.3 11.3 160 160 11.3 11.3-22.6 22.6-11.3-11.3-148.7-148.7-148.7 148.7-11.3 11.3-22.6-22.6 11.3-11.3 160-160 11.3-11.3z" />
      )}
      {variant === "classic-regular" && (
        <path d="M175.5 143c9.4-9.4 24.6-9.4 33.9 0l160 160c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-143-143-143 143c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l160-160z" />
      )}
      {variant === "duotone-regular" && (
        <path d="M175.5 143c9.4-9.4 24.6-9.4 33.9 0l160 160c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-143-143-143 143c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l160-160z" />
      )}
      {variant === "sharp-solid" && (
        <path d="M224.3 114.7l22.6 22.6 182.6 182.6-45.3 45.3-22.6-22.6-137.4-137.4-137.4 137.4-22.6 22.6-45.3-45.3 22.6-22.6 160-160 22.6-22.6z" />
      )}
      {variant === "sharp-duotone-solid" && (
        <path
          opacity=".4"
          d="M224.3 114.7l22.6 22.6 182.6 182.6-45.3 45.3-22.6-22.6-137.4-137.4-137.4 137.4-22.6 22.6-45.3-45.3 22.6-22.6 160-160 22.6-22.6z"
        />
      )}
      {variant === "sharp-regular" && (
        <path d="M192.4 126.1l17 17 160 160 17 17-33.9 33.9-17-17-143-143-143 143-17 17-33.9-33.9 17-17 160-160 17-17z" />
      )}
      {variant === "sharp-duotone-regular" && (
        <path d="M192.4 126.1l17 17 160 160 17 17-33.9 33.9-17-17-143-143-143 143-17 17-33.9-33.9 17-17 160-160 17-17z" />
      )}
    </svg>
  );
}
