import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * The plus that opens an answer of the site's FAQ. Font Awesome's `plus`, in
 * Duotone Light (the default), Duotone Solid, Classic Solid, Classic Light, Sharp Duotone Light or Sharp Light,
 * as `variant` says. Its Duotone Solid drawing is a single layer, drawn at
 * full strength: at 40 % it would read as switched off.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function PlusIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox={
        {
          "duotone-light": "0 0 448 512",
          "duotone-solid": "0 0 448 512",
          "classic-solid": "0 0 448 512",
          "classic-light": "0 0 448 512",
          "sharp-duotone-light": "-117.33 -85.33 682.67 682.67",
          "sharp-light": "-117.33 -85.33 682.67 682.67",
          "classic-regular": "-117.33 -85.33 682.67 682.67",
          "duotone-regular": "-117.33 -85.33 682.67 682.67",
          "sharp-solid": "-117.33 -85.33 682.67 682.67",
          "sharp-duotone-solid": "-117.33 -85.33 682.67 682.67",
          "sharp-regular": "-117.33 -85.33 682.67 682.67",
          "sharp-duotone-regular": "-117.33 -85.33 682.67 682.67",
        }[variant]
      }
      width="16"
      height="16"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "duotone-light" && (
        <path d="M240 48c0-8.8-7.2-16-16-16s-16 7.2-16 16l0 192-192 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l192 0 0 192c0 8.8 7.2 16 16 16s16-7.2 16-16l0-192 192 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-192 0 0-192z" />
      )}
      {variant === "duotone-solid" && (
        <path d="M256 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 160-160 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l160 0 0 160c0 17.7 14.3 32 32 32s32-14.3 32-32l0-160 160 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-160 0 0-160z" />
      )}
      {variant === "classic-solid" && (
        <path d="M256 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 160-160 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l160 0 0 160c0 17.7 14.3 32 32 32s32-14.3 32-32l0-160 160 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-160 0 0-160z" />
      )}
      {variant === "classic-light" && (
        <path d="M240 48c0-8.8-7.2-16-16-16s-16 7.2-16 16l0 192-192 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l192 0 0 192c0 8.8 7.2 16 16 16s16-7.2 16-16l0-192 192 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-192 0 0-192z" />
      )}
      {variant === "sharp-duotone-light" && (
        <path d="M240 48l0-16-32 0 0 208-208 0 0 32 208 0 0 208 32 0 0-208 208 0 0-32-208 0 0-192z" />
      )}
      {variant === "sharp-light" && (
        <path d="M240 48l0-16-32 0 0 208-208 0 0 32 208 0 0 208 32 0 0-208 208 0 0-32-208 0 0-192z" />
      )}
      {variant === "classic-regular" && (
        <path d="M248 56c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 176-176 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l176 0 0 176c0 13.3 10.7 24 24 24s24-10.7 24-24l0-176 176 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-176 0 0-176z" />
      )}
      {variant === "duotone-regular" && (
        <path d="M248 56c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 176-176 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l176 0 0 176c0 13.3 10.7 24 24 24s24-10.7 24-24l0-176 176 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-176 0 0-176z" />
      )}
      {variant === "sharp-solid" && (
        <path d="M256 64l0-32-64 0 0 192-192 0 0 64 192 0 0 192 64 0 0-192 192 0 0-64-192 0 0-160z" />
      )}
      {variant === "sharp-duotone-solid" && (
        <path opacity=".4" d="M256 64l0-32-64 0 0 192-192 0 0 64 192 0 0 192 64 0 0-192 192 0 0-64-192 0 0-160z" />
      )}
      {variant === "sharp-regular" && (
        <path d="M248 56l0-24-48 0 0 200-200 0 0 48 200 0 0 200 48 0 0-200 200 0 0-48-200 0 0-176z" />
      )}
      {variant === "sharp-duotone-regular" && (
        <path d="M248 56l0-24-48 0 0 200-200 0 0 48 200 0 0 200 48 0 0-200 200 0 0-48-200 0 0-176z" />
      )}
    </svg>
  );
}
