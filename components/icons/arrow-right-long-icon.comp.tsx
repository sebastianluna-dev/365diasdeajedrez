import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `arrow-right-long`, in Duotone Light or, with
 * `variant="solid"`, Duotone Solid.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ArrowRightLongIcon({ className, variant = "light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="-53.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "solid" ? (
        <>
          <path opacity=".4" d="M0 256c0 17.7 14.3 32 32 32l434.7 0 32-32-32-32-434.7 0c-17.7 0-32 14.3-32 32z" />
          <path d="M566.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-128 128c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L498.7 256 393.4 150.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l128 128z" />
        </>
      ) : (
        <path d="M571.3 267.3c6.2-6.2 6.2-16.4 0-22.6l-144-144c-6.2-6.2-16.4-6.2-22.6 0s-6.2 16.4 0 22.6L521.4 240 16 240c-8.8 0-16 7.2-16 16s7.2 16 16 16l505.4 0-116.7 116.7c-6.2 6.2-6.2 16.4 0 22.6s16.4 6.2 22.6 0l144-144z" />
      )}
    </svg>
  );
}
