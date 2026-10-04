import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `chevrons-down`, in Duotone Light (the default), Duotone
 * Solid or Classic Solid, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ChevronsDownIcon({ className, variant = "duotone-light" }: IconProps) {
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
        <path d="M4.7 75.3l208 208c6.2 6.2 16.4 6.2 22.6 0l208-208c6.2-6.2 6.2-16.4 0-22.6s-16.4-6.2-22.6 0L224 249.4 27.3 52.7c-6.2-6.2-16.4-6.2-22.6 0s-6.2 16.4 0 22.6zm0 192l208 208c6.2 6.2 16.4 6.2 22.6 0l208-208c6.2-6.2 6.2-16.4 0-22.6s-16.4-6.2-22.6 0L224 441.4 27.3 244.7c-6.2-6.2-16.4-6.2-22.6 0s-6.2 16.4 0 22.6z" />
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M9.4 41.4C-3.1 53.9-3.1 74.1 9.4 86.6l192 192c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 210.7 54.6 41.4c-12.5-12.5-32.8-12.5-45.3 0z"
          />
          <path d="M246.6 470.6c-12.5 12.5-32.8 12.5-45.3 0l-192-192c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L224 402.7 393.4 233.4c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3l-192 192z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M246.6 470.6c-12.5 12.5-32.8 12.5-45.3 0l-192-192c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L224 402.7 393.4 233.4c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3l-192 192zm192-384l-192 192c-12.5 12.5-32.8 12.5-45.3 0L9.4 86.6C-3.1 74.1-3.1 53.9 9.4 41.4s32.8-12.5 45.3 0L224 210.7 393.4 41.4c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3z" />
      )}
    </svg>
  );
}
