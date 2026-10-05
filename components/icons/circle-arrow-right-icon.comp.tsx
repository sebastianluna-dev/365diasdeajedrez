import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `circle-arrow-right`, in Duotone Light (the default), Duotone
 * Solid, Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function CircleArrowRightIcon({ className, variant = "duotone-light" }: IconProps) {
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
            d="M32 256a224 224 0 1 0 448 0 224 224 0 1 0 -448 0zm128 0c0-8.8 7.2-16 16-16l121.4 0-44.7-44.7c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0l72 72c6.2 6.2 6.2 16.4 0 22.6l-72 72c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6L297.4 272 176 272c-8.8 0-16-7.2-16-16z"
          />
          <path d="M256 32a224 224 0 1 1 0 448 224 224 0 1 1 0-448zm0 480a256 256 0 1 0 0-512 256 256 0 1 0 0 512zm91.3-244.7c6.2-6.2 6.2-16.4 0-22.6l-72-72c-6.2-6.2-16.4-6.2-22.6 0s-6.2 16.4 0 22.6L297.4 240 176 240c-8.8 0-16 7.2-16 16s7.2 16 16 16l121.4 0-44.7 44.7c-6.2 6.2-6.2 16.4 0 22.6s16.4 6.2 22.6 0l72-72z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M0 256a256 256 0 1 0 512 0 256 256 0 1 0 -512 0zm128 0c0-13.3 10.7-24 24-24l145.9 0-42.1-38.2c-9.8-8.9-10.5-24.1-1.6-33.9s24.1-10.5 33.9-1.6l88 80c4.9 4.4 7.7 10.6 7.8 17.2s-2.4 12.9-7 17.5l-80 80c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l39-39-150.1 0c-13.3 0-24-10.7-24-24z"
          />
          <path d="M384 255.4c.2 6.6-2.4 12.9-7 17.5l-80 80c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l39-39-150.1 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l145.9 0-42.1-38.2c-9.8-8.9-10.5-24.1-1.6-33.9s24.1-10.5 33.9-1.6l88 80c4.9 4.4 7.7 10.6 7.8 17.2z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512zm41-159c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l39-39-150.1 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l150.1 0-39-39c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l80 80c9.4 9.4 9.4 24.6 0 33.9l-80 80z" />
      )}
      {variant === "classic-light" && (
        <path d="M256 32a224 224 0 1 1 0 448 224 224 0 1 1 0-448zm0 480a256 256 0 1 0 0-512 256 256 0 1 0 0 512zm91.3-244.7c6.2-6.2 6.2-16.4 0-22.6l-72-72c-6.2-6.2-16.4-6.2-22.6 0s-6.2 16.4 0 22.6L297.4 240 176 240c-8.8 0-16 7.2-16 16s7.2 16 16 16l121.4 0-44.7 44.7c-6.2 6.2-6.2 16.4 0 22.6s16.4 6.2 22.6 0l72-72z" />
      )}
    </svg>
  );
}
