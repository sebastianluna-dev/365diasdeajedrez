import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `location-arrow`, in Duotone Light (the default), Duotone
 * Solid, Classic Solid or Classic Light, as `variant` says. Its Duotone Solid
 * drawing is a single layer, drawn at full strength: at 40 % it would read as
 * switched off.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function LocationArrowIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox={
        {
          "duotone-light": "-85.33 -85.33 682.67 682.67",
          "duotone-solid": "-85.33 -85.33 682.67 682.67",
          "classic-solid": "-85.33 -85.33 682.67 682.67",
          "classic-light": "-85.33 -85.33 682.67 682.67",
          "sharp-duotone-light": "-53.33 -85.33 682.67 682.67",
          "sharp-light": "-53.33 -85.33 682.67 682.67",
        }[variant]
      }
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "duotone-light" && (
        <>
          <path opacity=".4" d="M32 224l176.8 58.9c9.6 3.2 17.1 10.7 20.2 20.2L288 480 448 64 32 224z" />
          <path d="M208.8 282.9c9.6 3.2 17.1 10.7 20.2 20.2L288 480 448 64 32 224 208.8 282.9zM470.6 41.4c8.9 8.9 11.8 22.3 7.2 34.1l-160 416c-4.8 12.6-17.1 20.8-30.6 20.5s-25.4-9.1-29.6-21.9L198.7 313.3 21.9 254.4C9.1 250.1 .3 238.2 0 224.7S7.9 199 20.5 194.1l416-160c11.8-4.5 25.2-1.7 34.1 7.2z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <path d="M477.9 75.5c4.5-11.8 1.7-25.2-7.2-34.1s-22.3-11.8-34.1-7.2l-416 160C7.9 199-.3 211.2 0 224.7s9.1 25.4 21.9 29.6l176.8 58.9 58.9 176.8c4.3 12.8 16.1 21.6 29.6 21.9s25.7-7.9 30.6-20.5l160-416z" />
      )}
      {variant === "classic-solid" && (
        <path d="M477.9 75.5c4.5-11.8 1.7-25.2-7.2-34.1s-22.3-11.8-34.1-7.2l-416 160C7.9 199-.3 211.2 0 224.7s9.1 25.4 21.9 29.6l176.8 58.9 58.9 176.8c4.3 12.8 16.1 21.6 29.6 21.9s25.7-7.9 30.6-20.5l160-416z" />
      )}
      {variant === "classic-light" && (
        <path d="M208.8 282.9c9.6 3.2 17.1 10.7 20.2 20.2L288 480 448 64 32 224 208.8 282.9zM20.5 194.1l416-160c11.8-4.5 25.2-1.7 34.1 7.2s11.8 22.3 7.2 34.1l-160 416c-4.8 12.6-17.1 20.8-30.6 20.5s-25.4-9.1-29.6-21.9L198.7 313.3 21.9 254.4C9.1 250.1 .3 238.2 0 224.7S7.9 199 20.5 194.1z" />
      )}
      {variant === "sharp-duotone-light" && (
        <>
          <path opacity=".4" d="M105.8 222.1l145 51.8 14.3 5.1 5.1 14.3 51.8 145 147.9-364.1-364.1 147.9z" />
          <path d="M265 279l-14.3-5.1-145-51.8 364.1-147.9-147.9 364.1-51.8-145-5.1-14.3zM61.2 240.2L240 304c50.5 141.4 77.2 216.1 80 224L338.1 483.5 511.2 57.4 528 16 486.6 32.8 60.5 205.9 16 224 61.2 240.2z" />
        </>
      )}
      {variant === "sharp-light" && (
        <path d="M265 279l-14.3-5.1-145-51.8 364.1-147.9-147.9 364.1-51.8-145-5.1-14.3zM61.2 240.2L240 304c50.5 141.4 77.2 216.1 80 224L338.1 483.5 511.2 57.4 528 16 486.6 32.8 60.5 205.9 16 224 61.2 240.2z" />
      )}
    </svg>
  );
}
