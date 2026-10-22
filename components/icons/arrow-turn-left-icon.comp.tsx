import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `arrow-turn-left`, in Duotone Light (the default), Duotone
 * Solid, Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ArrowTurnLeftIcon({ className, variant = "duotone-light" }: IconProps) {
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
        <path d="M480 432c0 8.8 7.2 16 16 16s16-7.2 16-16l0-96c0-53-43-96-96-96L54.6 240 171.3 123.3c6.2-6.2 6.2-16.4 0-22.6s-16.4-6.2-22.6 0l-144 144c-3 3-4.7 7.1-4.7 11.3s1.7 8.3 4.7 11.3l144 144c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6L54.6 272 416 272c35.3 0 64 28.7 64 64l0 96z" />
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M77.3 256l32 32 306.7 0c17.7 0 32 14.3 32 32l0 96c0 17.7 14.3 32 32 32s32-14.3 32-32l0-96c0-53-43-96-96-96l-306.7 0-32 32z"
          />
          <path d="M182.6 406.6c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3l128-128c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3L77.3 256 182.6 361.4c12.5 12.5 12.5 32.8 0 45.3z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M448 416c0 17.7 14.3 32 32 32s32-14.3 32-32l0-96c0-53-43-96-96-96l-306.7 0 73.4-73.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-128 128c-12.5 12.5-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 288 416 288c17.7 0 32 14.3 32 32l0 96z" />
      )}
      {variant === "classic-light" && (
        <path d="M480 432c0 8.8 7.2 16 16 16s16-7.2 16-16l0-96c0-53-43-96-96-96L54.6 240 171.3 123.3c6.2-6.2 6.2-16.4 0-22.6s-16.4-6.2-22.6 0l-144 144c-3 3-4.7 7.1-4.7 11.3s1.7 8.3 4.7 11.3l144 144c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6L54.6 272 416 272c35.3 0 64 28.7 64 64l0 96z" />
      )}
      {variant === "sharp-duotone-light" && (
        <path d="M480.1 432l0 16 32 0 0-208-457.4 0 116.7-116.7 11.3-11.3-22.6-22.6-11.3 11.3-144 144-11.3 11.3 11.3 11.3 144 144 11.3 11.3 22.6-22.6-11.3-11.3-116.7-116.7 425.4 0 0 160z" />
      )}
      {variant === "sharp-light" && (
        <path d="M480.1 432l0 16 32 0 0-208-457.4 0 116.7-116.7 11.3-11.3-22.6-22.6-11.3 11.3-144 144-11.3 11.3 11.3 11.3 144 144 11.3 11.3 22.6-22.6-11.3-11.3-116.7-116.7 425.4 0 0 160z" />
      )}
    </svg>
  );
}
