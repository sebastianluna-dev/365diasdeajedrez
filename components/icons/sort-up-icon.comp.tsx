import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `sort-up`, in Duotone Light (the default), Duotone Solid,
 * Classic Solid or Classic Light, as `variant` says. Its Duotone Solid drawing
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
    </svg>
  );
}
