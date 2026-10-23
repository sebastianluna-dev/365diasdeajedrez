import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `arrow-down-right`, in twelve styles (Duotone Light is the default), as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ArrowDownRightIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox={
        {
          "duotone-light": "-149.33 -85.33 682.67 682.67",
          "duotone-solid": "-149.33 -85.33 682.67 682.67",
          "classic-solid": "-149.33 -85.33 682.67 682.67",
          "classic-light": "-149.33 -85.33 682.67 682.67",
          "sharp-duotone-light": "-149.33 -85.33 682.67 682.67",
          "sharp-light": "-149.33 -85.33 682.67 682.67",
          "classic-regular": "-149.33 -85.33 682.67 682.67",
          "duotone-regular": "-149.33 -85.33 682.67 682.67",
          "sharp-solid": "-117.33 -85.33 682.67 682.67",
          "sharp-duotone-solid": "-117.33 -85.33 682.67 682.67",
          "sharp-regular": "-117.33 -85.33 682.67 682.67",
          "sharp-duotone-regular": "-117.33 -85.33 682.67 682.67",
        }[variant]
      }
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
      {variant === "sharp-duotone-light" && (
        <path d="M368.1 448l16 0 0-288-32 0 0 233.4-324.7-324.7-11.3-11.3-22.6 22.6 11.3 11.3 324.7 324.7-233.4 0 0 32 272 0z" />
      )}
      {variant === "sharp-light" && (
        <path d="M368.1 448l16 0 0-288-32 0 0 233.4-324.7-324.7-11.3-11.3-22.6 22.6 11.3 11.3 324.7 324.7-233.4 0 0 32 272 0z" />
      )}
      {variant === "classic-regular" && (
        <path d="M360 448c13.3 0 24-10.7 24-24l0-240c0-13.3-10.7-24-24-24s-24 10.7-24 24L336 366.1 41 71C31.6 61.7 16.4 61.7 7 71S-2.3 95.6 7 105l295 295-182.1 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l240 0z" />
      )}
      {variant === "duotone-regular" && (
        <path d="M360 448c13.3 0 24-10.7 24-24l0-240c0-13.3-10.7-24-24-24s-24 10.7-24 24L336 366.1 41 71C31.6 61.7 16.4 61.7 7 71S-2.3 95.6 7 105l295 295-182.1 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l240 0z" />
      )}
      {variant === "sharp-solid" && (
        <path d="M384.3 448l32 0 0-288-64 0 0 178.7-265.4-265.4-22.6-22.6-45.3 45.3 22.6 22.6 265.4 265.4-178.7 0 0 64 256 0z" />
      )}
      {variant === "sharp-duotone-solid" && (
        <>
          <path opacity=".4" d="M19 96L41.6 118.6 307 384 352.3 384 352.3 338.7 86.9 73.4 64.3 50.7 19 96z" />
          <path d="M416.3 448l-288 0 0-64 224 0 0-224 64 0 0 288z" />
        </>
      )}
      {variant === "sharp-regular" && (
        <path d="M392.4 448l24 0 0-288-48 0 0 206.1-295-295-17-17-33.9 33.9 17 17 295 295-206.1 0 0 48 264 0z" />
      )}
      {variant === "sharp-duotone-regular" && (
        <path d="M392.4 448l24 0 0-288-48 0 0 206.1-295-295-17-17-33.9 33.9 17 17 295 295-206.1 0 0 48 264 0z" />
      )}
    </svg>
  );
}
