import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `clock`, in Duotone Light or, with `variant="solid"`, Duotone
 * Solid.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ClockIcon({ className, variant = "light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="-85.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "solid" ? (
        <>
          <path
            opacity=".4"
            d="M0 256a256 256 0 1 0 512 0 256 256 0 1 0 -512 0zM232.1 117.5c.1-.8 .2-1.6 .4-2.4 .3-1.6 .8-3.1 1.4-4.5 1.2-2.9 3-5.5 5.1-7.6 4.3-4.3 10.3-7 17-7 13.3 0 24 10.7 24 24l0 123.2c28.4 19 56.9 37.9 85.3 56.9 11 7.4 14 22.2 6.7 33.3s-22.3 14-33.3 6.7c-32-21.3-64-42.7-96-64-3.3-2.2-6-5.2-7.8-8.6-.9-1.7-1.6-3.5-2.1-5.4-.2-1-.4-1.9-.5-2.9-.1-.5-.1-1-.1-1.5s0-.9 0-1.5c0-45.3 0-90.7 0-136.3 0-.6 0-1.4 .1-2.2z"
          />
          <path d="M256 96c-13.3 0-24 10.7-24 24l0 136c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2 280 120c0-13.3-10.7-24-24-24z" />
        </>
      ) : (
        <>
          <path
            opacity=".4"
            d="M480 256a224 224 0 1 1 -448 0 224 224 0 1 1 448 0zM240 112l0 144c0 5.4 2.7 10.3 7.1 13.3l96 64c7.4 4.9 17.3 2.9 22.2-4.4s2.9-17.3-4.4-22.2L272 247.4 272 112c0-8.8-7.2-16-16-16s-16 7.2-16 16z"
          />
          <path d="M480 256a224 224 0 1 1 -448 0 224 224 0 1 1 448 0zM0 256a256 256 0 1 0 512 0 256 256 0 1 0 -512 0zM240 112l0 144c0 5.4 2.7 10.3 7.1 13.3l96 64c7.4 4.9 17.3 2.9 22.2-4.4s2.9-17.3-4.4-22.2L272 247.4 272 112c0-8.8-7.2-16-16-16s-16 7.2-16 16z" />
        </>
      )}
    </svg>
  );
}
