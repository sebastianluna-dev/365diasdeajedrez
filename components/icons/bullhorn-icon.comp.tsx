import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `bullhorn`, in Duotone Light (the default), Duotone Solid or
 * Classic Solid, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function BullhornIcon({ className, variant = "duotone-light" }: IconProps) {
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
            d="M32 256c0 53 43 96 96 96l80 0 0-192-8 0c-24 0-48 0-72 0-53 0-96 43-96 96zm208-97.1l0 194.1c67.7 5.7 131.9 34 181.9 80.7l26.1 24.4 0-404.2-26.1 24.4c-50 46.7-114.2 75-181.9 80.7z"
          />
          <path d="M448 53.9l0 404.2-26.1-24.4c-50-46.7-114.2-75-181.9-80.7l0-194.1c67.7-5.7 131.9-34 181.9-80.7L448 53.9zM240 385.2c59.6 5.6 116 30.8 160.1 72l33.7 31.5c5.1 4.7 11.8 7.4 18.7 7.4 15.2 0 27.5-12.3 27.5-27.5l0-425c0-15.2-12.3-27.5-27.5-27.5-7 0-13.7 2.6-18.7 7.4L400.1 54.8c-50.2 46.9-116.3 73-184.9 73.2L128 128C57.3 128 0 185.3 0 256 0 315.6 40.8 365.8 96 380l0 84c0 26.5 21.5 48 48 48l48 0c26.5 0 48-21.5 48-48l0-78.8zM200 384l8 0 0 80c0 8.8-7.2 16-16 16l-48 0c-8.8 0-16-7.2-16-16l0-80 72 0zm0-224l8 0 0 192-80 0c-53 0-96-43-96-96s43-96 96-96l72 0 0 0z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M224 127.9l0 256.4c57.6 2.8 112.8 24.9 156.4 63l46.6 40.7c9.4 8.3 22.9 10.2 34.3 5.1S480 476.6 480 464l0-416c0-12.6-7.3-24-18.8-29.1s-24.8-3.2-34.3 5.1L380.4 64.7C336.8 102.8 281.6 125 224 127.9z"
          />
          <path d="M128 128C57.3 128 0 185.3 0 256S57.3 384 128 384l0 96c0 17.7 14.3 32 32 32l32 0c17.7 0 32-14.3 32-32l0-352-96 0z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M461.2 18.9C472.7 24 480 35.4 480 48l0 416c0 12.6-7.3 24-18.8 29.1s-24.8 3.2-34.3-5.1l-46.6-40.7c-43.6-38.1-98.7-60.3-156.4-63l0 95.7c0 17.7-14.3 32-32 32l-32 0c-17.7 0-32-14.3-32-32l0-96C57.3 384 0 326.7 0 256S57.3 128 128 128l84.5 0c61.8-.2 121.4-22.7 167.9-63.3l46.6-40.7c9.4-8.3 22.9-10.2 34.3-5.1zM224 320l0 .2c70.3 2.7 137.8 28.5 192 73.4l0-275.3c-54.2 44.9-121.7 70.7-192 73.4L224 320z" />
      )}
    </svg>
  );
}
