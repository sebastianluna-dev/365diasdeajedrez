import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `floppy-disk`, in Duotone Light or, with `variant="solid"`,
 * Duotone Solid.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function FloppyDiskIcon({ className, variant = "light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="-117.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "solid" ? (
        <>
          <path
            opacity=".4"
            d="M0 96L0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-242.7c0-17-6.7-33.3-18.7-45.3L352 50.7C340 38.7 323.7 32 306.7 32L64 32C28.7 32 0 60.7 0 96zm96 32c0-17.7 14.3-32 32-32l160 0c17.7 0 32 14.3 32 32l0 64c0 17.7-14.3 32-32 32l-160 0c-17.7 0-32-14.3-32-32l0-64zM288 352a64 64 0 1 1 -128 0 64 64 0 1 1 128 0z"
          />
          <path d="M160 352a64 64 0 1 1 128 0 64 64 0 1 1 -128 0z" />
        </>
      ) : (
        <>
          <path
            opacity=".4"
            d="M32 96l0 320c0 17.7 14.3 32 32 32l320 0c17.7 0 32-14.3 32-32l0-242.7c0-8.5-3.4-16.6-9.4-22.6L329.4 73.4c-2.7-2.7-5.9-4.9-9.4-6.5L320 176c0 17.7-14.3 32-32 32l-160 0c-17.7 0-32-14.3-32-32l0-112-32 0C46.3 64 32 78.3 32 96zM288 320a64 64 0 1 1 -128 0 64 64 0 1 1 128 0z"
          />
          <path d="M64 64C46.3 64 32 78.3 32 96l0 320c0 17.7 14.3 32 32 32l320 0c17.7 0 32-14.3 32-32l0-242.7c0-8.5-3.4-16.6-9.4-22.6L329.4 73.4c-2.7-2.7-5.9-4.9-9.4-6.5L320 176c0 17.7-14.3 32-32 32l-160 0c-17.7 0-32-14.3-32-32l0-112-32 0zm64 0l0 112 160 0 0-112-160 0zM0 96C0 60.7 28.7 32 64 32l242.7 0c17 0 33.3 6.7 45.3 18.7L429.3 128c12 12 18.7 28.3 18.7 45.3L448 416c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96zM256 320a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm-96 0a64 64 0 1 1 128 0 64 64 0 1 1 -128 0z" />
        </>
      )}
    </svg>
  );
}
