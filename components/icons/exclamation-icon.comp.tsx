import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `exclamation`, in Duotone Light (the default), Duotone Solid,
 * Classic Solid or Classic Light, as `variant` says.
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
    </svg>
  );
}
