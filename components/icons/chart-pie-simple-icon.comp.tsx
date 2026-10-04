import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `chart-pie-simple`, in Duotone Light (the default), Duotone
 * Solid or Classic Solid, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ChartPieSimpleIcon({ className, variant = "duotone-light" }: IconProps) {
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
            d="M32 272c0-98.3 68.3-180.8 160-202.4L192 272c0 26.5 21.5 48 48 48l202.4 0C420.8 411.7 338.3 480 240 480 125.1 480 32 386.9 32 272z"
          />
          <path d="M304 208l0-173.6C393.2 48.2 463.8 118.8 477.6 208L304 208zm176 32c17.7 0 32.2-14.4 29.9-31.9-14.2-107-99-191.7-206-206-17.5-2.3-31.9 12.2-31.9 29.9l0 176c0 17.7 14.3 32 32 32l176 0zM32 272c0-98.3 68.3-180.8 160-202.4L192 272c0 26.5 21.5 48 48 48l202.4 0C420.8 411.7 338.3 480 240 480 125.1 480 32 386.9 32 272zM224 68.7C224 49.7 206.7 33.4 186.3 38 79.6 62.4 0 157.9 0 272 0 404.6 107.5 512 240 512 354.1 512 449.6 432.4 474 325.7 478.6 305.3 462.3 288 443.3 288L240 288c-8.8 0-16-7.2-16-16l0-203.3z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M0 272c0 132.5 107.5 240 240 240 115.5 0 211.9-81.5 234.8-190.2 3.8-18.1-11-33.8-29.5-33.8L248 288c-13.3 0-24-10.7-24-24l0-197.3C224 48.2 208.3 33.4 190.2 37.2 81.5 60.1 0 156.5 0 272z"
          />
          <path d="M480 240c17.7 0 32.2-14.4 29.9-31.9-14.2-107-99-191.7-206-206-17.5-2.3-31.9 12.2-31.9 29.9l0 176c0 17.7 14.3 32 32 32l176 0z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M304 240l176 0c17.7 0 32.2-14.4 29.9-31.9-14.2-107-99-191.7-206-206-17.5-2.3-31.9 12.2-31.9 29.9l0 176c0 17.7 14.3 32 32 32zM224 66.7c0-18.5-15.7-33.3-33.8-29.5-108.6 22.9-190.2 119.4-190.2 234.8 0 132.5 107.5 240 240 240 115.5 0 211.9-81.5 234.8-190.2 3.8-18.1-11-33.8-29.5-33.8L248 288c-13.3 0-24-10.7-24-24l0-197.3z" />
      )}
    </svg>
  );
}
