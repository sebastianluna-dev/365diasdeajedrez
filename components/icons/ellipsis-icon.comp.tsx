import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * The three dots that open what else can be done to a row, which draws them in
 * Duotone Solid. Its `viewBox` is cut close around the dots, because its
 * callers draw it in a 16×4 box. Font Awesome's `ellipsis`, in Duotone Light
 * (the default), Duotone Solid, Classic Solid or Classic Light, as `variant`
 * says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function EllipsisIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox={
        {
          "duotone-light": "0 200 448 112",
          "duotone-solid": "0 200 448 112",
          "classic-solid": "0 200 448 112",
          "classic-light": "0 200 448 112",
          "sharp-duotone-light": "-117.33 -85.33 682.67 682.67",
          "sharp-light": "-117.33 -85.33 682.67 682.67",
          "classic-regular": "-117.33 -85.33 682.67 682.67",
          "duotone-regular": "-117.33 -85.33 682.67 682.67",
          "sharp-solid": "-117.33 -85.33 682.67 682.67",
          "sharp-duotone-solid": "-117.33 -85.33 682.67 682.67",
          "sharp-regular": "-117.33 -85.33 682.67 682.67",
          "sharp-duotone-regular": "-117.33 -85.33 682.67 682.67",
        }[variant]
      }
      width="16"
      height="4"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "duotone-light" && (
        <path d="M448 256a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zm-192 0a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zM32 288a32 32 0 1 1 0-64 32 32 0 1 1 0 64z" />
      )}
      {variant === "duotone-solid" && (
        <>
          <path opacity=".4" d="M168 256a56 56 0 1 0 112 0 56 56 0 1 0 -112 0z" />
          <path d="M56 312a56 56 0 1 0 0-112 56 56 0 1 0 0 112zm336 0a56 56 0 1 0 0-112 56 56 0 1 0 0 112z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M0 256a56 56 0 1 1 112 0 56 56 0 1 1 -112 0zm168 0a56 56 0 1 1 112 0 56 56 0 1 1 -112 0zm224-56a56 56 0 1 1 0 112 56 56 0 1 1 0-112z" />
      )}
      {variant === "classic-light" && (
        <path d="M448 256a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zm-192 0a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zM32 288a32 32 0 1 1 0-64 32 32 0 1 1 0 64z" />
      )}
      {variant === "sharp-duotone-light" && (
        <path d="M0 288l0-64 64 0 0 64-64 0zm192 0l0-64 64 0 0 64-64 0zm192-64l64 0 0 64-64 0 0-64z" />
      )}
      {variant === "sharp-light" && (
        <path d="M0 288l0-64 64 0 0 64-64 0zm192 0l0-64 64 0 0 64-64 0zm192-64l64 0 0 64-64 0 0-64z" />
      )}
      {variant === "classic-regular" && (
        <path d="M448 256a48 48 0 1 1 -96 0 48 48 0 1 1 96 0zm-176 0a48 48 0 1 1 -96 0 48 48 0 1 1 96 0zM48 304a48 48 0 1 1 0-96 48 48 0 1 1 0 96z" />
      )}
      {variant === "duotone-regular" && (
        <path d="M448 256a48 48 0 1 1 -96 0 48 48 0 1 1 96 0zm-176 0a48 48 0 1 1 -96 0 48 48 0 1 1 96 0zM48 304a48 48 0 1 1 0-96 48 48 0 1 1 0 96z" />
      )}
      {variant === "sharp-solid" && (
        <path d="M112 200l0 112-112 0 0-112 112 0zm168 0l0 112-112 0 0-112 112 0zM448 312l-112 0 0-112 112 0 0 112z" />
      )}
      {variant === "sharp-duotone-solid" && (
        <>
          <path opacity=".4" d="M168 200l0 112 112 0 0-112-112 0z" />
          <path d="M112 312l0-112-112 0 0 112 112 0zm336 0l0-112-112 0 0 112 112 0z" />
        </>
      )}
      {variant === "sharp-regular" && (
        <path d="M0 304l0-96 96 0 0 96-96 0zm176 0l0-96 96 0 0 96-96 0zm176-96l96 0 0 96-96 0 0-96z" />
      )}
      {variant === "sharp-duotone-regular" && (
        <path d="M0 304l0-96 96 0 0 96-96 0zm176 0l0-96 96 0 0 96-96 0zm176-96l96 0 0 96-96 0 0-96z" />
      )}
    </svg>
  );
}
