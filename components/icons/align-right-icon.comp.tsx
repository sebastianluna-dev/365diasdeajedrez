import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `align-right`, in Duotone Light (the default), Duotone Solid,
 * Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function AlignRightIcon({ className, variant = "duotone-light" }: IconProps) {
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
        <path d="M432 48c8.8 0 16 7.2 16 16s-7.2 16-16 16L176 80c-8.8 0-16-7.2-16-16s7.2-16 16-16l256 0zm0 128c8.8 0 16 7.2 16 16s-7.2 16-16 16L16 208c-8.8 0-16-7.2-16-16s7.2-16 16-16l416 0zm16 144c0 8.8-7.2 16-16 16l-256 0c-8.8 0-16-7.2-16-16s7.2-16 16-16l256 0c8.8 0 16 7.2 16 16zM432 432c8.8 0 16 7.2 16 16s-7.2 16-16 16L16 464c-8.8 0-16-7.2-16-16s7.2-16 16-16l416 0z" />
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M160 64c0 17.7 14.3 32 32 32l224 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L192 32c-17.7 0-32 14.3-32 32zm0 256c0 17.7 14.3 32 32 32l224 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-224 0c-17.7 0-32 14.3-32 32z"
          />
          <path d="M32 480c-17.7 0-32-14.3-32-32s14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 480zm0-256c-17.7 0-32-14.3-32-32s14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 224z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M448 64c0 17.7-14.3 32-32 32L192 96c-17.7 0-32-14.3-32-32s14.3-32 32-32l224 0c17.7 0 32 14.3 32 32zm0 256c0 17.7-14.3 32-32 32l-224 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l224 0c17.7 0 32 14.3 32 32zM0 192c0-17.7 14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 224c-17.7 0-32-14.3-32-32zM448 448c0 17.7-14.3 32-32 32L32 480c-17.7 0-32-14.3-32-32s14.3-32 32-32l384 0c17.7 0 32 14.3 32 32z" />
      )}
      {variant === "classic-light" && (
        <path d="M432 48c8.8 0 16 7.2 16 16s-7.2 16-16 16L176 80c-8.8 0-16-7.2-16-16s7.2-16 16-16l256 0zm0 128c8.8 0 16 7.2 16 16s-7.2 16-16 16L16 208c-8.8 0-16-7.2-16-16s7.2-16 16-16l416 0zm16 144c0 8.8-7.2 16-16 16l-256 0c-8.8 0-16-7.2-16-16s7.2-16 16-16l256 0c8.8 0 16 7.2 16 16zM432 432c8.8 0 16 7.2 16 16s-7.2 16-16 16L16 464c-8.8 0-16-7.2-16-16s7.2-16 16-16l416 0z" />
      )}
      {variant === "sharp-duotone-light" && (
        <path d="M432 48l16 0 0 32-288 0 0-32 272 0zm0 128l16 0 0 32-448 0 0-32 432 0zm16 128l0 32-288 0 0-32 288 0zM432 432l16 0 0 32-448 0 0-32 432 0z" />
      )}
      {variant === "sharp-light" && (
        <path d="M432 48l16 0 0 32-288 0 0-32 272 0zm0 128l16 0 0 32-448 0 0-32 432 0zm16 128l0 32-288 0 0-32 288 0zM432 432l16 0 0 32-448 0 0-32 432 0z" />
      )}
    </svg>
  );
}
