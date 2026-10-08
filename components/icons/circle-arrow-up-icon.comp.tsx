import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `circle-arrow-up`, in Duotone Light (the default), Duotone
 * Solid, Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function CircleArrowUpIcon({ className, variant = "duotone-light" }: IconProps) {
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
            d="M32 256a224 224 0 1 0 448 0 224 224 0 1 0 -448 0zm140.7-19.3l72-72c6.2-6.2 16.4-6.2 22.6 0l72 72c6.2 6.2 6.2 16.4 0 22.6s-16.4 6.2-22.6 0L272 214.6 272 336c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-121.4-44.7 44.7c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6z"
          />
          <path d="M256 32a224 224 0 1 1 0 448 224 224 0 1 1 0-448zm0 480a256 256 0 1 0 0-512 256 256 0 1 0 0 512zm11.3-347.3c-6.2-6.2-16.4-6.2-22.6 0l-72 72c-6.2 6.2-6.2 16.4 0 22.6s16.4 6.2 22.6 0L240 214.6 240 336c0 8.8 7.2 16 16 16s16-7.2 16-16l0-121.4 44.7 44.7c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-72-72z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M0 256a256 256 0 1 0 512 0 256 256 0 1 0 -512 0zm159-41l80-80c9.4-9.4 24.6-9.4 33.9 0l80 80c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-39-39 0 150.1c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-150.1-39 39c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9z"
          />
          <path d="M239 135c9.4-9.4 24.6-9.4 33.9 0l80 80c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-39-39 0 150.1c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-150.1-39 39c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l80-80z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512zm17-377l80 80c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-39-39 0 150.1c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-150.1-39 39c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l80-80c9.4-9.4 24.6-9.4 33.9 0z" />
      )}
      {variant === "classic-light" && (
        <path d="M256 32a224 224 0 1 1 0 448 224 224 0 1 1 0-448zm0 480a256 256 0 1 0 0-512 256 256 0 1 0 0 512zm11.3-347.3c-6.2-6.2-16.4-6.2-22.6 0l-72 72c-6.2 6.2-6.2 16.4 0 22.6s16.4 6.2 22.6 0L240 214.6 240 336c0 8.8 7.2 16 16 16s16-7.2 16-16l0-121.4 44.7 44.7c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-72-72z" />
      )}
    </svg>
  );
}
