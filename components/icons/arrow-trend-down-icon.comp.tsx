import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `arrow-trend-down`, in Duotone Light (the default), Duotone
 * Solid, Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ArrowTrendDownIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="-53.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "duotone-light" && (
        <>
          <path
            opacity=".4"
            d="M0 112c0 4.1 1.6 8.2 4.7 11.3l176 176c6.2 6.2 16.4 6.2 22.6 0L320 182.6 521.4 384 384 384c-8.8 0-16 7.2-16 16s7.2 16 16 16l176 0c8.8 0 16-7.2 16-16l0 48c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 112z"
          />
          <path d="M368 400c0 8.8 7.2 16 16 16l176 0c8.8 0 16-7.2 16-16l0-176c0-8.8-7.2-16-16-16s-16 7.2-16 16l0 137.4-212.7-212.7c-6.2-6.2-16.4-6.2-22.6 0L192 265.4 27.3 100.7c-6.2-6.2-16.4-6.2-22.6 0s-6.2 16.4 0 22.6l176 176c6.2 6.2 16.4 6.2 22.6 0L320 182.6 521.4 384 384 384c-8.8 0-16 7.2-16 16z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M9.4 105.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0L320 205.3 466.7 352 512 352 512 306.7 342.6 137.4c-12.5-12.5-32.8-12.5-45.3 0L192 242.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0z"
          />
          <path d="M352 384c0 17.7 14.3 32 32 32l160 0c17.7 0 32-14.3 32-32l0-160c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 128-128 0c-17.7 0-32 14.3-32 32z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M384 352c-17.7 0-32 14.3-32 32s14.3 32 32 32l160 0c17.7 0 32-14.3 32-32l0-160c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 82.7-169.4-169.4c-12.5-12.5-32.8-12.5-45.3 0L192 242.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0L320 205.3 466.7 352 384 352z" />
      )}
      {variant === "classic-light" && (
        <path d="M368 400c0 8.8 7.2 16 16 16l176 0c8.8 0 16-7.2 16-16l0-176c0-8.8-7.2-16-16-16s-16 7.2-16 16l0 137.4-212.7-212.7c-6.2-6.2-16.4-6.2-22.6 0L192 265.4 27.3 100.7c-6.2-6.2-16.4-6.2-22.6 0s-6.2 16.4 0 22.6l176 176c6.2 6.2 16.4 6.2 22.6 0L320 182.6 521.4 384 384 384c-8.8 0-16 7.2-16 16z" />
      )}
    </svg>
  );
}
