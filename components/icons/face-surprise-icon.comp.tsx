import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `face-surprise`, in Duotone Light (the default), Duotone
 * Solid, Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function FaceSurpriseIcon({ className, variant = "duotone-light" }: IconProps) {
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
        <>
          <path
            opacity=".4"
            d="M32 256a224 224 0 1 0 448 0 224 224 0 1 0 -448 0zm168-48a24 24 0 1 1 -48 0 24 24 0 1 1 48 0zM336 352a80 80 0 1 1 -160 0 80 80 0 1 1 160 0zm24-144a24 24 0 1 1 -48 0 24 24 0 1 1 48 0z"
          />
          <path d="M480 256a224 224 0 1 0 -448 0 224 224 0 1 0 448 0zM0 256a256 256 0 1 1 512 0 256 256 0 1 1 -512 0zm176-72a24 24 0 1 1 0 48 24 24 0 1 1 0-48zm136 24a24 24 0 1 1 48 0 24 24 0 1 1 -48 0zM208 352a48 48 0 1 0 96 0 48 48 0 1 0 -96 0zm48 80a80 80 0 1 1 0-160 80 80 0 1 1 0 160z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M0 256a256 256 0 1 0 512 0 256 256 0 1 0 -512 0zm208-48a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zM320 352a64 64 0 1 1 -128 0 64 64 0 1 1 128 0zm48-144a32 32 0 1 1 -64 0 32 32 0 1 1 64 0z"
          />
          <path d="M176 240a32 32 0 1 0 0-64 32 32 0 1 0 0 64zm160 0a32 32 0 1 0 0-64 32 32 0 1 0 0 64z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512zM176 176a32 32 0 1 1 0 64 32 32 0 1 1 0-64zm128 32a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm-48 80a64 64 0 1 1 0 128 64 64 0 1 1 0-128z" />
      )}
      {variant === "classic-light" && (
        <path d="M480 256a224 224 0 1 0 -448 0 224 224 0 1 0 448 0zM0 256a256 256 0 1 1 512 0 256 256 0 1 1 -512 0zm176-72a24 24 0 1 1 0 48 24 24 0 1 1 0-48zm136 24a24 24 0 1 1 48 0 24 24 0 1 1 -48 0zM208 352a48 48 0 1 0 96 0 48 48 0 1 0 -96 0zm48 80a80 80 0 1 1 0-160 80 80 0 1 1 0 160z" />
      )}
      {variant === "sharp-duotone-light" && (
        <>
          <path
            opacity=".4"
            d="M32 256a224 224 0 1 0 448 0 224 224 0 1 0 -448 0zm168-48a24 24 0 1 1 -48 0 24 24 0 1 1 48 0zM336 352a80 80 0 1 1 -160 0 80 80 0 1 1 160 0zm24-144a24 24 0 1 1 -48 0 24 24 0 1 1 48 0z"
          />
          <path d="M480 256a224 224 0 1 0 -448 0 224 224 0 1 0 448 0zM0 256a256 256 0 1 1 512 0 256 256 0 1 1 -512 0zm176-72a24 24 0 1 1 0 48 24 24 0 1 1 0-48zm136 24a24 24 0 1 1 48 0 24 24 0 1 1 -48 0zM208 352a48 48 0 1 0 96 0 48 48 0 1 0 -96 0zm48 80a80 80 0 1 1 0-160 80 80 0 1 1 0 160z" />
        </>
      )}
      {variant === "sharp-light" && (
        <path d="M480 256a224 224 0 1 0 -448 0 224 224 0 1 0 448 0zM0 256a256 256 0 1 1 512 0 256 256 0 1 1 -512 0zm176-72a24 24 0 1 1 0 48 24 24 0 1 1 0-48zm136 24a24 24 0 1 1 48 0 24 24 0 1 1 -48 0zM208 352a48 48 0 1 0 96 0 48 48 0 1 0 -96 0zm48 80a80 80 0 1 1 0-160 80 80 0 1 1 0 160z" />
      )}
    </svg>
  );
}
