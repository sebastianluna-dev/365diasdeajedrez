import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `battery-empty`, in Duotone Light (the default), Duotone
 * Solid or Classic Solid, as `variant` says. Its Duotone Solid drawing is a
 * single layer, drawn at full strength: at 40 % it would read as switched off.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function BatteryEmptyIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="-21.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "duotone-light" && (
        <>
          <path
            opacity=".4"
            d="M64 144l0 224c0 26.5 21.5 48 48 48l384 0c26.5 0 48-21.5 48-48l0-224c0-26.5-21.5-48-48-48L112 96c-26.5 0-48 21.5-48 48z"
          />
          <path d="M112 96c-26.5 0-48 21.5-48 48l0 224c0 26.5 21.5 48 48 48l384 0c26.5 0 48-21.5 48-48l0-224c0-26.5-21.5-48-48-48L112 96zM576 336l0 32c0 44.2-35.8 80-80 80l-384 0c-44.2 0-80-35.8-80-80l0-224c0-44.2 35.8-80 80-80l384 0c44.2 0 80 35.8 80 80l0 32 32 0c17.7 0 32 14.3 32 32l0 96c0 17.7-14.3 32-32 32l-32 0zm0-128l0 96 32 0 0-96-32 0z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <path d="M112 64c-44.2 0-80 35.8-80 80l0 224c0 44.2 35.8 80 80 80l416 0c44.2 0 80-35.8 80-80l0-48c17.7 0 32-14.3 32-32l0-64c0-17.7-14.3-32-32-32l0-48c0-44.2-35.8-80-80-80L112 64zM96 144c0-8.8 7.2-16 16-16l416 0c8.8 0 16 7.2 16 16l0 224c0 8.8-7.2 16-16 16l-416 0c-8.8 0-16-7.2-16-16l0-224z" />
      )}
      {variant === "classic-solid" && (
        <path d="M112 64c-44.2 0-80 35.8-80 80l0 224c0 44.2 35.8 80 80 80l416 0c44.2 0 80-35.8 80-80l0-48c17.7 0 32-14.3 32-32l0-64c0-17.7-14.3-32-32-32l0-48c0-44.2-35.8-80-80-80L112 64zM96 144c0-8.8 7.2-16 16-16l416 0c8.8 0 16 7.2 16 16l0 224c0 8.8-7.2 16-16 16l-416 0c-8.8 0-16-7.2-16-16l0-224z" />
      )}
    </svg>
  );
}
