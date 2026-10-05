import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `arrows-up-down`, in Duotone Light (the default), Duotone
 * Solid, Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ArrowsUpDownIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="-213.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "duotone-light" && (
        <path d="M4.7 427.3l112 112c6.2 6.2 16.4 6.2 22.6 0l112-112c6.2-6.2 6.2-16.4 0-22.6s-16.4-6.2-22.6 0l-84.7 84.7 0-466.7 84.7 84.7c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-112-112c-3-3-7.1-4.7-11.3-4.7s-8.3 1.7-11.3 4.7L4.7 84.7c-6.2 6.2-6.2 16.4 0 22.6s16.4 6.2 22.6 0l84.7-84.7 0 466.7-84.7-84.7c-6.2-6.2-16.4-6.2-22.6 0s-6.2 16.4 0 22.6z" />
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M9.4 393.4c-12.5 12.5-12.5 32.8 0 45.3l96 96c12.5 12.5 32.8 12.5 45.3 0l96-96c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-41.4 41.4 0-178.7-64 0 0 178.7-41.4-41.4c-12.5-12.5-32.8-12.5-45.3 0z"
          />
          <path d="M201.4 118.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-96-96c-12.5-12.5-32.8-12.5-45.3 0l-96 96c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l41.4-41.4 0 178.7 64 0 0-178.7 41.4 41.4z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M150.6-22.6c-12.5-12.5-32.8-12.5-45.3 0l-96 96c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L96 77.3 96 434.7 54.6 393.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l96 96c6 6 14.1 9.4 22.6 9.4s16.6-3.4 22.6-9.4l96-96c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-41.4 41.4 0-357.5 41.4 41.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-96-96z" />
      )}
      {variant === "classic-light" && (
        <path d="M4.7 427.3l112 112c6.2 6.2 16.4 6.2 22.6 0l112-112c6.2-6.2 6.2-16.4 0-22.6s-16.4-6.2-22.6 0l-84.7 84.7 0-466.7 84.7 84.7c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-112-112c-3-3-7.1-4.7-11.3-4.7s-8.3 1.7-11.3 4.7L4.7 84.7c-6.2 6.2-6.2 16.4 0 22.6s16.4 6.2 22.6 0l84.7-84.7 0 466.7-84.7-84.7c-6.2-6.2-16.4-6.2-22.6 0s-6.2 16.4 0 22.6z" />
      )}
    </svg>
  );
}
