import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `arrow-left`, in Duotone Light (the default), Duotone Solid,
 * Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ArrowLeftIcon({ className, variant = "duotone-light" }: IconProps) {
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
        <path d="M4.7 244.7c-6.2 6.2-6.2 16.4 0 22.6l176 176c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6L54.6 272 496 272c8.8 0 16-7.2 16-16s-7.2-16-16-16L54.6 240 203.3 91.3c6.2-6.2 6.2-16.4 0-22.6s-16.4-6.2-22.6 0l-176 176z" />
      )}
      {variant === "duotone-solid" && (
        <>
          <path opacity=".4" d="M77.3 256l32 32 370.7 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-370.7 0-32 32z" />
          <path d="M9.4 278.6c-12.5-12.5-12.5-32.8 0-45.3l160-160c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3L77.3 256 214.6 393.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0l-160-160z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 288 480 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-370.7 0 105.4-105.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z" />
      )}
      {variant === "classic-light" && (
        <path d="M4.7 244.7c-6.2 6.2-6.2 16.4 0 22.6l176 176c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6L54.6 272 496 272c8.8 0 16-7.2 16-16s-7.2-16-16-16L54.6 240 203.3 91.3c6.2-6.2 6.2-16.4 0-22.6s-16.4-6.2-22.6 0l-176 176z" />
      )}
      {variant === "sharp-duotone-light" && (
        <path d="M4.8 244.7l-11.3 11.3 11.3 11.3 176 176 11.3 11.3 22.6-22.6-11.3-11.3-148.7-148.7 457.4 0 0-32-457.4 0 148.7-148.7 11.3-11.3-22.6-22.6-11.3 11.3-176 176z" />
      )}
      {variant === "sharp-light" && (
        <path d="M4.8 244.7l-11.3 11.3 11.3 11.3 176 176 11.3 11.3 22.6-22.6-11.3-11.3-148.7-148.7 457.4 0 0-32-457.4 0 148.7-148.7 11.3-11.3-22.6-22.6-187.3 187.3z" />
      )}
    </svg>
  );
}
