import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `arrow-up-right`, in Duotone Light (the default), Duotone
 * Solid, Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ArrowUpRightIcon({ className, variant = "duotone-light" }: IconProps) {
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
        <path d="M368 64c8.8 0 16 7.2 16 16l0 256c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-217.4-324.7 324.7c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6L329.4 96 112 96c-8.8 0-16-7.2-16-16s7.2-16 16-16l256 0z" />
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M9.4 393.4l265.4-265.4 45.3 0 0 45.3-265.4 265.4c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3z"
          />
          <path d="M352 64c17.7 0 32 14.3 32 32l0 224c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-192-192 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l224 0z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M384 96c0-17.7-14.3-32-32-32L128 64c-17.7 0-32 14.3-32 32s14.3 32 32 32L274.7 128 9.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L320 173.3 320 320c0 17.7 14.3 32 32 32s32-14.3 32-32l0-224z" />
      )}
      {variant === "classic-light" && (
        <path d="M368 64c8.8 0 16 7.2 16 16l0 256c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-217.4-324.7 324.7c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6L329.4 96 112 96c-8.8 0-16-7.2-16-16s7.2-16 16-16l256 0z" />
      )}
      {variant === "sharp-duotone-light" && (
        <path d="M368.1 64l16 0 0 288-32 0 0-233.4-324.7 324.7-11.3 11.3-22.6-22.6 11.3-11.3 324.7-324.7-233.4 0 0-32 272 0z" />
      )}
      {variant === "sharp-light" && (
        <path d="M368.1 64l16 0 0 288-32 0 0-233.4-324.7 324.7-11.3 11.3-22.6-22.6 11.3-11.3 324.7-324.7-233.4 0 0-32 272 0z" />
      )}
    </svg>
  );
}
