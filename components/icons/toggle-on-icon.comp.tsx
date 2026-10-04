import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `toggle-on`, in Duotone Light (the default), Duotone Solid or
 * Classic Solid, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ToggleOnIcon({ className, variant = "duotone-light" }: IconProps) {
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
          <path
            opacity=".4"
            d="M32 256c0 70.7 57.3 128 128 128l256 0c70.7 0 128-57.3 128-128S486.7 128 416 128l-256 0C89.3 128 32 185.3 32 256zm480 0a96 96 0 1 1 -192 0 96 96 0 1 1 192 0z"
          />
          <path d="M160 128C89.3 128 32 185.3 32 256S89.3 384 160 384l256 0c70.7 0 128-57.3 128-128S486.7 128 416 128l-256 0zM0 256C0 167.6 71.6 96 160 96l256 0c88.4 0 160 71.6 160 160S504.4 416 416 416l-256 0C71.6 416 0 344.4 0 256zm480 0a64 64 0 1 0 -128 0 64 64 0 1 0 128 0zm-160 0a96 96 0 1 1 192 0 96 96 0 1 1 -192 0z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M0 256C0 362 86 448 192 448l192 0c106 0 192-86 192-192S490 64 384 64L192 64C86 64 0 150 0 256zm480 0a96 96 0 1 1 -192 0 96 96 0 1 1 192 0z"
          />
          <path d="M288 256a96 96 0 1 1 192 0 96 96 0 1 1 -192 0z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M192 64C86 64 0 150 0 256S86 448 192 448l192 0c106 0 192-86 192-192S490 64 384 64L192 64zm192 96a96 96 0 1 1 0 192 96 96 0 1 1 0-192z" />
      )}
    </svg>
  );
}
