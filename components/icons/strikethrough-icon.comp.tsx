import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `strikethrough`, in Duotone Light (the default), Duotone
 * Solid or Classic Solid, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function StrikethroughIcon({ className, variant = "duotone-light" }: IconProps) {
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
        <path d="M96 147.6C96 83.8 147.8 32 211.6 32L384 32c8.8 0 16 7.2 16 16s-7.2 16-16 16L211.6 64c-46.2 0-83.6 37.4-83.6 83.6 0 40.9 29.6 75.8 69.9 82.5l121.5 20.3c7.4 1.2 14.5 3.1 21.3 5.7L496 256c8.8 0 16 7.2 16 16s-7.2 16-16 16L16 288c-8.8 0-16-7.2-16-16s7.2-16 16-16l155.3 0C126.8 239.5 96 196.7 96 147.6zM379 336l33.4 0c2.3 9.1 3.5 18.6 3.5 28.4 0 63.8-51.8 115.6-115.6 115.6L128 480c-8.8 0-16-7.2-16-16s7.2-16 16-16l172.4 0c46.2 0 83.6-37.4 83.6-83.6 0-9.9-1.7-19.5-5-28.4z" />
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M96 157.5c0 24.3 7 47.2 19.1 66.5l142.9 0-44.1-5.5c-30.8-3.8-53.9-30-53.9-61 0-34 27.5-61.5 61.5-61.5L368 96c17.7 0 32-14.3 32-32s-14.3-32-32-32L221.5 32C152.2 32 96 88.2 96 157.5zM112 448c0 17.7 14.3 32 32 32l146.5 0c69.3 0 125.5-56.2 125.5-125.5 0-24.3-7-47.2-19.1-66.5l-142.9 0 44.1 5.5c30.8 3.8 53.9 30 53.9 61 0 34-27.5 61.5-61.5 61.5L144 416c-17.7 0-32 14.3-32 32z"
          />
          <path d="M0 256c0-17.7 14.3-32 32-32l448 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 288c-17.7 0-32-14.3-32-32z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M96 157.5C96 88.2 152.2 32 221.5 32L368 32c17.7 0 32 14.3 32 32s-14.3 32-32 32L221.5 96c-34 0-61.5 27.5-61.5 61.5 0 31 23.1 57.2 53.9 61l44.1 5.5 222 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l83.1 0C103 204.6 96 181.8 96 157.5zM349.2 336l65.5 0c.9 6.1 1.4 12.2 1.4 18.5 0 69.3-56.2 125.5-125.5 125.5L144 480c-17.7 0-32-14.3-32-32s14.3-32 32-32l146.5 0c34 0 61.5-27.5 61.5-61.5 0-6.4-1-12.7-2.8-18.5z" />
      )}
    </svg>
  );
}
