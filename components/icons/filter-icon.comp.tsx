import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `filter`, in Duotone Light (the default), Duotone Solid or
 * Classic Solid, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function FilterIcon({ className, variant = "duotone-light" }: IconProps) {
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
            d="M32 96L219.3 283.3c3 3 4.7 7.1 4.7 11.3l0 121.4 64 64 0-185.4c0-4.2 1.7-8.3 4.7-11.3L480 96 32 96z"
          />
          <path d="M2.4 83.8C7.4 71.8 19.1 64 32 64l448 0c12.9 0 24.6 7.8 29.6 19.8s2.2 25.7-6.9 34.9L320 301.3 320 480c0 12.9-7.8 24.6-19.8 29.6s-25.7 2.2-34.9-6.9l-64-64c-6-6-9.4-14.1-9.4-22.6L192 301.3 9.4 118.6C.2 109.5-2.5 95.7 2.4 83.8zM480 96L32 96 219.3 283.3c3 3 4.7 7.1 4.7 11.3l0 121.4 64 64 0-185.4c0-4.2 1.7-8.3 4.7-11.3L480 96z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M192 301.3l128 0 0 178.7c0 12.9-7.8 24.6-19.8 29.6s-25.7 2.2-34.9-6.9l-64-64c-6-6-9.4-14.1-9.4-22.6l0-114.7z"
          />
          <path d="M2.4 83.8C7.4 71.8 19.1 64 32 64l448 0c12.9 0 24.6 7.8 29.6 19.8s2.2 25.7-6.9 34.9L320 301.3 192 301.3 9.4 118.6C.2 109.5-2.5 95.7 2.4 83.8z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M32 64C19.1 64 7.4 71.8 2.4 83.8S.2 109.5 9.4 118.6L192 301.3 192 416c0 8.5 3.4 16.6 9.4 22.6l64 64c9.2 9.2 22.9 11.9 34.9 6.9S320 492.9 320 480l0-178.7 182.6-182.6c9.2-9.2 11.9-22.9 6.9-34.9S492.9 64 480 64L32 64z" />
      )}
    </svg>
  );
}
