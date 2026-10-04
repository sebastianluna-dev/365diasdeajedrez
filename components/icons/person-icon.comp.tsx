import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `person`, in Duotone Light (the default), Duotone Solid or
 * Classic Solid, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function PersonIcon({ className, variant = "duotone-light" }: IconProps) {
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
        <>
          <path
            opacity=".4"
            d="M144 156.7l0 179.3 96 0 0-179.3c-14.4-8.2-30.9-12.7-48-12.7s-33.6 4.5-48 12.7zM168 24a24 24 0 1 0 48 0 24 24 0 1 0 -48 0z"
          />
          <path d="M168 24a24 24 0 1 1 48 0 24 24 0 1 1 -48 0zm80 0a56 56 0 1 0 -112 0 56 56 0 1 0 112 0zM108.8 191.1c1-1.7 2.1-3.4 3.2-5L112 528c0 8.8 7.2 16 16 16s16-7.2 16-16l0-160 96 0 0 160c0 8.8 7.2 16 16 16s16-7.2 16-16l0-341.9c1.1 1.6 2.2 3.3 3.2 5l63.1 105.1c4.5 7.6 14.4 10 22 5.5s10-14.4 5.5-21.9L302.7 174.6C279.3 135.8 237.3 112 192 112s-87.3 23.8-110.6 62.6L18.3 279.8c-4.5 7.6-2.1 17.4 5.5 21.9s17.4 2.1 22-5.5l63.1-105.1zM240 336l-96 0 0-179.3c14.4-8.2 30.9-12.7 48-12.7s33.6 4.5 48 12.7L240 336z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path opacity=".4" d="M136 24a56 56 0 1 0 112 0 56 56 0 1 0 -112 0z" />
          <path d="M112 236.7L65.7 299.1c-10.5 14.2-30.6 17.2-44.8 6.6s-17.2-30.6-6.6-44.8l70.5-95C110 132 149.7 112 192 112s82 20 107.2 53.9l70.5 95c10.5 14.2 7.6 34.2-6.6 44.8s-34.2 7.6-44.8-6.6L272 236.7 272 512c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-160c0-8.8-7.2-16-16-16s-16 7.2-16 16l0 160c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-275.3z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M248 24a56 56 0 1 0 -112 0 56 56 0 1 0 112 0zm24 212.7l46.3 62.4c10.5 14.2 30.6 17.2 44.8 6.6s17.2-30.6 6.6-44.8l-70.5-95C274 132 234.3 112 192 112s-82 20-107.2 53.9l-70.5 95c-10.5 14.2-7.6 34.2 6.6 44.8s34.2 7.6 44.8-6.6L112 236.7 112 512c0 17.7 14.3 32 32 32s32-14.3 32-32l0-160c0-8.8 7.2-16 16-16s16 7.2 16 16l0 160c0 17.7 14.3 32 32 32s32-14.3 32-32l0-275.3z" />
      )}
    </svg>
  );
}
