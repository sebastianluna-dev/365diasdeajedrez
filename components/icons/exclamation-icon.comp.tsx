import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `exclamation`, in twelve styles (Duotone Light is the default), as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ExclamationIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox={
        {
          "duotone-light": "-309.33 -85.33 682.67 682.67",
          "duotone-solid": "-277.33 -85.33 682.67 682.67",
          "classic-solid": "-277.33 -85.33 682.67 682.67",
          "classic-light": "-309.33 -85.33 682.67 682.67",
          "sharp-duotone-light": "-309.33 -85.33 682.67 682.67",
          "sharp-light": "-309.33 -85.33 682.67 682.67",
          "classic-regular": "-309.33 -85.33 682.67 682.67",
          "duotone-regular": "-309.33 -85.33 682.67 682.67",
          "sharp-solid": "-277.33 -85.33 682.67 682.67",
          "sharp-duotone-solid": "-277.33 -85.33 682.67 682.67",
          "sharp-regular": "-309.33 -85.33 682.67 682.67",
          "sharp-duotone-regular": "-309.33 -85.33 682.67 682.67",
        }[variant]
      }
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "duotone-light" && (
        <path d="M32 464c13.3 0 24 10.7 24 24s-10.7 24-24 24-24-10.7-24-24 10.7-24 24-24zM32 0C45.4 0 56.1 11 55.8 24.4L48 368.4c-.2 8.7-7.3 15.6-16 15.6s-15.8-6.9-16-15.6L8.2 24.4C7.9 11 18.6 0 32 0z" />
      )}
      {variant === "duotone-solid" && (
        <>
          <path opacity=".4" d="M24 472c0 22.1 17.9 40 40 40s40-17.9 40-40-17.9-40-40-40-40 17.9-40 40z" />
          <path d="M64 0c26.5 0 48 21.5 48 48 0 .6 0 1.1 0 1.7l-16 304c-.9 17-15 30.3-32 30.3S33 370.7 32 353.7L16 49.7c0-.6 0-1.1 0-1.7 0-26.5 21.5-48 48-48z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M64 432c22.1 0 40 17.9 40 40s-17.9 40-40 40-40-17.9-40-40c0-22.1 17.9-40 40-40zM64 0c26.5 0 48 21.5 48 48 0 .6 0 1.1 0 1.7l-16 304c-.9 17-15 30.3-32 30.3S33 370.7 32 353.7L16 49.7c0-.6 0-1.1 0-1.7 0-26.5 21.5-48 48-48z" />
      )}
      {variant === "classic-light" && (
        <path d="M32 464c13.3 0 24 10.7 24 24s-10.7 24-24 24-24-10.7-24-24 10.7-24 24-24zM32 0C45.4 0 56.1 11 55.8 24.4L48 368.4c-.2 8.7-7.3 15.6-16 15.6s-15.8-6.9-16-15.6L8.2 24.4C7.9 11 18.6 0 32 0z" />
      )}
      {variant === "sharp-duotone-light" && <path d="M52 512l-40 0 0-40 40 0 0 40zM56 0L48 384 16 384 8 0 56 0z" />}
      {variant === "sharp-light" && <path d="M52 512l-40 0 0-40 40 0 0 40zM56 0L48 384 16 384 8 0 56 0z" />}
      {variant === "classic-regular" && (
        <path d="M32.3 448c17.7 0 32 14.3 32 32s-14.3 32-32 32c-17.7 0-32-14.3-32-32s14.3-32 32-32zM36.2 .2c18.8 2 33.2 18.2 32.5 37.5L56.3 360.9c-.5 12.9-11.1 23.1-24 23.1s-23.5-10.2-24-23.1L-4 37.7C-4.8 17.1 11.7 0 32.3 0l3.8 .2z" />
      )}
      {variant === "duotone-regular" && (
        <path d="M32.3 448c17.7 0 32 14.3 32 32s-14.3 32-32 32c-17.7 0-32-14.3-32-32s14.3-32 32-32zM36.2 .2c18.8 2 33.2 18.2 32.5 37.5L56.3 360.9c-.5 12.9-11.1 23.1-24 23.1s-23.5-10.2-24-23.1L-4 37.7C-4.8 17.1 11.7 0 32.3 0l3.8 .2z" />
      )}
      {variant === "sharp-solid" && <path d="M96 512l-64 0 0-64 64 0 0 64zm0-128L32 384 16 0 112 0 96 384z" />}
      {variant === "sharp-duotone-solid" && (
        <>
          <path opacity=".4" d="M32 448l0 64 64 0 0-64-64 0z" />
          <path d="M96 384L32 384 16 0 112 0 96 384z" />
        </>
      )}
      {variant === "sharp-regular" && <path d="M60.4 504l-56 0 0-56 56 0 0 56zM54.8 384L10 384-6 0 70.8 0 54.8 384z" />}
      {variant === "sharp-duotone-regular" && (
        <path d="M60.4 504l-56 0 0-56 56 0 0 56zM54.8 384L10 384-6 0 70.8 0 54.8 384z" />
      )}
    </svg>
  );
}
