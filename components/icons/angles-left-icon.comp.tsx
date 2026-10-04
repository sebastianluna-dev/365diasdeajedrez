import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `angles-left`, in Duotone Light (the default), Duotone Solid
 * or Classic Solid, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function AnglesLeftIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="-117.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "duotone-light" && (
        <path d="M20.7 244.7c-6.2 6.2-6.2 16.4 0 22.6l160 160c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6L54.6 256 203.3 107.3c6.2-6.2 6.2-16.4 0-22.6s-16.4-6.2-22.6 0l-160 160zm352-160l-160 160c-6.2 6.2-6.2 16.4 0 22.6l160 160c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6L246.6 256 395.3 107.3c6.2-6.2 6.2-16.4 0-22.6s-16.4-6.2-22.6 0z" />
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M201.4 233.4l160-160c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3L269.3 256 406.6 393.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0l-160-160c-12.5-12.5-12.5-32.8 0-45.3z"
          />
          <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160zm352-160l-160 160c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L269.3 256 406.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0z" />
      )}
    </svg>
  );
}
