import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `arrow-left-to-line`, in Duotone Light (the default), Duotone
 * Solid, Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ArrowLeftToLineIcon({ className, variant = "duotone-light" }: IconProps) {
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
        <path d="M0 80c0-8.8 7.2-16 16-16s16 7.2 16 16l0 352c0 8.8-7.2 16-16 16S0 440.8 0 432L0 80zM132.7 267.3c-6.2-6.2-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6L182.6 240 496 240c8.8 0 16 7.2 16 16s-7.2 16-16 16l-313.4 0 116.7 116.7c6.2 6.2 6.2 16.4 0 22.6s-16.4 6.2-22.6 0l-144-144z" />
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M0 96L0 416c0 17.7 14.3 32 32 32s32-14.3 32-32L64 96c0-17.7-14.3-32-32-32S0 78.3 0 96z"
          />
          <path d="M137.4 278.6c-12.5-12.5-12.5-32.8 0-45.3l128-128c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3L237.3 224 480 224c17.7 0 32 14.3 32 32s-14.3 32-32 32l-242.7 0 73.4 73.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0l-128-128z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M0 416c0 17.7 14.3 32 32 32s32-14.3 32-32L64 96c0-17.7-14.3-32-32-32S0 78.3 0 96L0 416zM137.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 288 480 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-242.7 0 73.4-73.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-128 128z" />
      )}
      {variant === "classic-light" && (
        <path d="M0 80c0-8.8 7.2-16 16-16s16 7.2 16 16l0 352c0 8.8-7.2 16-16 16S0 440.8 0 432L0 80zM132.7 267.3c-6.2-6.2-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6L182.6 240 496 240c8.8 0 16 7.2 16 16s-7.2 16-16 16l-313.4 0 116.7 116.7c6.2 6.2 6.2 16.4 0 22.6s-16.4 6.2-22.6 0l-144-144z" />
      )}
    </svg>
  );
}
