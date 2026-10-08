import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `block-quote`, in Duotone Light (the default), Duotone Solid,
 * Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function BlockQuoteIcon({ className, variant = "duotone-light" }: IconProps) {
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
        <path d="M16 64C7.2 64 0 71.2 0 80S7.2 96 16 96l416 0c8.8 0 16-7.2 16-16s-7.2-16-16-16L16 64zM144 240c-8.8 0-16 7.2-16 16s7.2 16 16 16l288 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-288 0zM128 432c0 8.8 7.2 16 16 16l288 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-288 0c-8.8 0-16 7.2-16 16zM0 432c0 8.8 7.2 16 16 16s16-7.2 16-16l0-192c0-8.8-7.2-16-16-16S0 231.2 0 240L0 432z" />
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M0 96C0 78.3 14.3 64 32 64l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 128C14.3 128 0 113.7 0 96zM128 256c0-17.7 14.3-32 32-32l256 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-256 0c-17.7 0-32-14.3-32-32zm0 160c0-17.7 14.3-32 32-32l256 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-256 0c-17.7 0-32-14.3-32-32z"
          />
          <path d="M0 256c0-17.7 14.3-32 32-32s32 14.3 32 32l0 160c0 17.7-14.3 32-32 32S0 433.7 0 416L0 256z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M32 64C14.3 64 0 78.3 0 96s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 64zM160 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l256 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-256 0zM128 416c0 17.7 14.3 32 32 32l256 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-256 0c-17.7 0-32 14.3-32 32zM32 224c-17.7 0-32 14.3-32 32L0 416c0 17.7 14.3 32 32 32s32-14.3 32-32l0-160c0-17.7-14.3-32-32-32z" />
      )}
      {variant === "classic-light" && (
        <path d="M16 64C7.2 64 0 71.2 0 80S7.2 96 16 96l416 0c8.8 0 16-7.2 16-16s-7.2-16-16-16L16 64zM144 240c-8.8 0-16 7.2-16 16s7.2 16 16 16l288 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-288 0zM128 432c0 8.8 7.2 16 16 16l288 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-288 0c-8.8 0-16 7.2-16 16zM0 432c0 8.8 7.2 16 16 16s16-7.2 16-16l0-192c0-8.8-7.2-16-16-16S0 231.2 0 240L0 432z" />
      )}
    </svg>
  );
}
