import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `flag`, in Duotone Light (the default), Duotone Solid or
 * Classic Solid, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function FlagIcon({ className, variant = "duotone-light" }: IconProps) {
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
        <>
          <path
            opacity=".4"
            d="M32 89L140.7 61.8c30.7-7.7 63.1-4.1 91.4 10 55.3 27.7 120.4 27.7 175.8 0l8.1-4.1 0 278-34.7 13c-37.9 14.2-80 12-116.2-6.1-44.7-22.4-96-28-144.5-15.9L32 359 32 89z"
          />
          <path d="M32 16C32 7.2 24.8 0 16 0S0 7.2 0 16L0 496c0 8.8 7.2 16 16 16s16-7.2 16-16l0-104 96.3-24.1c41.1-10.3 84.6-5.5 122.5 13.4 44.2 22.1 95.5 24.8 141.7 7.4l34.7-13c12.5-4.7 20.8-16.6 20.8-30l0-279.7c0-23-24.2-38-44.8-27.7l-9.6 4.8c-46.3 23.2-100.8 23.2-147.1 0-35.1-17.6-75.4-22-113.5-12.5L32 56 32 16zm0 73L140.7 61.8c30.7-7.7 63.1-4.1 91.4 10 55.3 27.7 120.4 27.7 175.8 0l8.1-4.1 0 278-34.7 13c-37.9 14.2-80 12-116.2-6.1-44.7-22.4-96-28-144.5-15.9L32 359 32 89z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M64 48l69-17.2c38.1-9.5 78.3-5.1 113.5 12.5 46.3 23.2 100.8 23.2 147.1 0l9.6-4.8C423.8 28.1 448 43.1 448 66.1l0 247.7c0 13.3-8.3 25.3-20.8 30l-34.7 13c-46.2 17.3-97.6 14.6-141.7-7.4-37.9-19-81.4-23.7-122.5-13.4L64 352 64 48z"
          />
          <path d="M32 0C49.7 0 64 14.3 64 32l0 448c0 17.7-14.3 32-32 32S0 497.7 0 480L0 32C0 14.3 14.3 0 32 0z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M64 32C64 14.3 49.7 0 32 0S0 14.3 0 32L0 480c0 17.7 14.3 32 32 32s32-14.3 32-32l0-121.6 62.7-18.8c41.9-12.6 87.1-8.7 126.2 10.9 42.7 21.4 92.5 24 137.2 7.2l37.1-13.9c12.5-4.7 20.8-16.6 20.8-30l0-247.7c0-23-24.2-38-44.8-27.7l-11.8 5.9c-44.9 22.5-97.8 22.5-142.8 0-36.4-18.2-78.3-21.8-117.2-10.1L64 54.4 64 32z" />
      )}
    </svg>
  );
}
