import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `circle-half`, in Duotone Light (the default), Duotone Solid
 * or Classic Solid, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function CircleHalfIcon({ className, variant = "duotone-light" }: IconProps) {
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
          <path opacity=".4" d="M32 256c0 112.8 83.5 206.2 192 221.7l0-443.5C115.5 49.8 32 143.2 32 256z" />
          <path d="M224 34.3C115.5 49.8 32 143.2 32 256s83.5 206.2 192 221.7l0-443.5zM224.1 2C241.6-.2 256 14.3 256 32l0 448C256 497.7 241.6 512.2 224.1 510 97.8 494.3 0 386.6 0 256S97.8 17.7 224.1 2z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path opacity=".4" d="M256 0C397.4 0 512 114.6 512 256S397.4 512 256 512L256 0z" />
          <path d="M256 0C114.6 0 0 114.6 0 256S114.6 512 256 512L256 0z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M256 32C256 14.3 241.6-.2 224.1 2 97.8 17.7 0 125.4 0 256S97.8 494.3 224.1 510c17.5 2.2 31.9-12.4 31.9-30l0-448z" />
      )}
    </svg>
  );
}
