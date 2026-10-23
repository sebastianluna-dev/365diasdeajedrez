import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `info`, in twelve styles (Duotone Light is the default), as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function InfoIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="-245.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "duotone-light" && (
        <path d="M72 56a24 24 0 1 1 48 0 24 24 0 1 1 -48 0zM0 176c0-8.8 7.2-16 16-16l64 0c17.7 0 32 14.3 32 32l0 256 64 0c8.8 0 16 7.2 16 16s-7.2 16-16 16L16 480c-8.8 0-16-7.2-16-16s7.2-16 16-16l64 0 0-256-64 0c-8.8 0-16-7.2-16-16z" />
      )}
      {variant === "duotone-solid" && (
        <>
          <path opacity=".4" d="M48 48a48 48 0 1 0 96 0 48 48 0 1 0 -96 0z" />
          <path d="M32 160c-17.7 0-32 14.3-32 32s14.3 32 32 32l32 0 0 224-32 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l128 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-32 0 0-256c0-17.7-14.3-32-32-32l-64 0z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M48 48a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zM0 192c0-17.7 14.3-32 32-32l64 0c17.7 0 32 14.3 32 32l0 256 32 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 512c-17.7 0-32-14.3-32-32s14.3-32 32-32l32 0 0-224-32 0c-17.7 0-32-14.3-32-32z" />
      )}
      {variant === "classic-light" && (
        <path d="M72 56a24 24 0 1 1 48 0 24 24 0 1 1 -48 0zM0 176c0-8.8 7.2-16 16-16l64 0c17.7 0 32 14.3 32 32l0 256 64 0c8.8 0 16 7.2 16 16s-7.2 16-16 16L16 480c-8.8 0-16-7.2-16-16s7.2-16 16-16l64 0 0-256-64 0c-8.8 0-16-7.2-16-16z" />
      )}
      {variant === "sharp-duotone-light" && (
        <path d="M116 32l0 40-40 0 0-40 40 0zM0 160l112 0 0 288 80 0 0 32-192 0 0-32 80 0 0-256-80 0 0-32z" />
      )}
      {variant === "sharp-light" && (
        <path d="M116 32l0 40-40 0 0-40 40 0zM0 160l112 0 0 288 80 0 0 32-192 0 0-32 80 0 0-256-80 0 0-32z" />
      )}
      {variant === "classic-regular" && (
        <path d="M64 32a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zM0 184c0-13.3 10.7-24 24-24l64 0c17.7 0 32 14.3 32 32l0 272 48 0c13.3 0 24 10.7 24 24s-10.7 24-24 24L24 512c-13.3 0-24-10.7-24-24s10.7-24 24-24l48 0 0-256-48 0c-13.3 0-24-10.7-24-24z" />
      )}
      {variant === "duotone-regular" && (
        <path d="M64 32a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zM0 184c0-13.3 10.7-24 24-24l64 0c17.7 0 32 14.3 32 32l0 272 48 0c13.3 0 24 10.7 24 24s-10.7 24-24 24L24 512c-13.3 0-24-10.7-24-24s10.7-24 24-24l48 0 0-256-48 0c-13.3 0-24-10.7-24-24z" />
      )}
      {variant === "sharp-solid" && (
        <path d="M128 0l0 64-64 0 0-64 64 0zM0 160l128 0 0 288 64 0 0 64-192 0 0-64 64 0 0-224-64 0 0-64z" />
      )}
      {variant === "sharp-duotone-solid" && (
        <>
          <path opacity=".4" d="M64 0l64 0 0 64-64 0 0-64z" />
          <path d="M32 160l-32 0 0 64 64 0 0 224-64 0 0 64 192 0 0-64-64 0 0-288-96 0z" />
        </>
      )}
      {variant === "sharp-regular" && (
        <path d="M124 0l0 56-56 0 0-56 56 0zM0 160l120 0 0 304 72 0 0 48-192 0 0-48 72 0 0-256-72 0 0-48z" />
      )}
      {variant === "sharp-duotone-regular" && (
        <path d="M124 0l0 56-56 0 0-56 56 0zM0 160l120 0 0 304 72 0 0 48-192 0 0-48 72 0 0-256-72 0 0-48z" />
      )}
    </svg>
  );
}
