import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `toggle-off`, in Duotone Light (the default), Duotone Solid
 * or Classic Solid, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ToggleOffIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="-53.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "duotone-light" && (
        <>
          <path opacity=".4" d="M224 256a64 64 0 1 1 -128 0 64 64 0 1 1 128 0z" />
          <path d="M416 128c70.7 0 128 57.3 128 128S486.7 384 416 384l-256 0C89.3 384 32 326.7 32 256S89.3 128 160 128l256 0zM576 256c0-88.4-71.6-160-160-160L160 96C71.6 96 0 167.6 0 256S71.6 416 160 416l256 0c88.4 0 160-71.6 160-160zm-352 0a64 64 0 1 1 -128 0 64 64 0 1 1 128 0zM64 256a96 96 0 1 0 192 0 96 96 0 1 0 -192 0z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M0 256C0 362 86 448 192 448l192 0c106 0 192-86 192-192S490 64 384 64L192 64C86 64 0 150 0 256zm64 0c0-70.7 57.3-128 128-128l192 0c70.7 0 128 57.3 128 128S454.7 384 384 384l-192 0c-70.7 0-128-57.3-128-128z"
          />
          <path d="M112 256a80 80 0 1 0 160 0 80 80 0 1 0 -160 0z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M384 128c70.7 0 128 57.3 128 128S454.7 384 384 384l-192 0c-70.7 0-128-57.3-128-128s57.3-128 128-128l192 0zM576 256c0-106-86-192-192-192L192 64C86 64 0 150 0 256S86 448 192 448l192 0c106 0 192-86 192-192zM192 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z" />
      )}
    </svg>
  );
}
