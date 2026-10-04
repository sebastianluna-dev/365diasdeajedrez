import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `arrow-up-long`, in Duotone Light (the default), Duotone
 * Solid or Classic Solid, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ArrowUpLongIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="-181.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "duotone-light" && (
        <path d="M171.3-27.3c-6.2-6.2-16.4-6.2-22.6 0l-144 144c-6.2 6.2-6.2 16.4 0 22.6s16.4 6.2 22.6 0L144 22.6 144 528c0 8.8 7.2 16 16 16s16-7.2 16-16l0-505.4 116.7 116.7c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-144-144z" />
      )}
      {variant === "duotone-solid" && (
        <>
          <path opacity=".4" d="M128 77.3l32-32 32 32 0 434.7c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-434.7z" />
          <path d="M137.4-22.6c12.5-12.5 32.8-12.5 45.3 0l128 128c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L160 45.3 54.6 150.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l128-128z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M182.6-22.6c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L128 77.3 128 512c0 17.7 14.3 32 32 32s32-14.3 32-32l0-434.7 73.4 73.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-128-128z" />
      )}
    </svg>
  );
}
