import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `volume-off`, in Duotone Light (the default), Duotone Solid,
 * Classic Solid or Classic Light, as `variant` says. Its Duotone Solid drawing
 * is a single layer, drawn at full strength: at 40 % it would read as switched
 * off.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function VolumeOffIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="-181.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "duotone-light" && (
        <>
          <path
            opacity=".4"
            d="M32 208l0 96c0 8.8 7.2 16 16 16l64 0c8.5 0 16.6 3.4 22.6 9.4L252.7 447.4c.4 .4 .9 .6 1.4 .6 1.1 0 1.9-.9 1.9-1.9l0-380.1c0-1.1-.9-1.9-1.9-1.9-.5 0-1 .2-1.4 .6L134.6 182.6c-6 6-14.1 9.4-22.6 9.4l-64 0c-8.8 0-16 7.2-16 16z"
          />
          <path d="M112 320l-64 0c-8.8 0-16-7.2-16-16l0-96c0-8.8 7.2-16 16-16l64 0c8.5 0 16.6-3.4 22.6-9.4L252.7 64.6c.4-.4 .9-.6 1.4-.6 1.1 0 1.9 .9 1.9 1.9l0 380.1c0 1.1-.9 1.9-1.9 1.9-.5 0-1-.2-1.4-.6L134.6 329.4c-6-6-14.1-9.4-22.6-9.4zm0-160l-64 0c-26.5 0-48 21.5-48 48l0 96c0 26.5 21.5 48 48 48l64 0 118.1 118.1c6.4 6.4 15 9.9 24 9.9 18.7 0 33.9-15.2 33.9-33.9l0-380.1c0-18.7-15.2-33.9-33.9-33.9-9 0-17.6 3.6-24 9.9L112 160z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <path d="M96 352l-48 0c-26.5 0-48-21.5-48-48l0-96c0-26.5 21.5-48 48-48l48 0 134.1-119.2c6.4-5.7 14.6-8.8 23.1-8.8 19.2 0 34.8 15.6 34.8 34.8l0 378.4c0 19.2-15.6 34.8-34.8 34.8-8.5 0-16.7-3.1-23.1-8.8L96 352z" />
      )}
      {variant === "classic-solid" && (
        <path d="M96 352l-48 0c-26.5 0-48-21.5-48-48l0-96c0-26.5 21.5-48 48-48l48 0 134.1-119.2c6.4-5.7 14.6-8.8 23.1-8.8 19.2 0 34.8 15.6 34.8 34.8l0 378.4c0 19.2-15.6 34.8-34.8 34.8-8.5 0-16.7-3.1-23.1-8.8L96 352z" />
      )}
      {variant === "classic-light" && (
        <path d="M112 320l-64 0c-8.8 0-16-7.2-16-16l0-96c0-8.8 7.2-16 16-16l64 0c8.5 0 16.6-3.4 22.6-9.4L252.7 64.6c.4-.4 .9-.6 1.4-.6 1.1 0 1.9 .9 1.9 1.9l0 380.1c0 1.1-.9 1.9-1.9 1.9-.5 0-1-.2-1.4-.6L134.6 329.4c-6-6-14.1-9.4-22.6-9.4zm0-160l-64 0c-26.5 0-48 21.5-48 48l0 96c0 26.5 21.5 48 48 48l64 0 118.1 118.1c6.4 6.4 15 9.9 24 9.9 18.7 0 33.9-15.2 33.9-33.9l0-380.1c0-18.7-15.2-33.9-33.9-33.9-9 0-17.6 3.6-24 9.9L112 160z" />
      )}
    </svg>
  );
}
