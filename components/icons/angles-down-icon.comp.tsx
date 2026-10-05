import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `angles-down`, in Duotone Light (the default), Duotone Solid,
 * Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function AnglesDownIcon({ className, variant = "duotone-light" }: IconProps) {
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
        <path d="M203.3 459.3c-6.2 6.2-16.4 6.2-22.6 0l-160-160c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0L192 425.4 340.7 276.7c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6l-160 160zm160-352l-160 160c-6.2 6.2-16.4 6.2-22.6 0l-160-160c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0L192 233.4 340.7 84.7c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z" />
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M9.4 73.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 54.6 73.4c-12.5-12.5-32.8-12.5-45.3 0z"
          />
          <path d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 402.7 54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M214.6 470.6c-12.5 12.5-32.8 12.5-45.3 0l-160-160c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L192 402.7 329.4 265.4c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3l-160 160zm160-352l-160 160c-12.5 12.5-32.8 12.5-45.3 0l-160-160c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L192 210.7 329.4 73.4c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3z" />
      )}
      {variant === "classic-light" && (
        <path d="M203.3 459.3c-6.2 6.2-16.4 6.2-22.6 0l-160-160c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0L192 425.4 340.7 276.7c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6l-160 160zm160-352l-160 160c-6.2 6.2-16.4 6.2-22.6 0l-160-160c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0L192 233.4 340.7 84.7c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z" />
      )}
    </svg>
  );
}
