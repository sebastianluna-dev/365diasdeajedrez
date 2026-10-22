import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `signal-bars`, in Duotone Light (the default), Duotone Solid,
 * Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function SignalBarsIcon({ className, variant = "duotone-light" }: IconProps) {
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
        <path d="M448 48c0-8.8-7.2-16-16-16s-16 7.2-16 16l0 416c0 8.8 7.2 16 16 16s16-7.2 16-16l0-416zM293.3 128c-8.8 0-16 7.2-16 16l0 320c0 8.8 7.2 16 16 16s16-7.2 16-16l0-320c0-8.8-7.2-16-16-16zM170.7 272c0-8.8-7.2-16-16-16s-16 7.2-16 16l0 192c0 8.8 7.2 16 16 16s16-7.2 16-16l0-192zM32 400c0-8.8-7.2-16-16-16S0 391.2 0 400l0 64c0 8.8 7.2 16 16 16s16-7.2 16-16l0-64z" />
      )}
      {variant === "duotone-solid" && (
        <path d="M448 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 384c0 17.7 14.3 32 32 32s32-14.3 32-32l0-384zM288 128c-17.7 0-32 14.3-32 32l0 288c0 17.7 14.3 32 32 32s32-14.3 32-32l0-288c0-17.7-14.3-32-32-32zM192 288c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 160c0 17.7 14.3 32 32 32s32-14.3 32-32l0-160zM64 416c0-17.7-14.3-32-32-32S0 398.3 0 416l0 32c0 17.7 14.3 32 32 32s32-14.3 32-32l0-32z" />
      )}
      {variant === "classic-solid" && (
        <path d="M448 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 384c0 17.7 14.3 32 32 32s32-14.3 32-32l0-384zM288 128c-17.7 0-32 14.3-32 32l0 288c0 17.7 14.3 32 32 32s32-14.3 32-32l0-288c0-17.7-14.3-32-32-32zM192 288c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 160c0 17.7 14.3 32 32 32s32-14.3 32-32l0-160zM64 416c0-17.7-14.3-32-32-32S0 398.3 0 416l0 32c0 17.7 14.3 32 32 32s32-14.3 32-32l0-32z" />
      )}
      {variant === "classic-light" && (
        <path d="M448 48c0-8.8-7.2-16-16-16s-16 7.2-16 16l0 416c0 8.8 7.2 16 16 16s16-7.2 16-16l0-416zM293.3 128c-8.8 0-16 7.2-16 16l0 320c0 8.8 7.2 16 16 16s16-7.2 16-16l0-320c0-8.8-7.2-16-16-16zM170.7 272c0-8.8-7.2-16-16-16s-16 7.2-16 16l0 192c0 8.8 7.2 16 16 16s16-7.2 16-16l0-192zM32 400c0-8.8-7.2-16-16-16S0 391.2 0 400l0 64c0 8.8 7.2 16 16 16s16-7.2 16-16l0-64z" />
      )}
      {variant === "sharp-duotone-light" && (
        <path d="M448 48l0-16-32 0 0 448 32 0 0-432zM309.3 128l-32 0 0 352 32 0 0-352zM170.7 272l0-16-32 0 0 224 32 0 0-208zM32 400l0-16-32 0 0 96 32 0 0-80z" />
      )}
      {variant === "sharp-light" && (
        <path d="M448 48l0-16-32 0 0 448 32 0 0-432zM309.3 128l-32 0 0 352 32 0 0-352zM170.7 272l0-16-32 0 0 224 32 0 0-208zM32 400l0-16-32 0 0 96 32 0 0-80z" />
      )}
    </svg>
  );
}
