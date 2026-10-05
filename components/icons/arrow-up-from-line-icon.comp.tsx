import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `arrow-up-from-line`, in Duotone Light (the default), Duotone
 * Solid, Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ArrowUpFromLineIcon({ className, variant = "duotone-light" }: IconProps) {
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
        <path d="M203.3 4.7c-6.2-6.2-16.4-6.2-22.6 0l-144 144c-6.2 6.2-6.2 16.4 0 22.6s16.4 6.2 22.6 0L176 54.6 176 368c0 8.8 7.2 16 16 16s16-7.2 16-16l0-313.4 116.7 116.7c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-144-144zM16 480c-8.8 0-16 7.2-16 16s7.2 16 16 16l352 0c8.8 0 16-7.2 16-16s-7.2-16-16-16L16 480z" />
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M0 480c0-17.7 14.3-32 32-32l320 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 512c-17.7 0-32-14.3-32-32z"
          />
          <path d="M169.4 9.4c12.5-12.5 32.8-12.5 45.3 0l128 128c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L224 109.3 224 352c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-242.7-73.4 73.4c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l128-128z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M214.6 9.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 109.3 160 352c0 17.7 14.3 32 32 32s32-14.3 32-32l0-242.7 73.4 73.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-128-128zM32 448c-17.7 0-32 14.3-32 32s14.3 32 32 32l320 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 448z" />
      )}
      {variant === "classic-light" && (
        <path d="M203.3 4.7c-6.2-6.2-16.4-6.2-22.6 0l-144 144c-6.2 6.2-6.2 16.4 0 22.6s16.4 6.2 22.6 0L176 54.6 176 368c0 8.8 7.2 16 16 16s16-7.2 16-16l0-313.4 116.7 116.7c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-144-144zM16 480c-8.8 0-16 7.2-16 16s7.2 16 16 16l352 0c8.8 0 16-7.2 16-16s-7.2-16-16-16L16 480z" />
      )}
    </svg>
  );
}
