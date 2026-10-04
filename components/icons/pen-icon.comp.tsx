import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `pen`, in Duotone Light or, with `variant="solid"`, Duotone
 * Solid.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function PenIcon({ className, variant = "light" }: IconProps) {
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
            d="M291 83c46 46 92 92 137.9 137.9 20.6-20.6 41.2-41.2 61.9-61.9 13.6-13.6 21.2-31.9 21.2-51.1s-7.6-37.6-21.2-51.1L455.1 21.2C441.6 7.6 423.2 0 404 0s-37.6 7.6-51.1 21.2C332.3 41.8 311.6 62.4 291 83z"
          />
          <path d="M58.9 315.1c-10.7 10.7-18.5 24.1-22.6 38.7L.9 481.6c-2.3 8.3 0 17.3 6.2 23.4s15.1 8.5 23.4 6.2l127.8-35.5c14.6-4.1 27.9-11.8 38.7-22.6L429 221 291 83 58.9 315.1z" />
        </>
      ) : (
        <>
          <path
            opacity=".4"
            d="M35.5 476.5l114.1-31.7c9.3-2.6 17.8-7.5 24.6-14.4L387 217.7 294.3 125 81.6 337.8c-6.8 6.8-11.8 15.3-14.4 24.6L35.5 476.5z"
          />
          <path d="M375.5 43.8C383.1 36.2 393.3 32 404 32s20.9 4.2 28.5 11.8l35.7 35.7C475.8 87.1 480 97.3 480 108s-4.2 20.9-11.8 28.5L409.7 195 317 102.3 375.5 43.8zM294.3 125L387 217.7 174.2 430.4c-6.8 6.8-15.3 11.8-24.6 14.4L35.5 476.5 67.2 362.4c2.6-9.3 7.5-17.8 14.4-24.6L294.3 125zM404 0c-19.2 0-37.6 7.6-51.1 21.2l-294 294c-10.7 10.7-18.5 24.1-22.6 38.7L.9 481.6c-2.3 8.3 0 17.3 6.2 23.4s15.1 8.5 23.4 6.2l127.8-35.5c14.6-4.1 27.9-11.8 38.7-22.6l294-294C504.4 145.6 512 127.2 512 108s-7.6-37.6-21.2-51.1L455.1 21.2C441.6 7.6 423.2 0 404 0z" />
        </>
      )}
    </svg>
  );
}
