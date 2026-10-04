import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `copy`, in Duotone Light (the default), Duotone Solid or
 * Classic Solid, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function CopyIcon({ className, variant = "duotone-light" }: IconProps) {
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
          <path
            opacity=".4"
            d="M160 64c0-17.7 14.3-32 32-32l132.1 0c8.5 0 16.6 3.4 22.6 9.4l59.9 59.9c6 6 9.4 14.1 9.4 22.6L416 320c0 17.7-14.3 32-32 32l-192 0c-17.7 0-32-14.3-32-32l0-256zM325.5 0c17 0 33.3 6.7 45.3 18.7l58.5 58.5c12 12 18.7 28.3 18.7 45.3l0 1.4c0-17-6.7-33.3-18.7-45.3L369.4 18.7C357.7 7.1 342 .4 325.5 0z"
          />
          <path d="M160 64c0-17.7 14.3-32 32-32l132.1 0c8.5 0 16.6 3.4 22.6 9.4l59.9 59.9c6 6 9.4 14.1 9.4 22.6L416 320c0 17.7-14.3 32-32 32l-192 0c-17.7 0-32-14.3-32-32l0-256zM192 0c-35.3 0-64 28.7-64 64l0 256c0 35.3 28.7 64 64 64l192 0c35.3 0 64-28.7 64-64l0-196.1c0-17-6.7-33.3-18.7-45.3L369.4 18.7C357.4 6.7 341.1 0 324.1 0L192 0zM64 128c-35.3 0-64 28.7-64 64L0 448c0 35.3 28.7 64 64 64l192 0c35.3 0 64-28.7 64-64l0-16-32 0 0 16c0 17.7-14.3 32-32 32L64 480c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l16 0 0-32-16 0z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M0 192L0 448c0 35.3 28.7 64 64 64l192 0c35.3 0 64-28.7 64-64l0-16-64 0 0 16-192 0 0-256 16 0 0-64-16 0c-35.3 0-64 28.7-64 64z"
          />
          <path d="M128 64c0-35.3 28.7-64 64-64L326.3 0c16.5 0 32.4 6.4 44.3 17.8l57.8 55.4C440.9 85.3 448 102 448 119.4L448 320c0 35.3-28.7 64-64 64l-192 0c-35.3 0-64-28.7-64-64l0-256z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M192 0c-35.3 0-64 28.7-64 64l0 256c0 35.3 28.7 64 64 64l192 0c35.3 0 64-28.7 64-64l0-200.6c0-17.4-7.1-34.1-19.7-46.2L370.6 17.8C358.7 6.4 342.8 0 326.3 0L192 0zM64 128c-35.3 0-64 28.7-64 64L0 448c0 35.3 28.7 64 64 64l192 0c35.3 0 64-28.7 64-64l0-16-64 0 0 16-192 0 0-256 16 0 0-64-16 0z" />
      )}
    </svg>
  );
}
