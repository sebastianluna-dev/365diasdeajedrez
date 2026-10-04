import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `location-arrow`, in Duotone Light (the default), Duotone
 * Solid or Classic Solid, as `variant` says. Its Duotone Solid drawing is a
 * single layer, drawn at full strength: at 40 % it would read as switched off.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function LocationArrowIcon({ className, variant = "duotone-light" }: IconProps) {
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
          <path opacity=".4" d="M32 224l176.8 58.9c9.6 3.2 17.1 10.7 20.2 20.2L288 480 448 64 32 224z" />
          <path d="M208.8 282.9c9.6 3.2 17.1 10.7 20.2 20.2L288 480 448 64 32 224 208.8 282.9zM470.6 41.4c8.9 8.9 11.8 22.3 7.2 34.1l-160 416c-4.8 12.6-17.1 20.8-30.6 20.5s-25.4-9.1-29.6-21.9L198.7 313.3 21.9 254.4C9.1 250.1 .3 238.2 0 224.7S7.9 199 20.5 194.1l416-160c11.8-4.5 25.2-1.7 34.1 7.2z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <path d="M477.9 75.5c4.5-11.8 1.7-25.2-7.2-34.1s-22.3-11.8-34.1-7.2l-416 160C7.9 199-.3 211.2 0 224.7s9.1 25.4 21.9 29.6l176.8 58.9 58.9 176.8c4.3 12.8 16.1 21.6 29.6 21.9s25.7-7.9 30.6-20.5l160-416z" />
      )}
      {variant === "classic-solid" && (
        <path d="M477.9 75.5c4.5-11.8 1.7-25.2-7.2-34.1s-22.3-11.8-34.1-7.2l-416 160C7.9 199-.3 211.2 0 224.7s9.1 25.4 21.9 29.6l176.8 58.9 58.9 176.8c4.3 12.8 16.1 21.6 29.6 21.9s25.7-7.9 30.6-20.5l160-416z" />
      )}
    </svg>
  );
}
