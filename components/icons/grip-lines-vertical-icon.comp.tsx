import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `grip-lines-vertical`, in twelve styles (Duotone Light is the default), as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function GripLinesVerticalIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="-245.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "duotone-light" && (
        <path d="M16 32C7.2 32 0 39.2 0 48L0 464c0 8.8 7.2 16 16 16s16-7.2 16-16L32 48c0-8.8-7.2-16-16-16zm160 0c-8.8 0-16 7.2-16 16l0 416c0 8.8 7.2 16 16 16s16-7.2 16-16l0-416c0-8.8-7.2-16-16-16z" />
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M128 64c0-17.7 14.3-32 32-32s32 14.3 32 32l0 384c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-384z"
          />
          <path d="M0 64C0 46.3 14.3 32 32 32S64 46.3 64 64l0 384c0 17.7-14.3 32-32 32S0 465.7 0 448L0 64z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M64 64c0-17.7-14.3-32-32-32S0 46.3 0 64L0 448c0 17.7 14.3 32 32 32s32-14.3 32-32L64 64zm128 0c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 384c0 17.7 14.3 32 32 32s32-14.3 32-32l0-384z" />
      )}
      {variant === "classic-light" && (
        <path d="M16 32C7.2 32 0 39.2 0 48L0 464c0 8.8 7.2 16 16 16s16-7.2 16-16L32 48c0-8.8-7.2-16-16-16zm160 0c-8.8 0-16 7.2-16 16l0 416c0 8.8 7.2 16 16 16s16-7.2 16-16l0-416c0-8.8-7.2-16-16-16z" />
      )}
      {variant === "sharp-duotone-light" && <path d="M32 32l-32 0 0 448 32 0 0-448zm160 0l-32 0 0 448 32 0 0-448z" />}
      {variant === "sharp-light" && <path d="M32 32l-32 0 0 448 32 0 0-448zm160 0l-32 0 0 448 32 0 0-448z" />}
      {variant === "classic-regular" && (
        <path d="M24 32C10.7 32 0 42.7 0 56L0 456c0 13.3 10.7 24 24 24s24-10.7 24-24L48 56c0-13.3-10.7-24-24-24zm144 0c-13.3 0-24 10.7-24 24l0 400c0 13.3 10.7 24 24 24s24-10.7 24-24l0-400c0-13.3-10.7-24-24-24z" />
      )}
      {variant === "duotone-regular" && (
        <path d="M24 32C10.7 32 0 42.7 0 56L0 456c0 13.3 10.7 24 24 24s24-10.7 24-24L48 56c0-13.3-10.7-24-24-24zm144 0c-13.3 0-24 10.7-24 24l0 400c0 13.3 10.7 24 24 24s24-10.7 24-24l0-400c0-13.3-10.7-24-24-24z" />
      )}
      {variant === "sharp-solid" && <path d="M64 32l-64 0 0 448 64 0 0-448zm128 0l-64 0 0 448 64 0 0-448z" />}
      {variant === "sharp-duotone-solid" && (
        <>
          <path opacity=".4" d="M128 32l64 0 0 448-64 0 0-448z" />
          <path d="M0 32l64 0 0 448-64 0 0-448z" />
        </>
      )}
      {variant === "sharp-regular" && <path d="M48 32l-48 0 0 448 48 0 0-448zm144 0l-48 0 0 448 48 0 0-448z" />}
      {variant === "sharp-duotone-regular" && <path d="M48 32l-48 0 0 448 48 0 0-448zm144 0l-48 0 0 448 48 0 0-448z" />}
    </svg>
  );
}
