import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `forward-fast`, in Duotone Light or, with `variant="solid"`,
 * Duotone Solid.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ForwardFastIcon({ className, variant = "light" }: IconProps) {
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
            d="M0 64L0 448c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9L224 301.3 224 448c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9L448 301.3 448 210.7 278.6 41.4c-9.2-9.2-22.9-11.9-34.9-6.9S224 51.1 224 64L224 210.7 54.6 41.4c-9.2-9.2-22.9-11.9-34.9-6.9S0 51.1 0 64z"
          />
          <path d="M480 480c17.7 0 32-14.3 32-32l0-384c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 384c0 17.7 14.3 32 32 32z" />
        </>
      ) : (
        <>
          <path opacity=".4" d="M32 64L32 448 224 283.4 224 228.6 32 64zm224 0l0 384 224-192-224-192z" />
          <path d="M496 480c8.8 0 16-7.2 16-16l0-416c0-8.8-7.2-16-16-16s-16 7.2-16 16l0 165.9-203.2-174.1c-9.5-8.1-22.8-10-34.2-4.8S224 51.5 224 64L224 186.4 52.8 39.7c-9.5-8.1-22.8-10-34.2-4.8S0 51.5 0 64L0 448c0 12.5 7.3 23.8 18.6 29.1s24.7 3.4 34.2-4.8L224 325.6 224 448c0 12.5 7.3 23.8 18.6 29.1s24.7 3.4 34.2-4.8L480 298.1 480 464c0 8.8 7.2 16 16 16zM224 283.4L32 448 32 64 224 228.6 224 283.4zM256 448l0-384 224 192-224 192z" />
        </>
      )}
    </svg>
  );
}
