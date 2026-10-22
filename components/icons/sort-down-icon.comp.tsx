import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `sort-down`, in Duotone Light (the default), Duotone Solid,
 * Classic Solid or Classic Light, as `variant` says. Its Duotone Solid drawing
 * is a single layer, drawn at full strength: at 40 % it would read as switched
 * off.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function SortDownIcon({ className, variant = "duotone-light" }: IconProps) {
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
          <path opacity=".4" d="M32 320l160 160 160-160-320 0z" />
          <path d="M192 480l160-160-320 0 160 160zM2.4 307.8c5-12 16.6-19.8 29.6-19.8l320 0c12.9 0 24.6 7.8 29.6 19.8s2.2 25.7-6.9 34.9l-160 160c-12.5 12.5-32.8 12.5-45.3 0l-160-160c-9.2-9.2-11.9-22.9-6.9-34.9z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <path d="M32 288c-12.9 0-24.6 7.8-29.6 19.8S.2 333.5 9.4 342.6l160 160c12.5 12.5 32.8 12.5 45.3 0l160-160c9.2-9.2 11.9-22.9 6.9-34.9S364.9 288 352 288L32 288z" />
      )}
      {variant === "classic-solid" && (
        <path d="M32 288c-12.9 0-24.6 7.8-29.6 19.8S.2 333.5 9.4 342.6l160 160c12.5 12.5 32.8 12.5 45.3 0l160-160c9.2-9.2 11.9-22.9 6.9-34.9S364.9 288 352 288L32 288z" />
      )}
      {variant === "classic-light" && (
        <path d="M192 480l160-160-320 0 160 160zM2.4 307.8c5-12 16.6-19.8 29.6-19.8l320 0c12.9 0 24.6 7.8 29.6 19.8s2.2 25.7-6.9 34.9l-160 160c-12.5 12.5-32.8 12.5-45.3 0l-160-160c-9.2-9.2-11.9-22.9-6.9-34.9z" />
      )}
      {variant === "sharp-duotone-light" && (
        <>
          <path opacity=".4" d="M81.5 320l285 0-142.5 153-142.5-153z" />
          <path d="M37.8 320L8 288 440 288 410.2 320 245.9 496.5 224 520 202.1 496.5 37.8 320zm43.7 0l142.5 153 142.5-153-285 0z" />
        </>
      )}
      {variant === "sharp-light" && (
        <path d="M37.8 320L8 288 440 288 410.2 320 245.9 496.5 224 520 202.1 496.5 37.8 320zm43.7 0l142.5 153 142.5-153-285 0z" />
      )}
    </svg>
  );
}
