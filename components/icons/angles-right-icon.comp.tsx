import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `angles-right`, in Duotone Light (the default), Duotone Solid
 * or Classic Solid, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function AnglesRightIcon({ className, variant = "duotone-light" }: IconProps) {
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
        <path d="M427.3 267.3c6.2-6.2 6.2-16.4 0-22.6l-160-160c-6.2-6.2-16.4-6.2-22.6 0s-6.2 16.4 0 22.6L393.4 256 244.7 404.7c-6.2 6.2-6.2 16.4 0 22.6s16.4 6.2 22.6 0l160-160zm-352 160l160-160c6.2-6.2 6.2-16.4 0-22.6l-160-160c-6.2-6.2-16.4-6.2-22.6 0s-6.2 16.4 0 22.6L201.4 256 52.7 404.7c-6.2 6.2-6.2 16.4 0 22.6s16.4 6.2 22.6 0z" />
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M41.9 73.4c-12.5 12.5-12.5 32.8 0 45.3L179.2 256 41.9 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0z"
          />
          <path d="M439.1 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L371.2 256 233.9 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M439.1 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L371.2 256 233.9 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160zm-352 160l160-160c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L179.2 256 41.9 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0z" />
      )}
    </svg>
  );
}
