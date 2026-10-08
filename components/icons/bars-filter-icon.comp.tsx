import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `bars-filter`, in Duotone Light (the default), Duotone Solid,
 * Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function BarsFilterIcon({ className, variant = "duotone-light" }: IconProps) {
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
        <path d="M0 80c0-8.8 7.2-16 16-16l480 0c8.8 0 16 7.2 16 16s-7.2 16-16 16L16 96C7.2 96 0 88.8 0 80zM96 256c0-8.8 7.2-16 16-16l288 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-288 0c-8.8 0-16-7.2-16-16zM320 432c0 8.8-7.2 16-16 16l-96 0c-8.8 0-16-7.2-16-16s7.2-16 16-16l96 0c8.8 0 16 7.2 16 16z" />
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M96 256c0-17.7 14.3-32 32-32l256 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-256 0c-17.7 0-32-14.3-32-32z"
          />
          <path d="M512 96c0-17.7-14.3-32-32-32L32 64C14.3 64 0 78.3 0 96s14.3 32 32 32l448 0c17.7 0 32-14.3 32-32zM320 416c0-17.7-14.3-32-32-32l-64 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l64 0c17.7 0 32-14.3 32-32z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M0 96C0 78.3 14.3 64 32 64l448 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 128C14.3 128 0 113.7 0 96zM96 256c0-17.7 14.3-32 32-32l256 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-256 0c-17.7 0-32-14.3-32-32zM320 416c0 17.7-14.3 32-32 32l-64 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l64 0c17.7 0 32 14.3 32 32z" />
      )}
      {variant === "classic-light" && (
        <path d="M0 80c0-8.8 7.2-16 16-16l480 0c8.8 0 16 7.2 16 16s-7.2 16-16 16L16 96C7.2 96 0 88.8 0 80zM96 256c0-8.8 7.2-16 16-16l288 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-288 0c-8.8 0-16-7.2-16-16zM320 432c0 8.8-7.2 16-16 16l-96 0c-8.8 0-16-7.2-16-16s7.2-16 16-16l96 0c8.8 0 16 7.2 16 16z" />
      )}
    </svg>
  );
}
