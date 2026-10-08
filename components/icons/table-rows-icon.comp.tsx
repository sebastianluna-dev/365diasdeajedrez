import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `table-rows`, in Duotone Light (the default), Duotone Solid,
 * Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function TableRowsIcon({ className, variant = "duotone-light" }: IconProps) {
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
        <>
          <path
            opacity=".4"
            d="M160 64l0 176 256 0 0-144c0-17.7-14.3-32-32-32L160 64zm0 208l0 176 224 0c17.7 0 32-14.3 32-32l0-144-256 0z"
          />
          <path d="M384 64c17.7 0 32 14.3 32 32l0 144-256 0 0-176 224 0zm32 208l0 144c0 17.7-14.3 32-32 32l-224 0 0-176 256 0zM160 32L64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L160 32zM64 448c-17.7 0-32-14.3-32-32L32 96c0-17.7 14.3-32 32-32l64 0 0 384-64 0z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path opacity=".4" d="M128 224l256 0 0 64-256 0 0-64z" />
          <path d="M128 416l256 0 0-320-256 0 0 320zM64 480c-35.3 0-64-28.7-64-64L0 96C0 60.7 28.7 32 64 32l320 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M0 96C0 60.7 28.7 32 64 32l320 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96zm128 0l0 128 256 0 0-128-256 0zM384 288l-256 0 0 128 256 0 0-128z" />
      )}
      {variant === "classic-light" && (
        <path d="M384 64c17.7 0 32 14.3 32 32l0 144-256 0 0-176 224 0zm32 208l0 144c0 17.7-14.3 32-32 32l-224 0 0-176 256 0zM160 32L64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L160 32zM64 448c-17.7 0-32-14.3-32-32L32 96c0-17.7 14.3-32 32-32l64 0 0 384-64 0z" />
      )}
    </svg>
  );
}
