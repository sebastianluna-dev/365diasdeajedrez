import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `plug`, in Duotone Light (the default), Duotone Solid,
 * Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function PlugIcon({ className, variant = "duotone-light" }: IconProps) {
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
          <path opacity=".4" d="M64 128l320 0 0 96c0 88.4-71.6 160-160 160S64 312.4 64 224l0-96z" />
          <path d="M112-32c8.8 0 16 7.2 16 16l0 112 192 0 0-112c0-8.8 7.2-16 16-16s16 7.2 16 16l0 112 80 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-16 0 0 96c0 100.6-77.4 183.2-176 191.3l0 80.7c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-80.7C109.4 407.2 32 324.6 32 224l0-96-16 0c-8.8 0-16-7.2-16-16S7.2 96 16 96l80 0 0-112c0-8.8 7.2-16 16-16zM64 128l0 96c0 88.4 71.6 160 160 160s160-71.6 160-160l0-96-320 0z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M96 0l0 96 64 0 0-96c0-17.7-14.3-32-32-32S96-17.7 96 0zM288 0l0 96 64 0 0-96c0-17.7-14.3-32-32-32S288-17.7 288 0z"
          />
          <path d="M0 128c0-17.7 14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l0 64c0 95.1-69.2 174.1-160 189.3l0 66.7c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-66.7C101.2 398.1 32 319.1 32 224l0-64c-17.7 0-32-14.3-32-32z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M128-32c17.7 0 32 14.3 32 32l0 96 128 0 0-96c0-17.7 14.3-32 32-32s32 14.3 32 32l0 96 64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l0 64c0 95.1-69.2 174.1-160 189.3l0 66.7c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-66.7C101.2 398.1 32 319.1 32 224l0-64c-17.7 0-32-14.3-32-32S14.3 96 32 96l64 0 0-96c0-17.7 14.3-32 32-32z" />
      )}
      {variant === "classic-light" && (
        <path d="M112-32c8.8 0 16 7.2 16 16l0 112 192 0 0-112c0-8.8 7.2-16 16-16s16 7.2 16 16l0 112 80 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-16 0 0 96c0 100.6-77.4 183.2-176 191.3l0 80.7c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-80.7C109.4 407.2 32 324.6 32 224l0-96-16 0c-8.8 0-16-7.2-16-16S7.2 96 16 96l80 0 0-112c0-8.8 7.2-16 16-16zM64 128l0 96c0 88.4 71.6 160 160 160s160-71.6 160-160l0-96-320 0z" />
      )}
    </svg>
  );
}
