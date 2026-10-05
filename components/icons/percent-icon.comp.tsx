import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `percent`, in Duotone Light (the default), Duotone Solid,
 * Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function PercentIcon({ className, variant = "duotone-light" }: IconProps) {
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
            d="M32 128a64 64 0 1 0 128 0 64 64 0 1 0 -128 0zM288 384a64 64 0 1 0 128 0 64 64 0 1 0 -128 0z"
          />
          <path d="M443.3 36.7c6.2 6.2 6.2 16.4 0 22.6l-416 416c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l416-416c6.2-6.2 16.4-6.2 22.6 0zM96 192a64 64 0 1 0 0-128 64 64 0 1 0 0 128zM96 32a96 96 0 1 1 0 192 96 96 0 1 1 0-192zM416 384a64 64 0 1 0 -128 0 64 64 0 1 0 128 0zm-160 0a96 96 0 1 1 192 0 96 96 0 1 1 -192 0z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M0 128a96 96 0 1 0 192 0 96 96 0 1 0 -192 0zM256 384a96 96 0 1 0 192 0 96 96 0 1 0 -192 0z"
          />
          <path d="M438.6 41.4c12.5 12.5 12.5 32.8 0 45.3l-384 384c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l384-384c12.5-12.5 32.8-12.5 45.3 0z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M192 128a96 96 0 1 0 -192 0 96 96 0 1 0 192 0zM448 384a96 96 0 1 0 -192 0 96 96 0 1 0 192 0zM438.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-384 384c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l384-384z" />
      )}
      {variant === "classic-light" && (
        <path d="M443.3 36.7c6.2 6.2 6.2 16.4 0 22.6l-416 416c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l416-416c6.2-6.2 16.4-6.2 22.6 0zM96 192a64 64 0 1 0 0-128 64 64 0 1 0 0 128zM96 32a96 96 0 1 1 0 192 96 96 0 1 1 0-192zM416 384a64 64 0 1 0 -128 0 64 64 0 1 0 128 0zm-160 0a96 96 0 1 1 192 0 96 96 0 1 1 -192 0z" />
      )}
    </svg>
  );
}
