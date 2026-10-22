import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `paragraph`, in Duotone Light (the default), Duotone Solid,
 * Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ParagraphIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="-117.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "duotone-light" && (
        <>
          <path opacity=".4" d="M32 160c0 70.7 57.3 128 128 128l96 0 0-256-96 0C89.3 32 32 89.3 32 160z" />
          <path d="M160 0C71.6 0 0 71.6 0 160S71.6 320 160 320l96 0 0 176c0 8.8 7.2 16 16 16s16-7.2 16-16l0-464 64 0 0 464c0 8.8 7.2 16 16 16s16-7.2 16-16l0-464 48 0c8.8 0 16-7.2 16-16S440.8 0 432 0L160 0zm96 32l0 256-96 0C89.3 288 32 230.7 32 160S89.3 32 160 32l96 0z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path opacity=".4" d="M320 64l64 0 0 416c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-416z" />
          <path d="M160 0L416 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-144 0 0 416c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-160-48 0C71.6 320 0 248.4 0 160S71.6 0 160 0z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M160 0L416 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-32 0 0 416c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-416-48 0 0 416c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-160-48 0C71.6 320 0 248.4 0 160S71.6 0 160 0z" />
      )}
      {variant === "classic-light" && (
        <path d="M160 0C71.6 0 0 71.6 0 160S71.6 320 160 320l96 0 0 176c0 8.8 7.2 16 16 16s16-7.2 16-16l0-464 64 0 0 464c0 8.8 7.2 16 16 16s16-7.2 16-16l0-464 48 0c8.8 0 16-7.2 16-16S440.8 0 432 0L160 0zm96 32l0 256-96 0C89.3 288 32 230.7 32 160S89.3 32 160 32l96 0z" />
      )}
      {variant === "sharp-duotone-light" && (
        <>
          <path opacity=".4" d="M32 160c0 70.7 57.3 128 128 128l96 0 0-256-96 0C89.3 32 32 89.3 32 160z" />
          <path d="M160 0C71.6 0 0 71.6 0 160S71.6 320 160 320l96 0 0 192 32 0 0-480 64 0 0 480 32 0 0-480 64 0 0-32-288 0zm96 32l0 256-96 0C89.3 288 32 230.7 32 160S89.3 32 160 32l96 0z" />
        </>
      )}
      {variant === "sharp-light" && (
        <path d="M160 0C71.6 0 0 71.6 0 160S71.6 320 160 320l96 0 0 192 32 0 0-480 64 0 0 480 32 0 0-480 64 0 0-32-288 0zm96 32l0 256-96 0C89.3 288 32 230.7 32 160S89.3 32 160 32l96 0z" />
      )}
    </svg>
  );
}
