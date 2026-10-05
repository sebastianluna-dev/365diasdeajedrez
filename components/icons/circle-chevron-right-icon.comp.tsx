import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `circle-chevron-right`, in Duotone Light (the default),
 * Duotone Solid, Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function CircleChevronRightIcon({ className, variant = "duotone-light" }: IconProps) {
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
            d="M480 256a224 224 0 1 1 -448 0 224 224 0 1 1 448 0zM212.7 132.7c-6.2 6.2-6.2 16.4 0 22.6L313.4 256 212.7 356.7c-6.2 6.2-6.2 16.4 0 22.6s16.4 6.2 22.6 0l112-112c6.2-6.2 6.2-16.4 0-22.6l-112-112c-6.2-6.2-16.4-6.2-22.6 0z"
          />
          <path d="M480 256a224 224 0 1 1 -448 0 224 224 0 1 1 448 0zM0 256a256 256 0 1 0 512 0 256 256 0 1 0 -512 0zM235.3 379.3l112-112c6.2-6.2 6.2-16.4 0-22.6l-112-112c-6.2-6.2-16.4-6.2-22.6 0s-6.2 16.4 0 22.6L313.4 256 212.7 356.7c-6.2 6.2-6.2 16.4 0 22.6s16.4 6.2 22.6 0z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M512 256a256 256 0 1 1 -512 0 256 256 0 1 1 512 0zM207 135c-9.4 9.4-9.4 24.6 0 33.9l87 87-87 87c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0L345 273c9.4-9.4 9.4-24.6 0-33.9L241 135c-9.4-9.4-24.6-9.4-33.9 0z"
          />
          <path d="M345 239c9.4 9.4 9.4 24.6 0 33.9L241 377c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l87-87-87-87c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0L345 239z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M0 256a256 256 0 1 0 512 0 256 256 0 1 0 -512 0zM241 377c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l87-87-87-87c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0L345 239c9.4 9.4 9.4 24.6 0 33.9L241 377z" />
      )}
      {variant === "classic-light" && (
        <path d="M480 256a224 224 0 1 1 -448 0 224 224 0 1 1 448 0zM0 256a256 256 0 1 0 512 0 256 256 0 1 0 -512 0zM235.3 379.3l112-112c6.2-6.2 6.2-16.4 0-22.6l-112-112c-6.2-6.2-16.4-6.2-22.6 0s-6.2 16.4 0 22.6L313.4 256 212.7 356.7c-6.2 6.2-6.2 16.4 0 22.6s16.4 6.2 22.6 0z" />
      )}
    </svg>
  );
}
