import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `underline`, in Duotone Light (the default), Duotone Solid,
 * Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function UnderlineIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="-149.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "duotone-light" && (
        <path d="M0 16C0 7.2 7.2 0 16 0l96 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-32 0 0 208c0 61.9 50.1 112 112 112s112-50.1 112-112l0-208-32 0c-8.8 0-16-7.2-16-16s7.2-16 16-16l96 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-32 0 0 208c0 79.5-64.5 144-144 144S48 319.5 48 240l0-208-32 0C7.2 32 0 24.8 0 16zM16 480l352 0c8.8 0 16 7.2 16 16s-7.2 16-16 16L16 512c-8.8 0-16-7.2-16-16s7.2-16 16-16z" />
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M0 32C0 49.7 14.3 64 32 64l0 160c0 88.4 71.6 160 160 160s160-71.6 160-160l0-160c17.7 0 32-14.3 32-32S369.7 0 352 0L288 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l0 160c0 53-43 96-96 96s-96-43-96-96L96 64c17.7 0 32-14.3 32-32S113.7 0 96 0L32 0C14.3 0 0 14.3 0 32z"
          />
          <path d="M0 480c0-17.7 14.3-32 32-32l320 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 512c-17.7 0-32-14.3-32-32z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M0 32C0 14.3 14.3 0 32 0L96 0c17.7 0 32 14.3 32 32S113.7 64 96 64l0 160c0 53 43 96 96 96s96-43 96-96l0-160c-17.7 0-32-14.3-32-32S270.3 0 288 0l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l0 160c0 88.4-71.6 160-160 160S32 312.4 32 224L32 64C14.3 64 0 49.7 0 32zM0 480c0-17.7 14.3-32 32-32l320 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 512c-17.7 0-32-14.3-32-32z" />
      )}
      {variant === "classic-light" && (
        <path d="M0 16C0 7.2 7.2 0 16 0l96 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-32 0 0 208c0 61.9 50.1 112 112 112s112-50.1 112-112l0-208-32 0c-8.8 0-16-7.2-16-16s7.2-16 16-16l96 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-32 0 0 208c0 79.5-64.5 144-144 144S48 319.5 48 240l0-208-32 0C7.2 32 0 24.8 0 16zM16 480l352 0c8.8 0 16 7.2 16 16s-7.2 16-16 16L16 512c-8.8 0-16-7.2-16-16s7.2-16 16-16z" />
      )}
    </svg>
  );
}
