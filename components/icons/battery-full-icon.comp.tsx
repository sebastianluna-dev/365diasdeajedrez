import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `battery-full`, in Duotone Light (the default), Duotone Solid
 * or Classic Solid, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function BatteryFullIcon({ className, variant = "duotone-light" }: IconProps) {
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
          <path opacity=".4" d="M160 192l0 128 288 0 0-128-288 0z" />
          <path d="M496 96c26.5 0 48 21.5 48 48l0 224c0 26.5-21.5 48-48 48l-384 0c-26.5 0-48-21.5-48-48l0-224c0-26.5 21.5-48 48-48l384 0zm80 272l0-32 32 0c17.7 0 32-14.3 32-32l0-96c0-17.7-14.3-32-32-32l-32 0 0-32c0-44.2-35.8-80-80-80L112 64c-44.2 0-80 35.8-80 80l0 224c0 44.2 35.8 80 80 80l384 0c44.2 0 80-35.8 80-80zm0-64l0-96 32 0 0 96-32 0zM160 320l0-128 288 0 0 128-288 0zM128 184l0 144c0 13.3 10.7 24 24 24l304 0c13.3 0 24-10.7 24-24l0-144c0-13.3-10.7-24-24-24l-304 0c-13.3 0-24 10.7-24 24z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M32 144c0-44.2 35.8-80 80-80l416 0c44.2 0 80 35.8 80 80l0 48c17.7 0 32 14.3 32 32l0 64c0 17.7-14.3 32-32 32l0 48c0 44.2-35.8 80-80 80l-416 0c-44.2 0-80-35.8-80-80l0-224zm64 0l0 224c0 8.8 7.2 16 16 16l416 0c8.8 0 16-7.2 16-16l0-224c0-8.8-7.2-16-16-16l-416 0c-8.8 0-16 7.2-16 16z"
          />
          <path d="M144 200c0-13.3 10.7-24 24-24l304 0c13.3 0 24 10.7 24 24l0 112c0 13.3-10.7 24-24 24l-304 0c-13.3 0-24-10.7-24-24l0-112z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M528 128c8.8 0 16 7.2 16 16l0 224c0 8.8-7.2 16-16 16l-416 0c-8.8 0-16-7.2-16-16l0-224c0-8.8 7.2-16 16-16l416 0zM112 64c-44.2 0-80 35.8-80 80l0 224c0 44.2 35.8 80 80 80l416 0c44.2 0 80-35.8 80-80l0-48c17.7 0 32-14.3 32-32l0-64c0-17.7-14.3-32-32-32l0-48c0-44.2-35.8-80-80-80L112 64zm56 112c-13.3 0-24 10.7-24 24l0 112c0 13.3 10.7 24 24 24l304 0c13.3 0 24-10.7 24-24l0-112c0-13.3-10.7-24-24-24l-304 0z" />
      )}
    </svg>
  );
}
