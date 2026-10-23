import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `text`, in twelve styles (Duotone Light is the default), as `variant` says. Its Duotone Solid drawing is a
 * single layer, drawn at full strength: at 40 % it would read as switched off.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function TextIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="-149.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "duotone-light" && (
        <path d="M32 72c0-4.4 3.6-8 8-8l136 0 0 384-80 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l192 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-80 0 0-384 136 0c4.4 0 8 3.6 8 8l0 72c0 8.8 7.2 16 16 16s16-7.2 16-16l0-72c0-22.1-17.9-40-40-40L40 32C17.9 32 0 49.9 0 72l0 72c0 8.8 7.2 16 16 16s16-7.2 16-16l0-72z" />
      )}
      {variant === "duotone-solid" && (
        <path d="M64 96l0 32c0 17.7-14.3 32-32 32S0 145.7 0 128L0 72C0 49.9 17.9 32 40 32l304 0c22.1 0 40 17.9 40 40l0 56c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-32-96 0 0 320 48 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-160 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l48 0 0-320-96 0z" />
      )}
      {variant === "classic-solid" && (
        <path d="M64 96l0 32c0 17.7-14.3 32-32 32S0 145.7 0 128L0 72C0 49.9 17.9 32 40 32l304 0c22.1 0 40 17.9 40 40l0 56c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-32-96 0 0 320 48 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-160 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l48 0 0-320-96 0z" />
      )}
      {variant === "classic-light" && (
        <path d="M32 72c0-4.4 3.6-8 8-8l136 0 0 384-80 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l192 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-80 0 0-384 136 0c4.4 0 8 3.6 8 8l0 72c0 8.8 7.2 16 16 16s16-7.2 16-16l0-72c0-22.1-17.9-40-40-40L40 32C17.9 32 0 49.9 0 72l0 72c0 8.8 7.2 16 16 16s16-7.2 16-16l0-72z" />
      )}
      {variant === "sharp-duotone-light" && (
        <path d="M16 32l-16 0 0 128 32 0 0-96 144 0 0 384-96 0 0 32 224 0 0-32-96 0 0-384 144 0 0 96 32 0 0-128-368 0z" />
      )}
      {variant === "sharp-light" && (
        <path d="M16 32l-16 0 0 128 32 0 0-96 144 0 0 384-96 0 0 32 224 0 0-32-96 0 0-384 144 0 0 96 32 0 0-128-368 0z" />
      )}
      {variant === "classic-regular" && (
        <path d="M48 136l0-56 120 0 0 352-64 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l176 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-64 0 0-352 120 0 0 56c0 13.3 10.7 24 24 24s24-10.7 24-24l0-64c0-22.1-17.9-40-40-40L40 32C17.9 32 0 49.9 0 72l0 64c0 13.3 10.7 24 24 24s24-10.7 24-24z" />
      )}
      {variant === "duotone-regular" && (
        <path d="M48 136l0-56 120 0 0 352-64 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l176 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-64 0 0-352 120 0 0 56c0 13.3 10.7 24 24 24s24-10.7 24-24l0-64c0-22.1-17.9-40-40-40L40 32C17.9 32 0 49.9 0 72l0 64c0 13.3 10.7 24 24 24s24-10.7 24-24z" />
      )}
      {variant === "sharp-solid" && (
        <path d="M0 32l384 0 0 128-64 0 0-64-96 0 0 320 80 0 0 64-224 0 0-64 80 0 0-320-96 0 0 64-64 0 0-128z" />
      )}
      {variant === "sharp-duotone-solid" && (
        <path
          opacity=".4"
          d="M0 32l384 0 0 128-64 0 0-64-96 0 0 320 80 0 0 64-224 0 0-64 80 0 0-320-96 0 0 64-64 0 0-128z"
        />
      )}
      {variant === "sharp-regular" && (
        <path d="M24 32l-24 0 0 128 48 0 0-80 120 0 0 352-88 0 0 48 224 0 0-48-88 0 0-352 120 0 0 80 48 0 0-128-360 0z" />
      )}
      {variant === "sharp-duotone-regular" && (
        <path d="M24 32l-24 0 0 128 48 0 0-80 120 0 0 352-88 0 0 48 224 0 0-48-88 0 0-352 120 0 0 80 48 0 0-128-360 0z" />
      )}
    </svg>
  );
}
