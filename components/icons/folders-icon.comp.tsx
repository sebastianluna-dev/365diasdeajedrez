import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `folders`, in Duotone Light (the default), Duotone Solid or
 * Classic Solid, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function FoldersIcon({ className, variant = "duotone-light" }: IconProps) {
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
            d="M128 64l0 256c0 17.7 14.3 32 32 32l352 0c17.7 0 32-14.3 32-32l0-192c0-17.7-14.3-32-32-32L381.3 96c-17 0-33.3-6.7-45.3-18.7L300.1 41.4c-6-6-14.1-9.4-22.6-9.4L160 32c-17.7 0-32 14.3-32 32z"
          />
          <path d="M512 352l-352 0c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l117.5 0c8.5 0 16.6 3.4 22.6 9.4L336 77.3c12 12 28.3 18.7 45.3 18.7L512 96c17.7 0 32 14.3 32 32l0 192c0 17.7-14.3 32-32 32zM160 384l352 0c35.3 0 64-28.7 64-64l0-192c0-35.3-28.7-64-64-64L381.3 64c-8.5 0-16.6-3.4-22.6-9.4L322.7 18.7C310.7 6.7 294.5 0 277.5 0L160 0C124.7 0 96 28.7 96 64l0 256c0 35.3 28.7 64 64 64zM32 112c0-8.8-7.2-16-16-16S0 103.2 0 112L0 416c0 35.3 28.7 64 64 64l400 0c8.8 0 16-7.2 16-16s-7.2-16-16-16L64 448c-17.7 0-32-14.3-32-32l0-304z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M96 64l0 256c0 35.3 28.7 64 64 64l352 0c35.3 0 64-28.7 64-64l0-192c0-35.3-28.7-64-64-64L381.3 64c-8.5 0-16.6-3.4-22.6-9.4L322.7 18.7C310.7 6.7 294.5 0 277.5 0L160 0C124.7 0 96 28.7 96 64z"
          />
          <path d="M24 96c13.3 0 24 10.7 24 24l0 296c0 8.8 7.2 16 16 16l392 0c13.3 0 24 10.7 24 24s-10.7 24-24 24L64 480c-35.3 0-64-28.7-64-64L0 120c0-13.3 10.7-24 24-24z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M512 384l-352 0c-35.3 0-64-28.7-64-64L96 64c0-35.3 28.7-64 64-64L277.5 0c17 0 33.3 6.7 45.3 18.7l35.9 35.9c6 6 14.1 9.4 22.6 9.4L512 64c35.3 0 64 28.7 64 64l0 192c0 35.3-28.7 64-64 64zM48 120l0 296c0 8.8 7.2 16 16 16l392 0c13.3 0 24 10.7 24 24s-10.7 24-24 24L64 480c-35.3 0-64-28.7-64-64L0 120c0-13.3 10.7-24 24-24s24 10.7 24 24z" />
      )}
    </svg>
  );
}
