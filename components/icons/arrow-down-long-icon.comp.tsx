import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `arrow-down-long`, in Duotone Light (the default), Duotone
 * Solid or Classic Solid, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ArrowDownLongIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="-181.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "duotone-light" && (
        <path d="M148.7 539.3c6.2 6.2 16.4 6.2 22.6 0l144-144c6.2-6.2 6.2-16.4 0-22.6s-16.4-6.2-22.6 0L176 489.4 176-16c0-8.8-7.2-16-16-16s-16 7.2-16 16l0 505.4-116.7-116.7c-6.2-6.2-16.4-6.2-22.6 0s-6.2 16.4 0 22.6l144 144z" />
      )}
      {variant === "duotone-solid" && (
        <>
          <path opacity=".4" d="M128 0l0 434.7 32 32 32-32 0-434.7c0-17.7-14.3-32-32-32S128-17.7 128 0z" />
          <path d="M137.4 534.6c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 466.7 54.6 361.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M137.4 534.6c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 434.7 192 0c0-17.7-14.3-32-32-32S128-17.7 128 0l0 434.7-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128z" />
      )}
    </svg>
  );
}
