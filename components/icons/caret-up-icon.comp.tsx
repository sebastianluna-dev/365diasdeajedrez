import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `caret-up`, in Duotone Light (the default), Duotone Solid or
 * Classic Solid, as `variant` says. Its Duotone Solid drawing is a single
 * layer, drawn at full strength: at 40 % it would read as switched off.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function CaretUpIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="-181.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "duotone-light" && (
        <>
          <path
            opacity=".4"
            d="M16.5 288l144-144 144 144-16 16-256 0-16-16zm16 0l256 0c-42.6-42.6-85.1-85.2-128-127.6-.3 .1-.7 .3-1.1 .7L32.5 288z"
          />
          <path d="M137.9 137.4c12.9-11.6 32.4-12.8 45.2 0l128 128c9.2 9.2 11.9 22.9 6.9 34.9l-2.2 4.3c-5.7 9.5-16.1 15.5-27.4 15.5l-256 0-4.8-.3c-9.4-1.4-17.7-7-22.6-15.1l-2.2-4.3C-1.4 289.8 .2 277.9 6.7 269l3.1-3.7 128-128zm22.7 23c-.3 .1-.7 .3-1.1 .7L32.5 288 288.5 288 160.8 160.3c-.1 0-.2 .1-.2 .1z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <path d="M140.3 135.2c12.6-10.3 31.1-9.5 42.8 2.2l128 128c9.2 9.2 11.9 22.9 6.9 34.9S301.4 320 288.5 320l-256 0c-12.9 0-24.6-7.8-29.6-19.8S.7 274.5 9.9 265.4l128-128 2.4-2.2z" />
      )}
      {variant === "classic-solid" && (
        <path d="M140.3 135.2c12.6-10.3 31.1-9.5 42.8 2.2l128 128c9.2 9.2 11.9 22.9 6.9 34.9S301.4 320 288.5 320l-256 0c-12.9 0-24.6-7.8-29.6-19.8S.7 274.5 9.9 265.4l128-128 2.4-2.2z" />
      )}
    </svg>
  );
}
