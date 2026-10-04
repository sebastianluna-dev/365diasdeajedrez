import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `flag-swallowtail`, in Duotone Light (the default), Duotone
 * Solid or Classic Solid, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function FlagSwallowtailIcon({ className, variant = "duotone-light" }: IconProps) {
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
          <path opacity=".4" d="M32 96l376 0-81.6 108.8c-8.5 11.4-8.5 27 0 38.4L408 352 32 352 32 96z" />
          <path d="M32 16C32 7.2 24.8 0 16 0S0 7.2 0 16L0 496c0 8.8 7.2 16 16 16s16-7.2 16-16l0-112 392 0c13.3 0 24-10.7 24-24 0-5.2-1.7-10.2-4.8-14.4L352 224 443.2 102.4c3.1-4.2 4.8-9.2 4.8-14.4 0-13.3-10.7-24-24-24L32 64 32 16zm0 80l376 0-81.6 108.8c-8.5 11.4-8.5 27 0 38.4L408 352 32 352 32 96z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M64 64l0 320 360 0c13.3 0 24-10.7 24-24 0-5.2-1.7-10.2-4.8-14.4L352 224 443.2 102.4c3.1-4.2 4.8-9.2 4.8-14.4 0-13.3-10.7-24-24-24L64 64z"
          />
          <path d="M32 0C49.7 0 64 14.3 64 32l0 448c0 17.7-14.3 32-32 32S0 497.7 0 480L0 32C0 14.3 14.3 0 32 0z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M64 32C64 14.3 49.7 0 32 0S0 14.3 0 32L0 480c0 17.7 14.3 32 32 32s32-14.3 32-32l0-96 360 0c13.3 0 24-10.7 24-24 0-5.2-1.7-10.2-4.8-14.4L352 224 443.2 102.4c3.1-4.2 4.8-9.2 4.8-14.4 0-13.3-10.7-24-24-24L64 64 64 32z" />
      )}
    </svg>
  );
}
