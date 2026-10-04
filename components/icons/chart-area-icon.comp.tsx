import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `chart-area`, in Duotone Light (the default), Duotone Solid
 * or Classic Solid, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ChartAreaIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="-85.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "duotone-light" && (
        <>
          <path
            opacity=".4"
            d="M128 254l0 98 320 0 0-132.7-56-56-40.6 40.6c-6.2 6.2-14.6 9.6-23.3 9.4s-17-3.9-22.9-10.4L240 131.8 128 254z"
          />
          <path d="M32 48c0-8.8-7.2-16-16-16S0 39.2 0 48L0 400c0 44.2 35.8 80 80 80l416 0c8.8 0 16-7.2 16-16s-7.2-16-16-16L80 448c-26.5 0-48-21.5-48-48L32 48zM305.2 202.9c5.9 6.4 14.2 10.2 22.9 10.4s17.2-3.2 23.3-9.4l40.6-40.6 56 56 0 132.7-320 0 0-98 112-122.2 65.2 71.1zm23.6-21.6c-9.8-10.7-33.5-36.5-71.1-77.5-4.5-5-11-7.8-17.7-7.8s-13.1 2.8-17.7 7.8l-120 130.9c-4.1 4.4-6.3 10.2-6.3 16.2L96 360c0 13.3 10.7 24 24 24l336 0c13.3 0 24-10.7 24-24l0-144c0-6.4-2.5-12.5-7-17l-64-64c-9.4-9.4-24.6-9.4-33.9 0-15.9 15.9-31.3 31.3-46.3 46.3z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M0 64L0 400c0 44.2 35.8 80 80 80l400 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L80 416c-8.8 0-16-7.2-16-16L64 64c0-17.7-14.3-32-32-32S0 46.3 0 64z"
          />
          <path d="M257.7 103.8c-4.5-5-11-7.8-17.7-7.8s-13.1 2.8-17.7 7.8l-88 96c-4.1 4.4-6.3 10.2-6.3 16.2l0 112c0 13.3 10.7 24 24 24l304 0c13.3 0 24-10.7 24-24l0-112c0-6.4-2.5-12.5-7-17l-64-64c-9.4-9.4-24.6-9.4-33.9 0l-46.3 46.3-71.1-77.5z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M32 32c17.7 0 32 14.3 32 32l0 336c0 8.8 7.2 16 16 16l400 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L80 480c-44.2 0-80-35.8-80-80L0 64C0 46.3 14.3 32 32 32zM240 96c6.7 0 13.1 2.8 17.7 7.8L328.8 181.3 375 135c9.4-9.4 24.6-9.4 33.9 0l64 64c4.5 4.5 7 10.6 7 17l0 112c0 13.3-10.7 24-24 24l-304 0c-13.3 0-24-10.7-24-24l0-112c0-6 2.3-11.8 6.3-16.2l88-96c4.5-5 11-7.8 17.7-7.8z" />
      )}
    </svg>
  );
}
