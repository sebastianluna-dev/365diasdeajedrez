import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `arrows-left-right`, in Duotone Light (the default), Duotone
 * Solid, Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ArrowsLeftRightIcon({ className, variant = "duotone-light" }: IconProps) {
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
        <path d="M459.3 379.3l112-112c6.2-6.2 6.2-16.4 0-22.6l-112-112c-6.2-6.2-16.4-6.2-22.6 0s-6.2 16.4 0 22.6l84.7 84.7-466.7 0 84.7-84.7c6.2-6.2 6.2-16.4 0-22.6s-16.4-6.2-22.6 0l-112 112c-3 3-4.7 7.1-4.7 11.3s1.7 8.3 4.7 11.3l112 112c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-84.7-84.7 466.7 0-84.7 84.7c-6.2 6.2-6.2 16.4 0 22.6s16.4 6.2 22.6 0z" />
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M288 224l0 64 178.7 0-41.4 41.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l96-96c12.5-12.5 12.5-32.8 0-45.3l-96-96c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L466.7 224 288 224z"
          />
          <path d="M150.6 182.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-96 96c-12.5 12.5-12.5 32.8 0 45.3l96 96c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-41.4-41.4 178.7 0 0-64-178.7 0 41.4-41.4z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M470.6 374.6l96-96c12.5-12.5 12.5-32.8 0-45.3l-96-96c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l41.4 41.4-357.5 0 41.4-41.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-96 96c-6 6-9.4 14.1-9.4 22.6s3.4 16.6 9.4 22.6l96 96c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-41.4-41.4 357.5 0-41.4 41.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0z" />
      )}
      {variant === "classic-light" && (
        <path d="M459.3 379.3l112-112c6.2-6.2 6.2-16.4 0-22.6l-112-112c-6.2-6.2-16.4-6.2-22.6 0s-6.2 16.4 0 22.6l84.7 84.7-466.7 0 84.7-84.7c6.2-6.2 6.2-16.4 0-22.6s-16.4-6.2-22.6 0l-112 112c-3 3-4.7 7.1-4.7 11.3s1.7 8.3 4.7 11.3l112 112c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-84.7-84.7 466.7 0-84.7 84.7c-6.2 6.2-6.2 16.4 0 22.6s16.4 6.2 22.6 0z" />
      )}
    </svg>
  );
}
