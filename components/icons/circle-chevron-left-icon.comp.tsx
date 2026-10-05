import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `circle-chevron-left`, in Duotone Light (the default),
 * Duotone Solid, Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function CircleChevronLeftIcon({ className, variant = "duotone-light" }: IconProps) {
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
            d="M32 256a224 224 0 1 0 448 0 224 224 0 1 0 -448 0zm132.7-11.3l112-112c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6L198.6 256 299.3 356.7c6.2 6.2 6.2 16.4 0 22.6s-16.4 6.2-22.6 0l-112-112c-6.2-6.2-6.2-16.4 0-22.6z"
          />
          <path d="M32 256a224 224 0 1 1 448 0 224 224 0 1 1 -448 0zm480 0a256 256 0 1 0 -512 0 256 256 0 1 0 512 0zM276.7 132.7l-112 112c-6.2 6.2-6.2 16.4 0 22.6l112 112c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6L198.6 256 299.3 155.3c6.2-6.2 6.2-16.4 0-22.6s-16.4-6.2-22.6 0z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M0 256a256 256 0 1 0 512 0 256 256 0 1 0 -512 0zm167-17L271 135c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-87 87 87 87c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0L167 273c-9.4-9.4-9.4-24.6 0-33.9z"
          />
          <path d="M167 273c-9.4-9.4-9.4-24.6 0-33.9L271 135c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-87 87 87 87c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0L167 273z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M512 256a256 256 0 1 0 -512 0 256 256 0 1 0 512 0zM271 135c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-87 87 87 87c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0L167 273c-9.4-9.4-9.4-24.6 0-33.9L271 135z" />
      )}
      {variant === "classic-light" && (
        <path d="M32 256a224 224 0 1 1 448 0 224 224 0 1 1 -448 0zm480 0a256 256 0 1 0 -512 0 256 256 0 1 0 512 0zM276.7 132.7l-112 112c-6.2 6.2-6.2 16.4 0 22.6l112 112c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6L198.6 256 299.3 155.3c6.2-6.2 6.2-16.4 0-22.6s-16.4-6.2-22.6 0z" />
      )}
    </svg>
  );
}
