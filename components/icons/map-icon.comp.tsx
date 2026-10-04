import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `map`, in Duotone Light (the default), Duotone Solid or
 * Classic Solid, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function MapIcon({ className, variant = "duotone-light" }: IconProps) {
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
            d="M32 110.2l0 349.2 112-56.4 0-343.6-112 50.8zM176 55.5l0 347.7 160 53.3 0-347.7-160-53.3zM368 109l0 343.6 112-50.8 0-349.2-112 56.4z"
          />
          <path d="M512 26.7c0-5.6-2.9-10.7-7.6-13.6s-10.6-3.2-15.6-.7L352.9 80.7 178.6 22.6c-11.5-3.8-24-3.2-35 1.8L9.4 85.3C3.7 87.9 0 93.6 0 99.9L0 485.3C0 490.9 2.9 496 7.6 499s10.6 3.2 15.6 .7l135.9-68.4 174.3 58.1c11.5 3.8 24 3.2 35-1.8l134.2-60.9c5.7-2.6 9.4-8.3 9.4-14.6l0-385.4zM368 109l112-56.4 0 349.2-112 50.8 0-343.6zm-32-.2l0 347.7-160-53.3 0-347.7 160 53.3zM144 403L32 459.4 32 110.2 144 59.4 144 403z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path opacity=".4" d="M160 32l192 64 0 384-192-64 0-384z" />
          <path d="M485.5 413.3L352 480 352 96 477.3 33.4c16-8 34.7 3.6 34.7 21.5l0 315.5c0 18.2-10.3 34.8-26.5 42.9zM26.5 98.7L160 32 160 416 34.7 478.6C18.8 486.6 0 475 0 457.2L0 141.7c0-18.2 10.3-34.8 26.5-42.9z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M512 48c0-11.1-5.7-21.4-15.2-27.2s-21.2-6.4-31.1-1.4L349.5 77.5 170.1 17.6c-8.1-2.7-16.8-2.1-24.4 1.7l-128 64C6.8 88.8 0 99.9 0 112L0 464c0 11.1 5.7 21.4 15.2 27.2s21.2 6.4 31.1 1.4l116.1-58.1 179.4 59.8c8.1 2.7 16.8 2.1 24.4-1.7l128-64c10.8-5.4 17.7-16.5 17.7-28.6l0-352zM192 376.9l0-284.5 128 42.7 0 284.5-128-42.7z" />
      )}
    </svg>
  );
}
