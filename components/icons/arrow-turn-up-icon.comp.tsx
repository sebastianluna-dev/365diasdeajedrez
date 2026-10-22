import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `arrow-turn-up`, in Duotone Light (the default), Duotone
 * Solid, Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ArrowTurnUpIcon({ className, variant = "duotone-light" }: IconProps) {
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
        <path d="M16 480c-8.8 0-16 7.2-16 16s7.2 16 16 16l96 0c53 0 96-43 96-96l0-361.4 116.7 116.7c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-144-144c-3-3-7.1-4.7-11.3-4.7s-8.3 1.7-11.3 4.7l-144 144c-6.2 6.2-6.2 16.4 0 22.6s16.4 6.2 22.6 0L176 54.6 176 416c0 35.3-28.7 64-64 64l-96 0z" />
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M0 480c0-17.7 14.3-32 32-32l96 0c17.7 0 32-14.3 32-32l0-306.7 32-32 32 32 0 306.7c0 53-43 96-96 96l-96 0c-17.7 0-32-14.3-32-32z"
          />
          <path d="M41.4 182.6c-12.5-12.5-12.5-32.8 0-45.3l128-128c12.5-12.5 32.8-12.5 45.3 0l128 128c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L192 77.3 86.6 182.6c-12.5 12.5-32.8 12.5-45.3 0z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M32 448c-17.7 0-32 14.3-32 32s14.3 32 32 32l96 0c53 0 96-43 96-96l0-306.7 73.4 73.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 109.3 160 416c0 17.7-14.3 32-32 32l-96 0z" />
      )}
      {variant === "classic-light" && (
        <path d="M16 480c-8.8 0-16 7.2-16 16s7.2 16 16 16l96 0c53 0 96-43 96-96l0-361.4 116.7 116.7c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-144-144c-3-3-7.1-4.7-11.3-4.7s-8.3 1.7-11.3 4.7l-144 144c-6.2 6.2-6.2 16.4 0 22.6s16.4 6.2 22.6 0L176 54.6 176 416c0 35.3-28.7 64-64 64l-96 0z" />
      )}
      {variant === "sharp-duotone-light" && (
        <path d="M16 480l-16 0 0 32 208 0 0-457.4 116.7 116.7 11.3 11.3 22.6-22.6-11.3-11.3-144-144-11.3-11.3-11.3 11.3-144 144-11.3 11.3 22.6 22.6 11.3-11.3 116.7-116.7 0 425.4-160 0z" />
      )}
      {variant === "sharp-light" && (
        <path d="M16 480l-16 0 0 32 208 0 0-457.4 116.7 116.7 11.3 11.3 22.6-22.6-11.3-11.3-144-144-11.3-11.3-11.3 11.3-144 144-11.3 11.3 22.6 22.6 11.3-11.3 116.7-116.7 0 425.4-160 0z" />
      )}
    </svg>
  );
}
