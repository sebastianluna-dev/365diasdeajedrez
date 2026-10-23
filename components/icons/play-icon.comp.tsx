import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Playing the board's autoplay and the site's reviews, which draw it in
 * Duotone Solid. Font Awesome's `play`, in twelve styles (Duotone Light is the default), as `variant` says. Its
 * Duotone Solid drawing is a single layer, drawn at full strength: at 40 % it
 * would read as switched off.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function PlayIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox={
        {
          "duotone-light": "-117.33 -85.33 682.67 682.67",
          "duotone-solid": "-117.33 -85.33 682.67 682.67",
          "classic-solid": "-117.33 -85.33 682.67 682.67",
          "classic-light": "-117.33 -85.33 682.67 682.67",
          "sharp-duotone-light": "-85.33 -85.33 682.67 682.67",
          "sharp-light": "-85.33 -85.33 682.67 682.67",
          "classic-regular": "-117.33 -85.33 682.67 682.67",
          "duotone-regular": "-117.33 -85.33 682.67 682.67",
          "sharp-solid": "-85.33 -85.33 682.67 682.67",
          "sharp-duotone-solid": "-85.33 -85.33 682.67 682.67",
          "sharp-regular": "-85.33 -85.33 682.67 682.67",
          "sharp-duotone-regular": "-85.33 -85.33 682.67 682.67",
        }[variant]
      }
      width="19"
      height="22"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "duotone-light" && (
        <>
          <path
            opacity=".4"
            d="M64 72l0 368c0 2.8 1.5 5.4 3.9 6.9s5.4 1.5 7.9 .1l336-184c2.6-1.4 4.2-4.1 4.2-7s-1.6-5.6-4.2-7L75.8 65c-2.5-1.4-5.5-1.3-7.9 .1S64 69.2 64 72z"
          />
          <path d="M51.6 37.6C39.5 44.8 32 57.9 32 72l0 368c0 14.1 7.5 27.2 19.6 34.4s27.2 7.5 39.6 .7l336-184c12.8-7 20.8-20.5 20.8-35.1s-8-28.1-20.8-35.1l-336-184c-12.4-6.8-27.4-6.5-39.6 .7zM75.8 65l336 184c2.6 1.4 4.2 4.1 4.2 7s-1.6 5.6-4.2 7L75.8 447c-2.5 1.4-5.5 1.3-7.9-.1S64 442.8 64 440L64 72c0-2.8 1.5-5.4 3.9-6.9s5.4-1.5 7.9-.1z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <path d="M91.2 36.9c-12.4-6.8-27.4-6.5-39.6 .7S32 57.9 32 72l0 368c0 14.1 7.5 27.2 19.6 34.4s27.2 7.5 39.6 .7l336-184c12.8-7 20.8-20.5 20.8-35.1s-8-28.1-20.8-35.1l-336-184z" />
      )}
      {variant === "classic-solid" && (
        <path d="M91.2 36.9c-12.4-6.8-27.4-6.5-39.6 .7S32 57.9 32 72l0 368c0 14.1 7.5 27.2 19.6 34.4s27.2 7.5 39.6 .7l336-184c12.8-7 20.8-20.5 20.8-35.1s-8-28.1-20.8-35.1l-336-184z" />
      )}
      {variant === "classic-light" && (
        <path d="M51.6 37.6C39.5 44.8 32 57.9 32 72l0 368c0 14.1 7.5 27.2 19.6 34.4s27.2 7.5 39.6 .7l336-184c12.8-7 20.8-20.5 20.8-35.1s-8-28.1-20.8-35.1l-336-184c-12.4-6.8-27.4-6.5-39.6 .7zM75.8 65l336 184c2.6 1.4 4.2 4.1 4.2 7s-1.6 5.6-4.2 7L75.8 447c-2.5 1.4-5.5 1.3-7.9-.1S64 442.8 64 440L64 72c0-2.8 1.5-5.4 3.9-6.9s5.4-1.5 7.9-.1z" />
      )}
      {variant === "sharp-duotone-light" && (
        <>
          <path opacity=".4" d="M96 70.4L96 441.6 430.1 256 96 70.4z" />
          <path d="M64 459.4L64 496 96 478.2 463.1 274.3 496 256 463.1 237.7 96 33.8 64 16 64 459.4zm32-17.8L96 70.4 430.1 256 96 441.6z" />
        </>
      )}
      {variant === "sharp-light" && (
        <path d="M64 459.4L64 496 96 478.2 463.1 274.3 496 256 463.1 237.7 96 33.8 64 16 64 459.4zm32-17.8L96 70.4 430.1 256 96 441.6z" />
      )}
      {variant === "classic-regular" && (
        <path d="M51.6 37.6C39.5 44.8 32 57.9 32 72l0 368c0 14.1 7.5 27.2 19.6 34.4s27.2 7.5 39.6 .7l336-184c12.8-7 20.8-20.5 20.8-35.1s-8-28.1-20.8-35.1l-336-184c-12.4-6.8-27.4-6.5-39.6 .7zM80 426.5L80 85.5 391.3 256 80 426.5z" />
      )}
      {variant === "duotone-regular" && (
        <>
          <path opacity=".4" d="M80 85.5L391.3 256 80 426.5 80 85.5z" />
          <path d="M51.6 37.6C39.5 44.8 32 57.9 32 72l0 368c0 14.1 7.5 27.2 19.6 34.4s27.2 7.5 39.6 .7l336-184c12.8-7 20.8-20.5 20.8-35.1s-8-28.1-20.8-35.1l-336-184c-12.4-6.8-27.4-6.5-39.6 .7zM80 85.5L391.3 256 80 426.5 80 85.5z" />
        </>
      )}
      {variant === "sharp-solid" && <path d="M64 16L64 496 496 256 64 16z" />}
      {variant === "sharp-duotone-solid" && <path opacity=".4" d="M64 16L64 496 496 256 64 16z" />}
      {variant === "sharp-regular" && (
        <path d="M64 441.1L64 496 112 469.3 446.6 283.5 496 256 446.6 228.5 112 42.7 64 16 64 441.1zm48-26.7L112 97.6 397.2 256 112 414.4z" />
      )}
      {variant === "sharp-duotone-regular" && (
        <>
          <path opacity=".4" d="M112 97.6L112 414.4 397.2 256 112 97.6z" />
          <path d="M64 441.1L64 496 112 469.3 446.6 283.5 496 256 446.6 228.5 112 42.7 64 16 64 441.1zm48-26.7L112 97.6 397.2 256 112 414.4z" />
        </>
      )}
    </svg>
  );
}
