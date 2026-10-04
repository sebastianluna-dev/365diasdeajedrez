import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `browser`, in Duotone Light (the default), Duotone Solid or
 * Classic Solid, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function BrowserIcon({ className, variant = "duotone-light" }: IconProps) {
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
          <path opacity=".4" d="M32 192l448 0 0 192c0 17.7-14.3 32-32 32L64 416c-17.7 0-32-14.3-32-32l0-192z" />
          <path d="M160 96l0 64 320 0 0-32c0-17.7-14.3-32-32-32L160 96zm-32 0L64 96c-17.7 0-32 14.3-32 32l0 32 96 0 0-64zM32 192l0 192c0 17.7 14.3 32 32 32l384 0c17.7 0 32-14.3 32-32l0-192-448 0zM0 128C0 92.7 28.7 64 64 64l384 0c35.3 0 64 28.7 64 64l0 256c0 35.3-28.7 64-64 64L64 448c-35.3 0-64-28.7-64-64L0 128z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path opacity=".4" d="M0 256l512 0 0 128c0 35.3-28.7 64-64 64L64 448c-35.3 0-64-28.7-64-64L0 256z" />
          <path d="M0 128C0 92.7 28.7 64 64 64l384 0c35.3 0 64 28.7 64 64l0 128-512 0 0-128zm128 32a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm56-24c-13.3 0-24 10.7-24 24s10.7 24 24 24l240 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-240 0z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M0 128C0 92.7 28.7 64 64 64l384 0c35.3 0 64 28.7 64 64l0 256c0 35.3-28.7 64-64 64L64 448c-35.3 0-64-28.7-64-64L0 128zm128 32a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm56-24c-13.3 0-24 10.7-24 24s10.7 24 24 24l240 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-240 0z" />
      )}
    </svg>
  );
}
