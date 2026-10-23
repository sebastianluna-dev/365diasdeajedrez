import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `circle-half`, in twelve styles (Duotone Light is the default), as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function CircleHalfIcon({ className, variant = "duotone-light" }: IconProps) {
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
          <path opacity=".4" d="M32 256c0 112.8 83.5 206.2 192 221.7l0-443.5C115.5 49.8 32 143.2 32 256z" />
          <path d="M224 34.3C115.5 49.8 32 143.2 32 256s83.5 206.2 192 221.7l0-443.5zM224.1 2C241.6-.2 256 14.3 256 32l0 448C256 497.7 241.6 512.2 224.1 510 97.8 494.3 0 386.6 0 256S97.8 17.7 224.1 2z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path opacity=".4" d="M256 0C397.4 0 512 114.6 512 256S397.4 512 256 512L256 0z" />
          <path d="M256 0C114.6 0 0 114.6 0 256S114.6 512 256 512L256 0z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M256 32C256 14.3 241.6-.2 224.1 2 97.8 17.7 0 125.4 0 256S97.8 494.3 224.1 510c17.5 2.2 31.9-12.4 31.9-30l0-448z" />
      )}
      {variant === "classic-light" && (
        <path d="M224 34.3C115.5 49.8 32 143.2 32 256s83.5 206.2 192 221.7l0-443.5zM224.1 2C241.6-.2 256 14.3 256 32l0 448C256 497.7 241.6 512.2 224.1 510 97.8 494.3 0 386.6 0 256S97.8 17.7 224.1 2z" />
      )}
      {variant === "sharp-duotone-light" && (
        <>
          <path opacity=".4" d="M32 256c0 112.8 83.4 206.2 192 221.7l0-443.5C115.4 49.8 32 143.2 32 256z" />
          <path d="M224 34.3l0 443.5C115.4 462.2 32 368.8 32 256S115.4 49.8 224 34.3zM224 2C97.7 17.7 0 125.5 0 256S97.7 494.3 224 510c10.5 1.3 21.2 2 32 2L256 0c-10.8 0-21.5 .7-32 2z" />
        </>
      )}
      {variant === "sharp-light" && (
        <path d="M224 34.3l0 443.5C115.4 462.2 32 368.8 32 256S115.4 49.8 224 34.3zM224 2C97.7 17.7 0 125.5 0 256S97.7 494.3 224 510c10.5 1.3 21.2 2 32 2L256 0c-10.8 0-21.5 .7-32 2z" />
      )}
      {variant === "classic-regular" && (
        <path d="M208 53.6C116.3 75.2 48 157.7 48 256s68.3 180.8 160 202.4l0-404.9zM224.1 2C241.6-.2 256 14.3 256 32l0 448C256 497.7 241.6 512.2 224.1 510 97.8 494.3 0 386.6 0 256S97.8 17.7 224.1 2z" />
      )}
      {variant === "duotone-regular" && (
        <>
          <path opacity=".4" d="M48 256c0 98.3 68.3 180.8 160 202.4l0-404.9C116.3 75.2 48 157.7 48 256z" />
          <path d="M208 53.6C116.3 75.2 48 157.7 48 256s68.3 180.8 160 202.4l0-404.9zM224.1 2C241.6-.2 256 14.3 256 32l0 448C256 497.7 241.6 512.2 224.1 510 97.8 494.3 0 386.6 0 256S97.8 17.7 224.1 2z" />
        </>
      )}
      {variant === "sharp-solid" && <path d="M256 0C114.6 0 0 114.6 0 256S114.6 512 256 512L256 0z" />}
      {variant === "sharp-duotone-solid" && (
        <>
          <path opacity=".4" d="M256 0C397.4 0 512 114.6 512 256S397.4 512 256 512L256 0z" />
          <path d="M256 0C114.6 0 0 114.6 0 256S114.6 512 256 512L256 0z" />
        </>
      )}
      {variant === "sharp-regular" && (
        <path d="M208 53.6l0 404.9C116.3 436.8 48 354.4 48 256S116.3 75.2 208 53.6zm0-49.1C89.6 27 0 131 0 256S89.6 485 208 507.5c15.5 3 31.6 4.5 48 4.5L256 0c-16.4 0-32.5 1.5-48 4.5z" />
      )}
      {variant === "sharp-duotone-regular" && (
        <>
          <path opacity=".4" d="M48 256c0 98.4 68.3 180.8 160 202.4l0-404.9C116.3 75.2 48 157.6 48 256z" />
          <path d="M208 53.6l0 404.9C116.3 436.8 48 354.4 48 256S116.3 75.2 208 53.6zm0-49.1C89.6 27 0 131 0 256S89.6 485 208 507.5c15.5 3 31.6 4.5 48 4.5L256 0c-16.4 0-32.5 1.5-48 4.5z" />
        </>
      )}
    </svg>
  );
}
