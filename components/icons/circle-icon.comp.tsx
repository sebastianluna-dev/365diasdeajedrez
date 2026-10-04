import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `circle`, in Duotone Light or, with `variant="solid"`,
 * Duotone Solid. Its Solid drawing is a single layer, drawn at full strength:
 * at 40 % it would read as switched off.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function CircleIcon({ className, variant = "light" }: IconProps) {
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
        <path d="M0 256a256 256 0 1 1 512 0 256 256 0 1 1 -512 0z" />
      ) : (
        <>
          <path opacity=".4" d="M32 256a224 224 0 1 0 448 0 224 224 0 1 0 -448 0z" />
          <path d="M480 256a224 224 0 1 0 -448 0 224 224 0 1 0 448 0zM0 256a256 256 0 1 1 512 0 256 256 0 1 1 -512 0z" />
        </>
      )}
    </svg>
  );
}
