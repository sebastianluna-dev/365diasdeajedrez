import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `window-maximize`, in Duotone Light (the default), Duotone
 * Solid or Classic Solid, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function WindowMaximizeIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="-85.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "duotone-light" && (
        <>
          <path opacity=".4" d="M32 224l448 0 0 160c0 17.7-14.3 32-32 32L64 416c-17.7 0-32-14.3-32-32l0-160z" />
          <path d="M64 96c-17.7 0-32 14.3-32 32l0 64 448 0 0-64c0-17.7-14.3-32-32-32L64 96zM32 224l0 160c0 17.7 14.3 32 32 32l384 0c17.7 0 32-14.3 32-32l0-160-448 0zM0 128C0 92.7 28.7 64 64 64l384 0c35.3 0 64 28.7 64 64l0 256c0 35.3-28.7 64-64 64L64 448c-35.3 0-64-28.7-64-64L0 128z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M64 152c0 13.3 10.7 24 24 24l336 0c13.3 0 24-10.7 24-24s-10.7-24-24-24L88 128c-13.3 0-24 10.7-24 24z"
          />
          <path d="M64 64C28.7 64 0 92.7 0 128L0 384c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-256c0-35.3-28.7-64-64-64L64 64zm24 64l336 0c13.3 0 24 10.7 24 24s-10.7 24-24 24L88 176c-13.3 0-24-10.7-24-24s10.7-24 24-24z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M64 64C28.7 64 0 92.7 0 128L0 384c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-256c0-35.3-28.7-64-64-64L64 64zm24 64l336 0c13.3 0 24 10.7 24 24s-10.7 24-24 24L88 176c-13.3 0-24-10.7-24-24s10.7-24 24-24z" />
      )}
    </svg>
  );
}
