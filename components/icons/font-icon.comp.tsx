import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `font`, in Duotone Light (the default), Duotone Solid or
 * Classic Solid, as `variant` says. Its Duotone Solid drawing is a single
 * layer, drawn at full strength: at 40 % it would read as switched off.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function FontIcon({ className, variant = "duotone-light" }: IconProps) {
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
        <path d="M256 32c6.4 0 12.2 3.8 14.7 9.8L442.6 448 480 448c8.8 0 16 7.2 16 16s-7.2 16-16 16l-112 0c-8.8 0-16-7.2-16-16s7.2-16 16-16l39.9 0-40.6-96-222.5 0-40.6 96 39.9 0c8.8 0 16 7.2 16 16s-7.2 16-16 16L32 480c-8.8 0-16-7.2-16-16s7.2-16 16-16l37.4 0 171.9-406.2c2.5-5.9 8.3-9.8 14.7-9.8zM158.3 320L353.7 320 256 89.1 158.3 320z" />
      )}
      {variant === "duotone-solid" && (
        <path d="M285.1 50.7C279.9 39.3 268.5 32 256 32s-23.9 7.3-29.1 18.7L59.5 416 48 416c-17.7 0-32 14.3-32 32s14.3 32 32 32l88 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-6.1 0 22-48 208.3 0 22 48-6.1 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l88 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-11.5 0-167.4-365.3zM330.8 304L181.2 304 256 140.8 330.8 304z" />
      )}
      {variant === "classic-solid" && (
        <path d="M285.1 50.7C279.9 39.3 268.5 32 256 32s-23.9 7.3-29.1 18.7L59.5 416 48 416c-17.7 0-32 14.3-32 32s14.3 32 32 32l88 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-6.1 0 22-48 208.3 0 22 48-6.1 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l88 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-11.5 0-167.4-365.3zM330.8 304L181.2 304 256 140.8 330.8 304z" />
      )}
    </svg>
  );
}
