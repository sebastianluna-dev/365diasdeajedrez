import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `sort-up`, in twelve styles (Duotone Light is the default), as `variant` says. Its Duotone Solid drawing
 * is a single layer, drawn at full strength: at 40 % it would read as switched
 * off.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function SortUpIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox={
        {
          "duotone-light": "-149.33 -85.33 682.67 682.67",
          "duotone-solid": "-149.33 -85.33 682.67 682.67",
          "classic-solid": "-149.33 -85.33 682.67 682.67",
          "classic-light": "-149.33 -85.33 682.67 682.67",
          "sharp-duotone-light": "-117.33 -85.33 682.67 682.67",
          "sharp-light": "-117.33 -85.33 682.67 682.67",
          "classic-regular": "-149.33 -85.33 682.67 682.67",
          "duotone-regular": "-149.33 -85.33 682.67 682.67",
          "sharp-solid": "-117.33 -85.33 682.67 682.67",
          "sharp-duotone-solid": "-117.33 -85.33 682.67 682.67",
          "sharp-regular": "-117.33 -85.33 682.67 682.67",
          "sharp-duotone-regular": "-117.33 -85.33 682.67 682.67",
        }[variant]
      }
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "duotone-light" && (
        <>
          <path opacity=".4" d="M32 192L352 192 192 32 32 192z" />
          <path d="M192 32L352 192 32 192 192 32zM2.4 204.3c5 12 16.6 19.8 29.6 19.8l320 0c12.9 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-160-160c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-9.2 9.2-11.9 22.9-6.9 34.9z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <path d="M32 224c-12.9 0-24.6-7.8-29.6-19.8S.2 178.5 9.4 169.4l160-160c12.5-12.5 32.8-12.5 45.3 0l160 160c9.2 9.2 11.9 22.9 6.9 34.9S364.9 224 352 224L32 224z" />
      )}
      {variant === "classic-solid" && (
        <path d="M32 224c-12.9 0-24.6-7.8-29.6-19.8S.2 178.5 9.4 169.4l160-160c12.5-12.5 32.8-12.5 45.3 0l160 160c9.2 9.2 11.9 22.9 6.9 34.9S364.9 224 352 224L32 224z" />
      )}
      {variant === "classic-light" && (
        <path d="M192 32L352 192 32 192 192 32zM2.4 204.3c5 12 16.6 19.8 29.6 19.8l320 0c12.9 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-160-160c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-9.2 9.2-11.9 22.9-6.9 34.9z" />
      )}
      {variant === "sharp-duotone-light" && (
        <>
          <path opacity=".4" d="M81.5 192L224 39 366.5 192 81.5 192z" />
          <path d="M37.8 192L8 224 440 224 410.2 192 245.9 15.5 224-8 202.1 15.5 37.8 192zm43.7 0L224 39 366.5 192 81.5 192z" />
        </>
      )}
      {variant === "sharp-light" && (
        <path d="M37.8 192L8 224 440 224 410.2 192 245.9 15.5 224-8 202.1 15.5 37.8 192zm43.7 0L224 39 366.5 192 81.5 192z" />
      )}
      {variant === "classic-regular" && (
        <path d="M70.6 176L192 54.6 313.4 176 70.6 176zM2.4 204.2c5 12 16.6 19.8 29.6 19.8l320 0c12.9 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-160-160c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-9.2 9.2-11.9 22.9-6.9 34.9z" />
      )}
      {variant === "duotone-regular" && (
        <>
          <path opacity=".4" d="M70.6 176L190.3 56.3c1-.2 2-.3 3-.3l120 120-242.7 0z" />
          <path d="M70.6 176L192 54.6 313.4 176 70.6 176zM2.4 204.2c5 12 16.6 19.8 29.6 19.8l320 0c12.9 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-160-160c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-9.2 9.2-11.9 22.9-6.9 34.9z" />
        </>
      )}
      {variant === "sharp-solid" && <path d="M8 224L224-8 440 224 8 224z" />}
      {variant === "sharp-duotone-solid" && <path d="M8 224L224-8 440 224 8 224z" />}
      {variant === "sharp-regular" && (
        <path d="M52.7 176L8 224 440 224c-14.2-15.2-75.2-80.8-183.2-196.8L224-8c-4.2 4.5-61.4 65.9-171.3 184zm65.6 0L224 62.4 329.7 176 118.3 176z" />
      )}
      {variant === "sharp-duotone-regular" && (
        <>
          <path opacity=".4" d="M118.3 176l96.7-103.9 9-8.1 8.9 8 96.8 104-211.5 0z" />
          <path d="M52.7 176L8 224 440 224c-14.2-15.2-75.2-80.8-183.2-196.8L224-8c-4.2 4.5-61.4 65.9-171.3 184zm65.6 0L224 62.4 329.7 176 118.3 176z" />
        </>
      )}
    </svg>
  );
}
