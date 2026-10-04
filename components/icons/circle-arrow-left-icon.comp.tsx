import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `circle-arrow-left`, in Duotone Light (the default), Duotone
 * Solid or Classic Solid, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function CircleArrowLeftIcon({ className, variant = "duotone-light" }: IconProps) {
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
            d="M32 256a224 224 0 1 0 448 0 224 224 0 1 0 -448 0zm132.7-11.3l72-72c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6L214.6 240 336 240c8.8 0 16 7.2 16 16s-7.2 16-16 16l-121.4 0 44.7 44.7c6.2 6.2 6.2 16.4 0 22.6s-16.4 6.2-22.6 0l-72-72c-6.2-6.2-6.2-16.4 0-22.6z"
          />
          <path d="M256 32a224 224 0 1 1 0 448 224 224 0 1 1 0-448zm0 480a256 256 0 1 0 0-512 256 256 0 1 0 0 512zM164.7 244.7c-6.2 6.2-6.2 16.4 0 22.6l72 72c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6L214.6 272 336 272c8.8 0 16-7.2 16-16s-7.2-16-16-16l-121.4 0 44.7-44.7c6.2-6.2 6.2-16.4 0-22.6s-16.4-6.2-22.6 0l-72 72z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M0 256a256 256 0 1 0 512 0 256 256 0 1 0 -512 0zm135-17l80-80c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-39 39 150.1 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-150.1 0 39 39c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-80-80c-9.4-9.4-9.4-24.6 0-33.9z"
          />
          <path d="M135 239c-9.4 9.4-9.4 24.6 0 33.9l80 80c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-39-39 150.1 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-150.1 0 39-39c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-80 80z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512zM135 239l80-80c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-39 39 150.1 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-150.1 0 39 39c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-80-80c-9.4-9.4-9.4-24.6 0-33.9z" />
      )}
    </svg>
  );
}
