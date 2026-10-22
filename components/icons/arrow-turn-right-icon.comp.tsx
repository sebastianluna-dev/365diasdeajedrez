import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `arrow-turn-right`, in Duotone Light (the default), Duotone
 * Solid, Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ArrowTurnRightIcon({ className, variant = "duotone-light" }: IconProps) {
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
        <path d="M32 432c0 8.8-7.2 16-16 16S0 440.8 0 432l0-96c0-53 43-96 96-96l361.4 0-116.7-116.7c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0l144 144c3 3 4.7 7.1 4.7 11.3s-1.7 8.3-4.7 11.3l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6L457.4 272 96 272c-35.3 0-64 28.7-64 64l0 96z" />
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M0 320l0 96c0 17.7 14.3 32 32 32s32-14.3 32-32l0-96c0-17.7 14.3-32 32-32l306.7 0 32-32-32-32-306.7 0c-53 0-96 43-96 96z"
          />
          <path d="M329.4 406.6c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L434.7 256 329.4 361.4c-12.5 12.5-12.5 32.8 0 45.3z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M64 416c0 17.7-14.3 32-32 32S0 433.7 0 416l0-96c0-53 43-96 96-96l306.7 0-73.4-73.4c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l128 128c12.5 12.5 12.5 32.8 0 45.3l-128 128c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L402.7 288 96 288c-17.7 0-32 14.3-32 32l0 96z" />
      )}
      {variant === "classic-light" && (
        <path d="M32 432c0 8.8-7.2 16-16 16S0 440.8 0 432l0-96c0-53 43-96 96-96l361.4 0-116.7-116.7c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0l144 144c3 3 4.7 7.1 4.7 11.3s-1.7 8.3-4.7 11.3l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6L457.4 272 96 272c-35.3 0-64 28.7-64 64l0 96z" />
      )}
      {variant === "sharp-duotone-light" && (
        <path d="M32.1 432l0 16-32 0 0-208 457.4 0-116.7-116.7-11.3-11.3 22.6-22.6 11.3 11.3 144 144 11.3 11.3-11.3 11.3-144 144-11.3 11.3-22.6-22.6 11.3-11.3 116.7-116.7-425.4 0 0 160z" />
      )}
      {variant === "sharp-light" && (
        <path d="M32.1 432l0 16-32 0 0-208 457.4 0-116.7-116.7-11.3-11.3 22.6-22.6 11.3 11.3 144 144 11.3 11.3-11.3 11.3-144 144-11.3 11.3-22.6-22.6 11.3-11.3 116.7-116.7-425.4 0 0 160z" />
      )}
    </svg>
  );
}
