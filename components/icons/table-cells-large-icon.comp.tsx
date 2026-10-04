import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `table-cells-large`, in Duotone Light (the default), Duotone
 * Solid or Classic Solid, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function TableCellsLargeIcon({ className, variant = "duotone-light" }: IconProps) {
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
            d="M32 96c0-17.7 14.3-32 32-32l144 0 0 176-176 0 0-144zm0 176l176 0 0 176-144 0c-17.7 0-32-14.3-32-32l0-144zM240 64l144 0c17.7 0 32 14.3 32 32l0 144-176 0 0-176zm0 208l176 0 0 144c0 17.7-14.3 32-32 32l-144 0 0-176z"
          />
          <path d="M240 64l0 176 176 0 0-144c0-17.7-14.3-32-32-32L240 64zm-32 0L64 64C46.3 64 32 78.3 32 96l0 144 176 0 0-176zM0 272L0 96C0 60.7 28.7 32 64 32l320 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 272zm416 0l-176 0 0 176 144 0c17.7 0 32-14.3 32-32l0-144zM208 448l0-176-176 0 0 144c0 17.7 14.3 32 32 32l144 0z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path opacity=".4" d="M64 224l0 64 128 0 0 128 64 0 0-128 128 0 0-64-128 0 0-128-64 0 0 128-128 0z" />
          <path d="M384 96l0 320-320 0 0-320 320 0zM64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L64 32z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M384 96l-128 0 0 128 128 0 0-128zm64 128l0 192c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96C0 60.7 28.7 32 64 32l320 0c35.3 0 64 28.7 64 64l0 128zM64 288l0 128 128 0 0-128-128 0zm128-64l0-128-128 0 0 128 128 0zm64 64l0 128 128 0 0-128-128 0z" />
      )}
    </svg>
  );
}
