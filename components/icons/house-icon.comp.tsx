import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Back to the start of the site, from the mobile chess clock. Font Awesome's
 * `house`, in Duotone Light (the default), Duotone Solid or Classic Solid, as
 * `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function HouseIcon({ className, variant = "duotone-light" }: IconProps) {
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
            d="M80.5 202.2l0 245.8c0 17.7 14.3 32 32 32l64 0 0-112c0-35.3 28.7-64 64-64l32 0c35.3 0 64 28.7 64 64l0 112 64 0c17.7 0 32-14.3 32-32l0-245.8-176-164.3-176 164.3z"
          />
          <path d="M245.6 4.3c6.1-5.7 15.7-5.7 21.8 0l240 224c6.5 6 6.8 16.2 .8 22.6s-16.2 6.8-22.6 .8l-21.1-19.7 0 216c0 35.3-28.7 64-64 64l-288 0c-35.3 0-64-28.7-64-64l0-216-21.1 19.7c-6.5 6-16.6 5.7-22.6-.8s-5.7-16.6 .8-22.6l240-224zm10.9 33.6l-176 164.3 0 245.8c0 17.7 14.3 32 32 32l64 0 0-112c0-35.3 28.7-64 64-64l32 0c35.3 0 64 28.7 64 64l0 112 64 0c17.7 0 32-14.3 32-32l0-245.8-176-164.3zM208.5 480l96 0 0-112c0-17.7-14.3-32-32-32l-32 0c-17.7 0-32 14.3-32 32l0 112z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M48 267.7c2-1.2 4-2.6 5.8-4.3L256 75.7 458.2 263.4c1.8 1.7 3.7 3.1 5.8 4.3L464 448c0 35.3-28.7 64-64 64l-80 0 0-128c0-26.5-21.5-48-48-48l-32 0c-26.5 0-48 21.5-48 48l0 128-80 0c-35.3 0-64-28.7-64-64l0-180.3z"
          />
          <path d="M277.8 8.6c-12.3-11.4-31.3-11.4-43.5 0l-224 208c-13 12-13.7 32.3-1.7 45.2s32.3 13.7 45.2 1.7L256 75.7 458.2 263.4c13 12 33.2 11.3 45.2-1.7s11.3-33.2-1.7-45.2l-224-208zM240 336c-26.5 0-48 21.5-48 48l0 128 128 0 0-128c0-26.5-21.5-48-48-48l-32 0z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M277.8 8.6c-12.3-11.4-31.3-11.4-43.5 0l-224 208c-9.6 9-12.8 22.9-8 35.1S18.8 272 32 272l16 0 0 176c0 35.3 28.7 64 64 64l288 0c35.3 0 64-28.7 64-64l0-176 16 0c13.2 0 25-8.1 29.8-20.3s1.6-26.2-8-35.1l-224-208zM240 320l32 0c26.5 0 48 21.5 48 48l0 96-128 0 0-96c0-26.5 21.5-48 48-48z" />
      )}
    </svg>
  );
}
