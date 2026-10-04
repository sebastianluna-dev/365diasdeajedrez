import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `check-double`, in Duotone Light or, with `variant="solid"`,
 * Duotone Solid.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function CheckDoubleIcon({ className, variant = "light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="-149.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "solid" ? (
        <>
          <path
            opacity=".4"
            d="M9.4 137.4c-12.5 12.5-12.5 32.8 0 45.3l64 64c6.6 6.6 15.8 10 25.1 9.3s17.9-5.5 23.4-13.1l128-176c10.4-14.3 7.2-34.3-7.1-44.7s-34.3-7.2-44.7 7.1l-106 145.7-37.5-37.5c-12.5-12.5-32.8-12.5-45.3 0z"
          />
          <path d="M370.8 158.1c14.3 10.4 17.5 30.4 7.1 44.7l-192 264c-5.5 7.6-14 12.3-23.4 13.1s-18.5-2.7-25.1-9.3l-96-96c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l69.5 69.5 170-233.7c10.4-14.3 30.4-17.5 44.7-7.1z" />
        </>
      ) : (
        <path d="M244.9 49.4c5.2-7.1 3.6-17.1-3.5-22.4s-17.1-3.6-22.4 3.5l-129 176.9-54.8-54.8c-6.2-6.2-16.4-6.2-22.6 0s-6.2 16.4 0 22.6l68 68c3.3 3.3 7.9 5 12.6 4.6s8.9-2.7 11.7-6.5l140-192zm132 132c5.2-7.1 3.6-17.1-3.5-22.4s-17.1-3.6-22.4 3.5l-199 272.9-88.8-88.8c-6.2-6.2-16.4-6.2-22.6 0s-6.2 16.4 0 22.6l102 102c3.3 3.3 7.9 5 12.6 4.6s8.9-2.7 11.7-6.5l210-288z" />
      )}
    </svg>
  );
}
