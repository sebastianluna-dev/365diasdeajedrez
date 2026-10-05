import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `ban`, in Duotone Light (the default), Duotone Solid, Classic
 * Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function BanIcon({ className, variant = "duotone-light" }: IconProps) {
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
            d="M32 256c0 123.7 100.3 224 224 224 56.1 0 107.4-20.6 146.7-54.7l-316-316C52.6 148.6 32 199.9 32 256zM109.3 86.7l316 316c34.1-39.3 54.7-90.6 54.7-146.7 0-123.7-100.3-224-224-224-56.1 0-107.4 20.6-146.7 54.7z"
          />
          <path d="M402.7 425.3l-316-316c-34.1 39.3-54.7 90.6-54.7 146.7 0 123.7 100.3 224 224 224 56.1 0 107.4-20.6 146.7-54.7zm22.6-22.6c34.1-39.3 54.7-90.6 54.7-146.7 0-123.7-100.3-224-224-224-56.1 0-107.4 20.6-146.7 54.7l316 316zM0 256a256 256 0 1 1 512 0 256 256 0 1 1 -512 0z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M99.5 144.8c12.5-17.5 27.8-32.8 45.3-45.3L412.5 367.2c-12.5 17.5-27.8 32.8-45.3 45.3L99.5 144.8z"
          />
          <path d="M256 64a192 192 0 1 1 0 384 192 192 0 1 1 0-384zm0 448a256 256 0 1 0 0-512 256 256 0 1 0 0 512z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M367.2 412.5L99.5 144.8c-22.4 31.4-35.5 69.8-35.5 111.2 0 106 86 192 192 192 41.5 0 79.9-13.1 111.2-35.5zm45.3-45.3c22.4-31.4 35.5-69.8 35.5-111.2 0-106-86-192-192-192-41.5 0-79.9 13.1-111.2 35.5L412.5 367.2zM0 256a256 256 0 1 1 512 0 256 256 0 1 1 -512 0z" />
      )}
      {variant === "classic-light" && (
        <path d="M402.7 425.3l-316-316c-34.1 39.3-54.7 90.6-54.7 146.7 0 123.7 100.3 224 224 224 56.1 0 107.4-20.6 146.7-54.7zm22.6-22.6c34.1-39.3 54.7-90.6 54.7-146.7 0-123.7-100.3-224-224-224-56.1 0-107.4 20.6-146.7 54.7l316 316zM0 256a256 256 0 1 1 512 0 256 256 0 1 1 -512 0z" />
      )}
    </svg>
  );
}
