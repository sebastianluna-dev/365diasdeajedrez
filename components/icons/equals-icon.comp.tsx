import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `equals`, in twelve styles (Duotone Light is the default), as `variant` says. Its Duotone Solid drawing
 * is a single layer, drawn at full strength: at 40 % it would read as switched
 * off.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function EqualsIcon({ className, variant = "duotone-light" }: IconProps) {
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
        <path d="M16 128c-8.8 0-16 7.2-16 16s7.2 16 16 16l416 0c8.8 0 16-7.2 16-16s-7.2-16-16-16L16 128zm0 224c-8.8 0-16 7.2-16 16s7.2 16 16 16l416 0c8.8 0 16-7.2 16-16s-7.2-16-16-16L16 352z" />
      )}
      {variant === "duotone-solid" && (
        <path d="M32 128c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 128zm0 192c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 320z" />
      )}
      {variant === "classic-solid" && (
        <path d="M32 128c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 128zm0 192c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 320z" />
      )}
      {variant === "classic-light" && (
        <path d="M16 128c-8.8 0-16 7.2-16 16s7.2 16 16 16l416 0c8.8 0 16-7.2 16-16s-7.2-16-16-16L16 128zm0 224c-8.8 0-16 7.2-16 16s7.2 16 16 16l416 0c8.8 0 16-7.2 16-16s-7.2-16-16-16L16 352z" />
      )}
      {variant === "sharp-duotone-light" && (
        <path d="M16 128l-16 0 0 32 448 0 0-32-432 0zm0 224l-16 0 0 32 448 0 0-32-432 0z" />
      )}
      {variant === "sharp-light" && (
        <path d="M16 128l-16 0 0 32 448 0 0-32-432 0zm0 224l-16 0 0 32 448 0 0-32-432 0z" />
      )}
      {variant === "classic-regular" && (
        <path d="M24 128c-13.3 0-24 10.7-24 24s10.7 24 24 24l400 0c13.3 0 24-10.7 24-24s-10.7-24-24-24L24 128zm0 208c-13.3 0-24 10.7-24 24s10.7 24 24 24l400 0c13.3 0 24-10.7 24-24s-10.7-24-24-24L24 336z" />
      )}
      {variant === "duotone-regular" && (
        <path d="M24 128c-13.3 0-24 10.7-24 24s10.7 24 24 24l400 0c13.3 0 24-10.7 24-24s-10.7-24-24-24L24 128zm0 208c-13.3 0-24 10.7-24 24s10.7 24 24 24l400 0c13.3 0 24-10.7 24-24s-10.7-24-24-24L24 336z" />
      )}
      {variant === "sharp-solid" && (
        <path d="M32 128l-32 0 0 64 448 0 0-64-416 0zm0 192l-32 0 0 64 448 0 0-64-416 0z" />
      )}
      {variant === "sharp-duotone-solid" && (
        <path opacity=".4" d="M32 128l-32 0 0 64 448 0 0-64-416 0zm0 192l-32 0 0 64 448 0 0-64-416 0z" />
      )}
      {variant === "sharp-regular" && (
        <path d="M24 128l-24 0 0 48 448 0 0-48-424 0zm0 208l-24 0 0 48 448 0 0-48-424 0z" />
      )}
      {variant === "sharp-duotone-regular" && (
        <path d="M24 128l-24 0 0 48 448 0 0-48-424 0zm0 208l-24 0 0 48 448 0 0-48-424 0z" />
      )}
    </svg>
  );
}
