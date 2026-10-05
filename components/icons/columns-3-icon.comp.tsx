import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `columns-3`, in Duotone Light (the default), Duotone Solid,
 * Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function Columns3Icon({ className, variant = "duotone-light" }: IconProps) {
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
            d="M32 96l0 320c0 17.7 14.3 32 32 32l64 0 0-384-64 0C46.3 64 32 78.3 32 96zM160 64l0 384 128 0 0-384-128 0zm160 0l0 384 64 0c17.7 0 32-14.3 32-32l0-320c0-17.7-14.3-32-32-32l-64 0z"
          />
          <path d="M320 64l0 384 64 0c17.7 0 32-14.3 32-32l0-320c0-17.7-14.3-32-32-32l-64 0zm-32 0l-128 0 0 384 128 0 0-384zM128 448l0-384-64 0C46.3 64 32 78.3 32 96l0 320c0 17.7 14.3 32 32 32l64 0zM0 96C0 60.7 28.7 32 64 32l320 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path opacity=".4" d="M128 96l64 0 0 320-64 0 0-320zm128 0l64 0 0 320-64 0 0-320z" />
          <path d="M64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L64 32zM384 96l0 320-320 0 0-320 320 0z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M320 96l0 320 64 0 0-320-64 0zm-64 0l-64 0 0 320 64 0 0-320zM128 416l0-320-64 0 0 320 64 0zM0 96C0 60.7 28.7 32 64 32l320 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96z" />
      )}
      {variant === "classic-light" && (
        <path d="M320 64l0 384 64 0c17.7 0 32-14.3 32-32l0-320c0-17.7-14.3-32-32-32l-64 0zm-32 0l-128 0 0 384 128 0 0-384zM128 448l0-384-64 0C46.3 64 32 78.3 32 96l0 320c0 17.7 14.3 32 32 32l64 0zM0 96C0 60.7 28.7 32 64 32l320 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96z" />
      )}
    </svg>
  );
}
