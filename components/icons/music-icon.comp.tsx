import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `music`, in Duotone Light (the default), Duotone Solid or
 * Classic Solid, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function MusicIcon({ className, variant = "duotone-light" }: IconProps) {
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
            d="M32 400c0 26.5 28.7 48 64 48s64-21.5 64-48-28.7-48-64-48-64 21.5-64 48zM192 105.7l0 74.4 256-56.9 0-67.3c0-10.2-9.5-17.8-19.5-15.6L204.5 90c-7.3 1.6-12.5 8.1-12.5 15.6zM320 336c0 26.5 28.7 48 64 48s64-21.5 64-48-28.7-48-64-48-64 21.5-64 48z"
          />
          <path d="M428.5 40.3L204.5 90c-7.3 1.6-12.5 8.1-12.5 15.6l0 74.4 256-56.9 0-67.3c0-10.2-9.5-17.8-19.5-15.6zM448 276.4l0-120.4-256 56.9 0 187.2c0 44.2-43 80-96 80s-96-35.8-96-80 43-80 96-80c24.6 0 47 7.7 64 20.4l0-234.7c0-22.5 15.6-42 37.6-46.9L421.6 9c30-6.7 58.4 16.1 58.4 46.9L480 336c0 44.2-43 80-96 80s-96-35.8-96-80 43-80 96-80c24.6 0 47 7.7 64 20.4zm0 59.6c0-26.5-28.7-48-64-48s-64 21.5-64 48 28.7 48 64 48 64-21.5 64-48zM160 400c0-26.5-28.7-48-64-48s-64 21.5-64 48 28.7 48 64 48 64-21.5 64-48z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M128 96l0 228.6c37.3 11 64 40.6 64 75.4l0-206.3 224-49.8 0 116.7c37.3 11 64 40.6 64 75.4l0-304c0-9.7-4.4-18.9-12-25s-17.5-8.4-27-6.3l-288 64C138.4 68 128 81 128 96z"
          />
          <path d="M384 416c53 0 96-35.8 96-80s-43-80-96-80-96 35.8-96 80 43 80 96 80zM96 480c53 0 96-35.8 96-80s-43-80-96-80-96 35.8-96 80 43 80 96 80z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M468 7c7.6 6.1 12 15.3 12 25l0 304c0 44.2-43 80-96 80s-96-35.8-96-80 43-80 96-80c11.2 0 22 1.6 32 4.6l0-116.7-224 49.8 0 206.3c0 44.2-43 80-96 80s-96-35.8-96-80 43-80 96-80c11.2 0 22 1.6 32 4.6L128 96c0-15 10.4-28 25.1-31.2l288-64c9.5-2.1 19.4 .2 27 6.3z" />
      )}
    </svg>
  );
}
