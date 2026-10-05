import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `shield`, in Duotone Light (the default), Duotone Solid,
 * Classic Solid or Classic Light, as `variant` says. Its Duotone Solid drawing
 * is a single layer, drawn at full strength: at 40 % it would read as switched
 * off.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ShieldIcon({ className, variant = "duotone-light" }: IconProps) {
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
            d="M48 139.8c.5 94 39.3 259.8 195.4 334.5 7.9 3.8 17.2 3.8 25.1 0 156.1-74.7 195-240.4 195.5-334.5 .1-12.1-7.5-22.8-18.8-27.6l-176.7-75c-8-3.4-17-3.4-25 0l-176.7 75C55.5 117 48 127.7 48 139.8z"
          />
          <path d="M268.6 37.3c-8-3.4-17-3.4-25 0l-176.7 75c-11.3 4.8-18.9 15.5-18.8 27.6 .5 94 39.3 259.8 195.4 334.5 7.9 3.8 17.2 3.8 25.1 0 156.1-74.7 195-240.4 195.5-334.5 .1-12.1-7.5-22.8-18.8-27.6l-176.7-75zM231.1 7.8c16-6.8 34-6.8 50 0l176.7 75c22 9.3 38.4 31 38.3 57.2-.5 99.2-41.3 280.7-213.6 363.2-16.7 8-36.1 8-52.8 0-172.4-82.5-213.1-264-213.6-363.2-.1-26.2 16.3-47.9 38.3-57.2l176.7-75z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <path d="M256 0c4.6 0 9.2 1 13.4 2.9L457.8 82.8c22 9.3 38.4 31 38.3 57.2-.5 99.2-41.3 280.7-213.6 363.2-16.7 8-36.1 8-52.8 0-172.4-82.5-213.1-264-213.6-363.2-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.9 1 251.4 0 256 0z" />
      )}
      {variant === "classic-solid" && (
        <path d="M256 0c4.6 0 9.2 1 13.4 2.9L457.8 82.8c22 9.3 38.4 31 38.3 57.2-.5 99.2-41.3 280.7-213.6 363.2-16.7 8-36.1 8-52.8 0-172.4-82.5-213.1-264-213.6-363.2-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.9 1 251.4 0 256 0z" />
      )}
      {variant === "classic-light" && (
        <path d="M268.6 37.3c-8-3.4-17-3.4-25 0l-176.7 75c-11.3 4.8-18.9 15.5-18.8 27.6 .5 94 39.3 259.8 195.4 334.5 7.9 3.8 17.2 3.8 25.1 0 156.1-74.7 195-240.4 195.5-334.5 .1-12.1-7.5-22.8-18.8-27.6l-176.7-75zM231.1 7.8c16-6.8 34-6.8 50 0l176.7 75c22 9.3 38.4 31 38.3 57.2-.5 99.2-41.3 280.7-213.6 363.2-16.7 8-36.1 8-52.8 0-172.4-82.5-213.1-264-213.6-363.2-.1-26.2 16.3-47.9 38.3-57.2l176.7-75z" />
      )}
    </svg>
  );
}
