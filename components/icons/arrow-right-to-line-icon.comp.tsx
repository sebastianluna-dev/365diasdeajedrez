import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Skipping ahead, in the board's tools. Font Awesome's `arrow-right-to-line`,
 * in Duotone Light (the default), Duotone Solid or Classic Solid, as `variant`
 * says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ArrowRightToLineIcon({ className, variant = "duotone-light" }: IconProps) {
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
        <path d="M512 80c0-8.8-7.2-16-16-16s-16 7.2-16 16l0 352c0 8.8 7.2 16 16 16s16-7.2 16-16l0-352zM379.3 267.3c6.2-6.2 6.2-16.4 0-22.6l-144-144c-6.2-6.2-16.4-6.2-22.6 0s-6.2 16.4 0 22.6L329.4 240 16 240c-8.8 0-16 7.2-16 16s7.2 16 16 16l313.4 0-116.7 116.7c-6.2 6.2-6.2 16.4 0 22.6s16.4 6.2 22.6 0l144-144z" />
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M448 96l0 320c0 17.7 14.3 32 32 32s32-14.3 32-32l0-320c0-17.7-14.3-32-32-32s-32 14.3-32 32z"
          />
          <path d="M374.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-128 128c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L274.7 288 32 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l242.7 0-73.4-73.4c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l128 128z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M512 96c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 320c0 17.7 14.3 32 32 32s32-14.3 32-32l0-320zM374.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L274.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l242.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128z" />
      )}
    </svg>
  );
}
