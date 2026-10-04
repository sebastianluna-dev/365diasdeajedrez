import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Playing the board's autoplay and the site's reviews, which draw it Solid.
 * Font Awesome's `play`, in Duotone Light or, with `variant="solid"`, Duotone
 * Solid. Its Solid drawing is a single layer, drawn at full strength: at 40 %
 * it would read as switched off.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function PlayIcon({ className, variant = "light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="-117.33 -85.33 682.67 682.67"
      width="19"
      height="22"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "solid" ? (
        <path d="M91.2 36.9c-12.4-6.8-27.4-6.5-39.6 .7S32 57.9 32 72l0 368c0 14.1 7.5 27.2 19.6 34.4s27.2 7.5 39.6 .7l336-184c12.8-7 20.8-20.5 20.8-35.1s-8-28.1-20.8-35.1l-336-184z" />
      ) : (
        <>
          <path
            opacity=".4"
            d="M64 72l0 368c0 2.8 1.5 5.4 3.9 6.9s5.4 1.5 7.9 .1l336-184c2.6-1.4 4.2-4.1 4.2-7s-1.6-5.6-4.2-7L75.8 65c-2.5-1.4-5.5-1.3-7.9 .1S64 69.2 64 72z"
          />
          <path d="M51.6 37.6C39.5 44.8 32 57.9 32 72l0 368c0 14.1 7.5 27.2 19.6 34.4s27.2 7.5 39.6 .7l336-184c12.8-7 20.8-20.5 20.8-35.1s-8-28.1-20.8-35.1l-336-184c-12.4-6.8-27.4-6.5-39.6 .7zM75.8 65l336 184c2.6 1.4 4.2 4.1 4.2 7s-1.6 5.6-4.2 7L75.8 447c-2.5 1.4-5.5 1.3-7.9-.1S64 442.8 64 440L64 72c0-2.8 1.5-5.4 3.9-6.9s5.4-1.5 7.9-.1z" />
        </>
      )}
    </svg>
  );
}
