import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `bookmark-slash`, in Duotone Light (the default), Duotone
 * Solid or Classic Solid, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function BookmarkSlashIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="-53.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "duotone-light" && (
        <>
          <path opacity=".4" d="M128 64l0 9.5 320 320 0-329.5c0-17.7-14.3-32-32-32L160 32c-17.7 0-32 14.3-32 32z" />
          <path d="M27.3-27.2c-6.2-6.2-16.4-6.2-22.6 0s-6.2 16.4 0 22.6l544 544c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6L480 425.5 480 64c0-35.3-28.7-64-64-64L160 0c-28.5 0-52.7 18.7-61 44.5L27.3-27.2zM128 73.5l0-9.5c0-17.7 14.3-32 32-32l256 0c17.7 0 32 14.3 32 32l0 329.5-320-320zM96 490c0 18.6 20.2 30.1 36.2 20.7L288 418.6 443.8 510.6c3.8 2.2 7.8 3.3 11.7 3.4l-82.2-82.2-73.1-43.2c-7.5-4.5-16.9-4.5-24.4 0L128 476 128 186.5 96 154.5 96 490z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M96 165.8L96 480c0 11.5 6.2 22.2 16.2 27.8s22.3 5.5 32.2-.4l143.5-86.1 1.3 .8 37-25.9-230.4-230.4z"
          />
          <path d="M7-24.9c9.4-9.4 24.6-9.4 33.9 0l61.3 61.3C112.5 14.9 134.5 0 160 0L416 0c35.3 0 64 28.7 64 64l0 350.2 89 89c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0L7 9.1C-2.3-.3-2.3-15.5 7-24.9z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M41-24.9c-9.4-9.4-24.6-9.4-33.9 0S-2.3-.3 7 9.1l528 528c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-89-89 0-350.2c0-35.3-28.7-64-64-64L160 0c-25.5 0-47.5 14.9-57.8 36.4L41-24.9zM96 165.8L96 480c0 11.5 6.2 22.2 16.2 27.8s22.3 5.5 32.2-.4l143.5-86.1 1.3 .8 37-25.9-230.4-230.4z" />
      )}
    </svg>
  );
}
