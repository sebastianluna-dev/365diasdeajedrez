import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `arrow-down-right`, in Duotone Light (the default), Duotone
 * Solid, Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ArrowDownRightIcon({ className, variant = "duotone-light" }: IconProps) {
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
        <path d="M368 448c8.8 0 16-7.2 16-16l0-256c0-8.8-7.2-16-16-16s-16 7.2-16 16L352 393.4 27.3 68.7c-6.2-6.2-16.4-6.2-22.6 0s-6.2 16.4 0 22.6L329.4 416 112 416c-8.8 0-16 7.2-16 16s7.2 16 16 16l256 0z" />
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M9.4 73.4c-12.5 12.5-12.5 32.8 0 45.3L274.7 384 320 384 320 338.7 54.6 73.4c-12.5-12.5-32.8-12.5-45.3 0z"
          />
          <path d="M352 448c17.7 0 32-14.3 32-32l0-224c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 192-192 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l224 0z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M352 448c17.7 0 32-14.3 32-32l0-224c0-17.7-14.3-32-32-32s-32 14.3-32 32L320 338.7 54.6 73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L274.7 384 128 384c-17.7 0-32 14.3-32 32s14.3 32 32 32l224 0z" />
      )}
      {variant === "classic-light" && (
        <path d="M368 448c8.8 0 16-7.2 16-16l0-256c0-8.8-7.2-16-16-16s-16 7.2-16 16L352 393.4 27.3 68.7c-6.2-6.2-16.4-6.2-22.6 0s-6.2 16.4 0 22.6L329.4 416 112 416c-8.8 0-16 7.2-16 16s7.2 16 16 16l256 0z" />
      )}
    </svg>
  );
}
