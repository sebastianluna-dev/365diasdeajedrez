import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `arrow-pointer`, in Duotone Light (the default), Duotone
 * Solid or Classic Solid, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ArrowPointerIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="-117.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "duotone-light" && (
        <>
          <path opacity=".4" d="M96 40l0 360 98.4-131.2c6-8.1 15.5-12.8 25.6-12.8l164 0-288-215.9z" />
          <path d="M220 255.9c-10.1 0-19.6 4.7-25.6 12.8l-98.4 131.2 0-360 288 215.9-164 0zM102.4 4.8c-7.3-5.5-17-6.3-25.1-2.3S64 14.9 64 24l0 400c0 10.3 6.6 19.5 16.4 22.8s20.6-.1 26.8-8.4L209.3 302.3 309.7 503.2c4 7.9 13.6 11.1 21.5 7.2s11.1-13.6 7.2-21.5l-100.4-200.9 170.2 0c10.3 0 19.5-6.6 22.8-16.4s-.1-20.6-8.4-26.8L102.4 4.8z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M198.6 316.6l21.5-28.7 35.7 0 88.9 177.7c7.9 15.8 1.5 35-14.3 42.9s-35 1.5-42.9-14.3L198.6 316.6z"
          />
          <path d="M102.4 4.8c-7.3-5.5-17-6.3-25.1-2.3S64 14.9 64 24l0 400c0 10.3 6.6 19.5 16.4 22.8s20.6-.1 26.8-8.4l112.8-150.5 188 0c10.3 0 19.5-6.6 22.8-16.4s-.1-20.6-8.4-26.8L102.4 4.8z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M77.3 2.5c8.1-4.1 17.9-3.2 25.1 2.3l320 239.9c8.3 6.2 11.6 17 8.4 26.8s-12.4 16.4-22.8 16.4l-152.3 0 88.9 177.7c7.9 15.8 1.5 35-14.3 42.9s-35 1.5-42.9-14.3l-88.9-177.7-91.3 121.8c-6.2 8.3-17 11.6-26.8 8.4S64 434.3 64 424L64 24c0-9.1 5.1-17.4 13.3-21.5z" />
      )}
    </svg>
  );
}
