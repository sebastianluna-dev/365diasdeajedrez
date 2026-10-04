import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `shield-halved`, in Duotone Light (the default), Duotone
 * Solid or Classic Solid, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ShieldHalvedIcon({ className, variant = "duotone-light" }: IconProps) {
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
            d="M48 139.8c.5 93.3 38.8 257.3 192 332.8l0-433.8-173.2 73.5C55.5 117 48 127.7 48 139.8z"
          />
          <path d="M240 38.8l0 433.8C86.8 397.1 48.5 233.2 48 139.8 48 127.7 55.5 117 66.8 112.3L240 38.8zm32 433.8l0-433.9 173.2 73.5c11.3 4.8 18.9 15.5 18.8 27.6-.5 93.3-38.8 257.3-192 332.8zm9-464.8c-16-6.8-34-6.8-50 0L54.3 82.8c-22 9.3-38.4 31-38.3 57.2 .5 99.2 41.3 280.7 213.6 363.2 16.7 8 36.1 8 52.8 0 172.4-82.5 213.2-264 213.6-363.2 .1-26.2-16.3-47.9-38.3-57.2L281.1 7.8z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M16.2 140c.5 99.2 41.3 280.7 213.6 363.2 8.3 4 17.4 6 26.4 6 9.3 .1 18.6-1.9 27.1-6 172.4-82.5 213.1-264 213.6-363.2 .1-26.2-16.3-47.9-38.3-57.2L270.3 2.9C266.1 1 261.6 0 256.9 0l-.4 0c-5.7 .2-9.9 1.2-13.7 2.9L54.5 82.8c-22 9.3-38.4 31-38.3 57.2z"
          />
          <path d="M256.2 0c-4.6 0-9.2 1-13.3 2.9L54.5 82.8c-22 9.3-38.4 31-38.3 57.2 .5 99.2 41.3 280.7 213.6 363.2 8.3 4 17.4 6 26.4 6L256.2 0z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M256 0c4.6 0 9.2 1 13.4 2.9L457.8 82.8c22 9.3 38.4 31 38.3 57.2-.5 99.2-41.3 280.7-213.6 363.2-16.7 8-36.1 8-52.8 0-172.4-82.5-213.1-264-213.6-363.2-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.9 1 251.4 0 256 0zm0 66.8l0 378.1c138-66.8 175.1-214.8 176-303.4l-176-74.6 0 0z" />
      )}
    </svg>
  );
}
