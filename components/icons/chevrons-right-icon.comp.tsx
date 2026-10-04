import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `chevrons-right`, in Duotone Light or, with
 * `variant="solid"`, Duotone Solid.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ChevronsRightIcon({ className, variant = "light" }: IconProps) {
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
            d="M9.4 41.4C-3.1 53.9-3.1 74.1 9.4 86.6L178.7 256 9.4 425.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3l-192-192c-12.5-12.5-32.8-12.5-45.3 0z"
          />
          <path d="M438.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L370.7 256 201.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z" />
        </>
      ) : (
        <path d="M43.3 475.3l208-208c6.2-6.2 6.2-16.4 0-22.6l-208-208c-6.2-6.2-16.4-6.2-22.6 0s-6.2 16.4 0 22.6L217.4 256 20.7 452.7c-6.2 6.2-6.2 16.4 0 22.6s16.4 6.2 22.6 0zm192 0l208-208c6.2-6.2 6.2-16.4 0-22.6l-208-208c-6.2-6.2-16.4-6.2-22.6 0s-6.2 16.4 0 22.6L409.4 256 212.7 452.7c-6.2 6.2-6.2 16.4 0 22.6s16.4 6.2 22.6 0z" />
      )}
    </svg>
  );
}
