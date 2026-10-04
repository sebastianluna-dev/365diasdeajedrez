import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `circle-notch`, in Duotone Light or, with `variant="solid"`,
 * Duotone Solid. Its Solid drawing is a single layer, drawn at full strength:
 * at 40 % it would read as switched off.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function CircleNotchIcon({ className, variant = "light" }: IconProps) {
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
        <path d="M222.7 32.1c5 16.9-4.6 34.8-21.5 39.8-79.3 23.6-137.1 97.1-137.1 184.1 0 106 86 192 192 192s192-86 192-192c0-86.9-57.8-160.4-137.1-184.1-16.9-5-26.6-22.9-21.5-39.8s22.9-26.6 39.8-21.5C434.9 42.1 512 140 512 256 512 397.4 397.4 512 256 512S0 397.4 0 256c0-116 77.1-213.9 182.9-245.4 16.9-5 34.8 4.6 39.8 21.5z" />
      ) : (
        <path d="M223.7 17.6C225.4 26.3 219.8 34.7 211.2 36.5 108.9 57.2 32 147.6 32 256 32 379.7 132.3 480 256 480S480 379.7 480 256c0-108.4-76.9-198.8-179.2-219.5-8.7-1.8-14.3-10.2-12.5-18.9S298.5 3.4 307.2 5.1C424 28.8 512 132.1 512 256 512 397.4 397.4 512 256 512S0 397.4 0 256C0 132.1 88 28.8 204.8 5.1 213.5 3.4 221.9 9 223.7 17.6z" />
      )}
    </svg>
  );
}
