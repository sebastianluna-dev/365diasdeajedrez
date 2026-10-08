import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `arrow-down-left`, in Duotone Light (the default), Duotone
 * Solid, Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ArrowDownLeftIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="-149.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "duotone-light" && (
        <path d="M16 448c-8.8 0-16-7.2-16-16L0 176c0-8.8 7.2-16 16-16s16 7.2 16 16L32 393.4 356.7 68.7c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6L54.6 416 272 416c8.8 0 16 7.2 16 16s-7.2 16-16 16L16 448z" />
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M64 338.7l0 45.3 45.3 0 265.4-265.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L64 338.7z"
          />
          <path d="M32 448c-17.7 0-32-14.3-32-32L0 192c0-17.7 14.3-32 32-32s32 14.3 32 32l0 192 192 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 448z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M0 416c0 17.7 14.3 32 32 32l224 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-146.7 0 265.4-265.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L64 338.7 64 192c0-17.7-14.3-32-32-32S0 174.3 0 192L0 416z" />
      )}
      {variant === "classic-light" && (
        <path d="M16 448c-8.8 0-16-7.2-16-16L0 176c0-8.8 7.2-16 16-16s16 7.2 16 16L32 393.4 356.7 68.7c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6L54.6 416 272 416c8.8 0 16 7.2 16 16s-7.2 16-16 16L16 448z" />
      )}
    </svg>
  );
}
