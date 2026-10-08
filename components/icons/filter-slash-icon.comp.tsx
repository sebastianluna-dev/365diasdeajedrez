import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `filter-slash`, in Duotone Light (the default), Duotone Solid,
 * Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function FilterSlashIcon({ className, variant = "duotone-light" }: IconProps) {
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
          <path opacity=".4" d="M150.5 96L512 96 331.3 276.7 150.5 96z" />
          <path d="M27.3-27.2c-6.2-6.2-16.4-6.2-22.6 0s-6.2 16.4 0 22.6l544 544c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6L353.9 299.4 534.6 118.6c9.2-9.2 11.9-22.9 6.9-34.9S524.9 64 512 64L118.5 64 27.3-27.2zM150.5 96L512 96 331.3 276.7 150.5 96zM224 301.3l0 0 0 114.7c0 8.5 3.4 16.6 9.4 22.6l64 64c9.2 9.2 22.9 11.9 34.9 6.9S352 492.9 352 480l0-69.5-32-32 0 101.5-64-64 0-101.5-32-32 0 18.7z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M224 293.8l128 128 0 58.2c0 12.9-7.8 24.6-19.8 29.6s-25.7 2.2-34.9-6.9l-64-64c-6-6-9.4-14.1-9.4-22.6 0-38.2 0-76.5 0-114.7l0-7.4z"
          />
          <path d="M7-24.9c9.4-9.4 24.6-9.4 33.9 0L129.8 64 512 64c12.9 0 24.6 7.8 29.6 19.8s2.2 25.7-6.9 34.9L359.6 293.7 569 503.1c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0L7 9.1C-2.3-.3-2.3-15.5 7-24.9z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M41-24.9c-9.4-9.4-24.6-9.4-33.9 0S-2.3-.3 7 9.1l528 528c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9L359.6 293.7 534.6 118.6c9.2-9.2 11.9-22.9 6.9-34.9S524.9 64 512 64L129.8 64 41-24.9zM224 301.3l0 0 0 114.7c0 8.5 3.4 16.6 9.4 22.6l64 64c9.2 9.2 22.9 11.9 34.9 6.9S352 492.9 352 480l0-58.2-128-128 0 7.4z" />
      )}
      {variant === "classic-light" && (
        <path d="M27.3-27.2c-6.2-6.2-16.4-6.2-22.6 0s-6.2 16.4 0 22.6l544 544c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6L353.9 299.4 534.6 118.6c9.2-9.2 11.9-22.9 6.9-34.9S524.9 64 512 64L118.5 64 27.3-27.2zM150.5 96L512 96 331.3 276.7 150.5 96zM224 301.3l0 0 0 114.7c0 8.5 3.4 16.6 9.4 22.6l64 64c9.2 9.2 22.9 11.9 34.9 6.9S352 492.9 352 480l0-69.5-32-32 0 101.5-64-64 0-101.5-32-32 0 18.7z" />
      )}
    </svg>
  );
}
