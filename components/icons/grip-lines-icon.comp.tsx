import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `grip-lines`, in twelve styles (Duotone Light is the default), as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function GripLinesIcon({ className, variant = "duotone-light" }: IconProps) {
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
        <path d="M448 176c0-8.8-7.2-16-16-16L16 160c-8.8 0-16 7.2-16 16s7.2 16 16 16l416 0c8.8 0 16-7.2 16-16zm0 160c0-8.8-7.2-16-16-16L16 320c-8.8 0-16 7.2-16 16s7.2 16 16 16l416 0c8.8 0 16-7.2 16-16z" />
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M0 320c0 17.7 14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 288c-17.7 0-32 14.3-32 32z"
          />
          <path d="M416 160c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 224c-17.7 0-32-14.3-32-32s14.3-32 32-32l384 0z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M32 288c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 288zm0-128c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 160z" />
      )}
      {variant === "classic-light" && (
        <path d="M448 176c0-8.8-7.2-16-16-16L16 160c-8.8 0-16 7.2-16 16s7.2 16 16 16l416 0c8.8 0 16-7.2 16-16zm0 160c0-8.8-7.2-16-16-16L16 320c-8.8 0-16 7.2-16 16s7.2 16 16 16l416 0c8.8 0 16-7.2 16-16z" />
      )}
      {variant === "sharp-duotone-light" && <path d="M448 192l0-32-448 0 0 32 448 0zm0 160l0-32-448 0 0 32 448 0z" />}
      {variant === "sharp-light" && <path d="M448 192l0-32-448 0 0 32 448 0zm0 160l0-32-448 0 0 32 448 0z" />}
      {variant === "classic-regular" && (
        <path d="M448 184c0-13.3-10.7-24-24-24L24 160c-13.3 0-24 10.7-24 24s10.7 24 24 24l400 0c13.3 0 24-10.7 24-24zm0 144c0-13.3-10.7-24-24-24L24 304c-13.3 0-24 10.7-24 24s10.7 24 24 24l400 0c13.3 0 24-10.7 24-24z" />
      )}
      {variant === "duotone-regular" && (
        <path d="M448 184c0-13.3-10.7-24-24-24L24 160c-13.3 0-24 10.7-24 24s10.7 24 24 24l400 0c13.3 0 24-10.7 24-24zm0 144c0-13.3-10.7-24-24-24L24 304c-13.3 0-24 10.7-24 24s10.7 24 24 24l400 0c13.3 0 24-10.7 24-24z" />
      )}
      {variant === "sharp-solid" && <path d="M0 288l0 64 448 0 0-64-448 0zM0 160l0 64 448 0 0-64-448 0z" />}
      {variant === "sharp-duotone-solid" && (
        <>
          <path opacity=".4" d="M0 288l0 64 448 0 0-64-448 0z" />
          <path d="M448 160l0 64-448 0 0-64 448 0z" />
        </>
      )}
      {variant === "sharp-regular" && <path d="M448 208l0-48-448 0 0 48 448 0zm0 144l0-48-448 0 0 48 448 0z" />}
      {variant === "sharp-duotone-regular" && <path d="M448 208l0-48-448 0 0 48 448 0zm0 144l0-48-448 0 0 48 448 0z" />}
    </svg>
  );
}
