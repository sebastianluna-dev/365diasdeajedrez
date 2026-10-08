import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `toggle-large-on`, in Duotone Light (the default), Duotone
 * Solid, Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ToggleLargeOnIcon({ className, variant = "duotone-light" }: IconProps) {
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
          <path
            opacity=".4"
            d="M32 256c0 70.7 57.3 128 128 128l160 0c-38.9-29.2-64-75.7-64-128s25.1-98.8 64-128l-160 0C89.3 128 32 185.3 32 256z"
          />
          <path d="M416 128a128 128 0 1 0 0 256 128 128 0 1 0 0-256zm0 288l-256 0C71.6 416 0 344.4 0 256S71.6 96 160 96l256 0c88.4 0 160 71.6 160 160S504.4 416 416 416zm-96-32c-38.9-29.2-64-75.7-64-128s25.1-98.8 64-128l-160 0C89.3 128 32 185.3 32 256S89.3 384 160 384l160 0z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M0 256C0 362 86 448 192 448l192 0c106 0 192-86 192-192S490 64 384 64L192 64C86 64 0 150 0 256zm512 0a128 128 0 1 1 -256 0 128 128 0 1 1 256 0z"
          />
          <path d="M256 256a128 128 0 1 1 256 0 128 128 0 1 1 -256 0z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M192 64C86 64 0 150 0 256S86 448 192 448l192 0c106 0 192-86 192-192S490 64 384 64L192 64zm192 64a128 128 0 1 1 0 256 128 128 0 1 1 0-256z" />
      )}
      {variant === "classic-light" && (
        <path d="M416 128a128 128 0 1 0 0 256 128 128 0 1 0 0-256zm0 288l-256 0C71.6 416 0 344.4 0 256S71.6 96 160 96l256 0c88.4 0 160 71.6 160 160S504.4 416 416 416zm-96-32c-38.9-29.2-64-75.7-64-128s25.1-98.8 64-128l-160 0C89.3 128 32 185.3 32 256S89.3 384 160 384l160 0z" />
      )}
    </svg>
  );
}
