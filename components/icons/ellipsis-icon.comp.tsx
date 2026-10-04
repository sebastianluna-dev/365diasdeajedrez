import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * The three dots that open what else can be done to a row, which draws them in
 * Duotone Solid. Its `viewBox` is cut close around the dots, because its
 * callers draw it in a 16×4 box. Font Awesome's `ellipsis`, in Duotone Light
 * (the default), Duotone Solid or Classic Solid, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function EllipsisIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg className={className} viewBox="0 200 448 112" width="16" height="4" fill="currentColor" aria-hidden="true">
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
    </svg>
  );
}
