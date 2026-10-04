import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `chevrons-left`, in Duotone Light (the default), Duotone
 * Solid or Classic Solid, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ChevronsLeftIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="-117.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "duotone-light" && (
        <path d="M404.7 36.7l-208 208c-6.2 6.2-6.2 16.4 0 22.6l208 208c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6L230.6 256 427.3 59.3c6.2-6.2 6.2-16.4 0-22.6s-16.4-6.2-22.6 0zm-400 208c-6.2 6.2-6.2 16.4 0 22.6l208 208c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6L38.6 256 235.3 59.3c6.2-6.2 6.2-16.4 0-22.6s-16.4-6.2-22.6 0l-208 208z" />
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M201.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L269.3 256 438.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"
          />
          <path d="M9.4 278.6c-12.5-12.5-12.5-32.8 0-45.3l192-192c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3L77.3 256 246.6 425.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0l-192-192z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192zm384-192l-192 192c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L269.3 256 438.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0z" />
      )}
    </svg>
  );
}
