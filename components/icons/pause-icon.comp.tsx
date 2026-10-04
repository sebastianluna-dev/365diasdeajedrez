import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Pausing the board's autoplay and the site's reviews, which draw it in
 * Duotone Solid. Font Awesome's `pause`, in Duotone Light (the default),
 * Duotone Solid or Classic Solid, as `variant` says. Its Duotone Solid drawing
 * is a single layer, drawn at full strength: at 40 % it would read as switched
 * off.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function PauseIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="-149.33 -85.33 682.67 682.67"
      width="19"
      height="22"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "duotone-light" && (
        <>
          <path
            opacity=".4"
            d="M32 80l0 352c0 8.8 7.2 16 16 16l64 0c8.8 0 16-7.2 16-16l0-352c0-8.8-7.2-16-16-16L48 64c-8.8 0-16 7.2-16 16zm224 0l0 352c0 8.8 7.2 16 16 16l64 0c8.8 0 16-7.2 16-16l0-352c0-8.8-7.2-16-16-16l-64 0c-8.8 0-16 7.2-16 16z"
          />
          <path d="M48 64c-8.8 0-16 7.2-16 16l0 352c0 8.8 7.2 16 16 16l64 0c8.8 0 16-7.2 16-16l0-352c0-8.8-7.2-16-16-16L48 64zM0 80C0 53.5 21.5 32 48 32l64 0c26.5 0 48 21.5 48 48l0 352c0 26.5-21.5 48-48 48l-64 0c-26.5 0-48-21.5-48-48L0 80zM272 64c-8.8 0-16 7.2-16 16l0 352c0 8.8 7.2 16 16 16l64 0c8.8 0 16-7.2 16-16l0-352c0-8.8-7.2-16-16-16l-64 0zM224 80c0-26.5 21.5-48 48-48l64 0c26.5 0 48 21.5 48 48l0 352c0 26.5-21.5 48-48 48l-64 0c-26.5 0-48-21.5-48-48l0-352z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <path d="M48 32C21.5 32 0 53.5 0 80L0 432c0 26.5 21.5 48 48 48l64 0c26.5 0 48-21.5 48-48l0-352c0-26.5-21.5-48-48-48L48 32zm224 0c-26.5 0-48 21.5-48 48l0 352c0 26.5 21.5 48 48 48l64 0c26.5 0 48-21.5 48-48l0-352c0-26.5-21.5-48-48-48l-64 0z" />
      )}
      {variant === "classic-solid" && (
        <path d="M48 32C21.5 32 0 53.5 0 80L0 432c0 26.5 21.5 48 48 48l64 0c26.5 0 48-21.5 48-48l0-352c0-26.5-21.5-48-48-48L48 32zm224 0c-26.5 0-48 21.5-48 48l0 352c0 26.5 21.5 48 48 48l64 0c26.5 0 48-21.5 48-48l0-352c0-26.5-21.5-48-48-48l-64 0z" />
      )}
    </svg>
  );
}
