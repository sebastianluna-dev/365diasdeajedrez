import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `heading`, in Duotone Light (the default), Duotone Solid,
 * Classic Solid or Classic Light, as `variant` says. Its Duotone Solid drawing
 * is a single layer, drawn at full strength: at 40 % it would read as switched
 * off.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function HeadingIcon({ className, variant = "duotone-light" }: IconProps) {
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
        <path d="M0 48c0-8.8 7.2-16 16-16l128 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-48 0 0 160 256 0 0-160-48 0c-8.8 0-16-7.2-16-16s7.2-16 16-16l128 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-48 0 0 384 48 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-128 0c-8.8 0-16-7.2-16-16s7.2-16 16-16l48 0 0-192-256 0 0 192 48 0c8.8 0 16 7.2 16 16s-7.2 16-16 16L16 480c-8.8 0-16-7.2-16-16s7.2-16 16-16l48 0 0-384-48 0C7.2 64 0 56.8 0 48z" />
      )}
      {variant === "duotone-solid" && (
        <path d="M0 64C0 46.3 14.3 32 32 32l96 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-16 0 0 112 224 0 0-112-16 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l96 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-16 0 0 320 16 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-96 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l16 0 0-144-224 0 0 144 16 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-96 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l16 0 0-320-16 0C14.3 96 0 81.7 0 64z" />
      )}
      {variant === "classic-solid" && (
        <path d="M0 64C0 46.3 14.3 32 32 32l96 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-16 0 0 112 224 0 0-112-16 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l96 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-16 0 0 320 16 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-96 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l16 0 0-144-224 0 0 144 16 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-96 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l16 0 0-320-16 0C14.3 96 0 81.7 0 64z" />
      )}
      {variant === "classic-light" && (
        <path d="M0 48c0-8.8 7.2-16 16-16l128 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-48 0 0 160 256 0 0-160-48 0c-8.8 0-16-7.2-16-16s7.2-16 16-16l128 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-48 0 0 384 48 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-128 0c-8.8 0-16-7.2-16-16s7.2-16 16-16l48 0 0-192-256 0 0 192 48 0c8.8 0 16 7.2 16 16s-7.2 16-16 16L16 480c-8.8 0-16-7.2-16-16s7.2-16 16-16l48 0 0-384-48 0C7.2 64 0 56.8 0 48z" />
      )}
      {variant === "sharp-duotone-light" && (
        <path d="M0 32l160 0 0 32-64 0 0 160 256 0 0-160-64 0 0-32 160 0 0 32-64 0 0 384 64 0 0 32-160 0 0-32 64 0 0-192-256 0 0 192 64 0 0 32-160 0 0-32 64 0 0-384-64 0 0-32z" />
      )}
      {variant === "sharp-light" && (
        <path d="M0 32l160 0 0 32-64 0 0 160 256 0 0-160-64 0 0-32 160 0 0 32-64 0 0 384 64 0 0 32-160 0 0-32 64 0 0-192-256 0 0 192 64 0 0 32-160 0 0-32 64 0 0-384-64 0 0-32z" />
      )}
    </svg>
  );
}
