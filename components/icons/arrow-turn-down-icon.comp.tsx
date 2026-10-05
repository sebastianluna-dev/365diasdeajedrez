import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `arrow-turn-down`, in Duotone Light (the default), Duotone
 * Solid, Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ArrowTurnDownIcon({ className, variant = "duotone-light" }: IconProps) {
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
        <path d="M16 32C7.2 32 0 24.8 0 16S7.2 0 16 0l96 0c53 0 96 43 96 96l0 361.4 116.7-116.7c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6l-144 144c-3 3-7.1 4.7-11.3 4.7s-8.3-1.7-11.3-4.7l-144-144c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0L176 457.4 176 96c0-35.3-28.7-64-64-64L16 32z" />
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M0 32C0 14.3 14.3 0 32 0l96 0c53 0 96 43 96 96l0 306.7-32 32-32-32 0-306.7c0-17.7-14.3-32-32-32L32 64C14.3 64 0 49.7 0 32z"
          />
          <path d="M41.4 329.4c-12.5 12.5-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 434.7 86.6 329.4c-12.5-12.5-32.8-12.5-45.3 0z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M32 64C14.3 64 0 49.7 0 32S14.3 0 32 0l96 0c53 0 96 43 96 96l0 306.7 73.4-73.4c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3l-128 128c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 402.7 160 96c0-17.7-14.3-32-32-32L32 64z" />
      )}
      {variant === "classic-light" && (
        <path d="M16 32C7.2 32 0 24.8 0 16S7.2 0 16 0l96 0c53 0 96 43 96 96l0 361.4 116.7-116.7c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6l-144 144c-3 3-7.1 4.7-11.3 4.7s-8.3-1.7-11.3-4.7l-144-144c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0L176 457.4 176 96c0-35.3-28.7-64-64-64L16 32z" />
      )}
    </svg>
  );
}
