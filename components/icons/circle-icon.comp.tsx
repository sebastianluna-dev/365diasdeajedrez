import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `circle`, in twelve styles (Duotone Light is the default), as `variant` says. Its Duotone Solid drawing
 * is a single layer, drawn at full strength: at 40 % it would read as switched
 * off.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function CircleIcon({ className, variant = "duotone-light" }: IconProps) {
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
          <path opacity=".4" d="M32 256a224 224 0 1 0 448 0 224 224 0 1 0 -448 0z" />
          <path d="M480 256a224 224 0 1 0 -448 0 224 224 0 1 0 448 0zM0 256a256 256 0 1 1 512 0 256 256 0 1 1 -512 0z" />
        </>
      )}
      {variant === "duotone-solid" && <path d="M0 256a256 256 0 1 1 512 0 256 256 0 1 1 -512 0z" />}
      {variant === "classic-solid" && <path d="M0 256a256 256 0 1 1 512 0 256 256 0 1 1 -512 0z" />}
      {variant === "classic-light" && (
        <path d="M480 256a224 224 0 1 0 -448 0 224 224 0 1 0 448 0zM0 256a256 256 0 1 1 512 0 256 256 0 1 1 -512 0z" />
      )}
      {variant === "sharp-duotone-light" && (
        <>
          <path opacity=".4" d="M32 256a224 224 0 1 0 448 0 224 224 0 1 0 -448 0z" />
          <path d="M480 256a224 224 0 1 0 -448 0 224 224 0 1 0 448 0zM0 256a256 256 0 1 1 512 0 256 256 0 1 1 -512 0z" />
        </>
      )}
      {variant === "sharp-light" && (
        <path d="M480 256a224 224 0 1 0 -448 0 224 224 0 1 0 448 0zM0 256a256 256 0 1 1 512 0 256 256 0 1 1 -512 0z" />
      )}
      {variant === "classic-regular" && (
        <path d="M464 256a208 208 0 1 0 -416 0 208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0 256 256 0 1 1 -512 0z" />
      )}
      {variant === "duotone-regular" && (
        <>
          <path opacity=".4" d="M48 256a208 208 0 1 0 416 0 208 208 0 1 0 -416 0z" />
          <path d="M464 256a208 208 0 1 0 -416 0 208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0 256 256 0 1 1 -512 0z" />
        </>
      )}
      {variant === "sharp-solid" && <path d="M0 256a256 256 0 1 1 512 0 256 256 0 1 1 -512 0z" />}
      {variant === "sharp-duotone-solid" && <path opacity=".4" d="M0 256a256 256 0 1 1 512 0 256 256 0 1 1 -512 0z" />}
      {variant === "sharp-regular" && (
        <path d="M464 256a208 208 0 1 0 -416 0 208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0 256 256 0 1 1 -512 0z" />
      )}
      {variant === "sharp-duotone-regular" && (
        <>
          <path opacity=".4" d="M48 256a208 208 0 1 0 416 0 208 208 0 1 0 -416 0z" />
          <path d="M464 256a208 208 0 1 0 -416 0 208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0 256 256 0 1 1 -512 0z" />
        </>
      )}
    </svg>
  );
}
