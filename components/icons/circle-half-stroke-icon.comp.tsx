import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `circle-half-stroke`, in twelve styles (Duotone Light is the default), as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function CircleHalfStrokeIcon({ className, variant = "duotone-light" }: IconProps) {
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
          <path opacity=".4" d="M32 256c0 118.3 91.8 215.2 208 223.4l0-446.9C123.8 40.8 32 137.7 32 256z" />
          <path d="M272 479.4l0-446.9C388.2 40.8 480 137.7 480 256S388.2 471.2 272 479.4zm-32 0C123.8 471.2 32 374.3 32 256S123.8 40.8 240 32.6l0 446.9zM256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M256 0l0 64c106 0 192 86 192 192S362 448 256 448l0 64c141.4 0 256-114.6 256-256S397.4 0 256 0z"
          />
          <path d="M256 0C114.6 0 0 114.6 0 256S114.6 512 256 512L256 0z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M448 256c0-106-86-192-192-192l0 384c106 0 192-86 192-192zM0 256a256 256 0 1 1 512 0 256 256 0 1 1 -512 0z" />
      )}
      {variant === "classic-light" && (
        <path d="M272 479.4l0-446.9C388.2 40.8 480 137.7 480 256S388.2 471.2 272 479.4zm-32 0C123.8 471.2 32 374.3 32 256S123.8 40.8 240 32.6l0 446.9zM256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512z" />
      )}
      {variant === "sharp-duotone-light" && (
        <>
          <path opacity=".4" d="M32 256c0 118.3 91.8 215.2 208 223.4l0-446.9C123.8 40.8 32 137.7 32 256z" />
          <path d="M272 479.4l0-446.9C388.2 40.8 480 137.7 480 256S388.2 471.2 272 479.4zm-32 0C123.8 471.2 32 374.3 32 256S123.8 40.8 240 32.6l0 446.9zM256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512z" />
        </>
      )}
      {variant === "sharp-light" && (
        <path d="M272 479.4l0-446.9C388.2 40.8 480 137.7 480 256S388.2 471.2 272 479.4zm-32 0C123.8 471.2 32 374.3 32 256S123.8 40.8 240 32.6l0 446.9zM256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512z" />
      )}
      {variant === "classic-regular" && (
        <path d="M280 462.6l0-413.3C383.6 61.3 464 149.2 464 256S383.6 450.7 280 462.6zm-48 0C128.4 450.7 48 362.8 48 256S128.4 61.3 232 49.4l0 413.3zM256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512z" />
      )}
      {variant === "duotone-regular" && (
        <>
          <path opacity=".4" d="M48 256c0 106.8 80.4 194.7 184 206.6l0-413.3C128.4 61.3 48 149.2 48 256z" />
          <path d="M280 462.6l0-413.3C383.6 61.3 464 149.2 464 256S383.6 450.7 280 462.6zm-48 0C128.4 450.7 48 362.8 48 256S128.4 61.3 232 49.4l0 413.3zM256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512z" />
        </>
      )}
      {variant === "sharp-solid" && (
        <path d="M448 256c0-106-86-192-192-192l0 384c106 0 192-86 192-192zM0 256a256 256 0 1 1 512 0 256 256 0 1 1 -512 0z" />
      )}
      {variant === "sharp-duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M256 0l0 64c106 0 192 86 192 192S362 448 256 448l0 64c141.4 0 256-114.6 256-256S397.4 0 256 0z"
          />
          <path d="M256 0C114.6 0 0 114.6 0 256S114.6 512 256 512L256 0z" />
        </>
      )}
      {variant === "sharp-regular" && (
        <path d="M280 462.6l0-413.3C383.6 61.3 464 149.2 464 256S383.6 450.7 280 462.6zm-48 0C128.4 450.7 48 362.8 48 256S128.4 61.3 232 49.4l0 413.3zM256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512z" />
      )}
      {variant === "sharp-duotone-regular" && (
        <>
          <path opacity=".4" d="M48 256c0 106.8 80.4 194.7 184 206.6l0-413.3C128.4 61.3 48 149.2 48 256z" />
          <path d="M280 462.6l0-413.3C383.6 61.3 464 149.2 464 256S383.6 450.7 280 462.6zm-48 0C128.4 450.7 48 362.8 48 256S128.4 61.3 232 49.4l0 413.3zM256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512z" />
        </>
      )}
    </svg>
  );
}
