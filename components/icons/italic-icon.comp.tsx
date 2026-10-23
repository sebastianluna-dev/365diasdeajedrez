import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `italic`, in twelve styles (Duotone Light is the default), as `variant` says. Its Duotone Solid drawing
 * is a single layer, drawn at full strength: at 40 % it would read as switched
 * off.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ItalicIcon({ className, variant = "duotone-light" }: IconProps) {
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
        <path d="M128 48c0-8.8 7.2-16 16-16l224 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-92.6 0-132.9 384 97.5 0c8.8 0 16 7.2 16 16s-7.2 16-16 16L16 480c-8.8 0-16-7.2-16-16s7.2-16 16-16l92.6 0 132.9-384-97.5 0c-8.8 0-16-7.2-16-16z" />
      )}
      {variant === "duotone-solid" && (
        <path d="M128 64c0-17.7 14.3-32 32-32l192 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-58.7 0-133.3 320 64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 480c-17.7 0-32-14.3-32-32s14.3-32 32-32l58.7 0 133.3-320-64 0c-17.7 0-32-14.3-32-32z" />
      )}
      {variant === "classic-solid" && (
        <path d="M128 64c0-17.7 14.3-32 32-32l192 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-58.7 0-133.3 320 64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 480c-17.7 0-32-14.3-32-32s14.3-32 32-32l58.7 0 133.3-320-64 0c-17.7 0-32-14.3-32-32z" />
      )}
      {variant === "classic-light" && (
        <path d="M128 48c0-8.8 7.2-16 16-16l224 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-92.6 0-132.9 384 97.5 0c8.8 0 16 7.2 16 16s-7.2 16-16 16L16 480c-8.8 0-16-7.2-16-16s7.2-16 16-16l92.6 0 132.9-384-97.5 0c-8.8 0-16-7.2-16-16z" />
      )}
      {variant === "sharp-duotone-light" && (
        <path d="M128 32l256 0 0 32-108.6 0-132.9 384 113.5 0 0 32-256 0 0-32 108.6 0 132.9-384-113.5 0 0-32z" />
      )}
      {variant === "sharp-light" && (
        <path d="M128 32l256 0 0 32-108.6 0-132.9 384 113.5 0 0 32-256 0 0-32 108.6 0 132.9-384-113.5 0 0-32z" />
      )}
      {variant === "classic-regular" && (
        <path d="M128 56c0-13.3 10.7-24 24-24l208 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-76.4 0-132 352 80.4 0c13.3 0 24 10.7 24 24s-10.7 24-24 24L24 480c-13.3 0-24-10.7-24-24s10.7-24 24-24l76.4 0 132-352-80.4 0c-13.3 0-24-10.7-24-24z" />
      )}
      {variant === "duotone-regular" && (
        <path d="M128 56c0-13.3 10.7-24 24-24l208 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-76.4 0-132 352 80.4 0c13.3 0 24 10.7 24 24s-10.7 24-24 24L24 480c-13.3 0-24-10.7-24-24s10.7-24 24-24l76.4 0 132-352-80.4 0c-13.3 0-24-10.7-24-24z" />
      )}
      {variant === "sharp-solid" && (
        <path d="M128 32l256 0 0 64-90.7 0-133.3 320 96 0 0 64-256 0 0-64 90.7 0 133.3-320-96 0 0-64z" />
      )}
      {variant === "sharp-duotone-solid" && (
        <path opacity=".4" d="M128 32l256 0 0 64-90.7 0-133.3 320 96 0 0 64-256 0 0-64 90.7 0 133.3-320-96 0 0-64z" />
      )}
      {variant === "sharp-regular" && (
        <path d="M128 32l256 0 0 48-100.4 0-132 352 104.4 0 0 48-256 0 0-48 100.4 0 132-352-104.4 0 0-48z" />
      )}
      {variant === "sharp-duotone-regular" && (
        <path d="M128 32l256 0 0 48-100.4 0-132 352 104.4 0 0 48-256 0 0-48 100.4 0 132-352-104.4 0 0-48z" />
      )}
    </svg>
  );
}
