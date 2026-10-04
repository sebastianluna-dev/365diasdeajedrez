import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `magnet`, in Duotone Light (the default), Duotone Solid or
 * Classic Solid, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function MagnetIcon({ className, variant = "duotone-light" }: IconProps) {
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
            d="M32 192l0 96c0 106 86 192 192 192s192-86 192-192l0-96-80 0 0 96c0 61.9-50.1 112-112 112S112 349.9 112 288l0-96-80 0z"
          />
          <path d="M48 64c-8.8 0-16 7.2-16 16l0 80 80 0 0-80c0-8.8-7.2-16-16-16L48 64zM32 288c0 106 86 192 192 192s192-86 192-192l0-96-80 0 0 96c0 61.9-50.1 112-112 112S112 349.9 112 288l0-96-80 0 0 96zM416 160l0-80c0-8.8-7.2-16-16-16l-48 0c-8.8 0-16 7.2-16 16l0 80 80 0zM0 80C0 53.5 21.5 32 48 32l48 0c26.5 0 48 21.5 48 48l0 208c0 44.2 35.8 80 80 80s80-35.8 80-80l0-208c0-26.5 21.5-48 48-48l48 0c26.5 0 48 21.5 48 48l0 208c0 123.7-100.3 224-224 224S0 411.7 0 288L0 80z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M0 64l0 96 128 0 0-96c0-17.7-14.3-32-32-32L32 32C14.3 32 0 46.3 0 64zm320 0l0 96 128 0 0-96c0-17.7-14.3-32-32-32l-64 0c-17.7 0-32 14.3-32 32z"
          />
          <path d="M0 160L0 288C0 411.7 100.3 512 224 512S448 411.7 448 288l0-128-128 0 0 128c0 53-43 96-96 96s-96-43-96-96l0-128-128 0z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M0 176L0 288C0 411.7 100.3 512 224 512S448 411.7 448 288l0-112-128 0 0 112c0 53-43 96-96 96s-96-43-96-96l0-112-128 0zm0-48l128 0 0-64c0-17.7-14.3-32-32-32L32 32C14.3 32 0 46.3 0 64l0 64zm320 0l128 0 0-64c0-17.7-14.3-32-32-32l-64 0c-17.7 0-32 14.3-32 32l0 64z" />
      )}
    </svg>
  );
}
