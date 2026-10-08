import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `play-pause`, in Duotone Light (the default), Duotone Solid,
 * Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function PlayPauseIcon({ className, variant = "duotone-light" }: IconProps) {
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
          <path opacity=".4" d="M32 96L32 416 224 256 32 96z" />
          <path d="M384 80c0-8.8-7.2-16-16-16s-16 7.2-16 16l0 352c0 8.8 7.2 16 16 16s16-7.2 16-16l0-352zm128 0c0-8.8-7.2-16-16-16s-16 7.2-16 16l0 352c0 8.8 7.2 16 16 16s16-7.2 16-16l0-352zM224 256L32 416 32 96 224 256zM52.5 71.4c-9.5-7.9-22.8-9.7-34.1-4.4S0 83.6 0 96L0 416c0 12.4 7.2 23.7 18.4 29s24.5 3.6 34.1-4.4l192-160c7.3-6.1 11.5-15.1 11.5-24.6s-4.2-18.5-11.5-24.6l-192-160z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M320 96l0 320c0 17.7 14.3 32 32 32s32-14.3 32-32l0-320c0-17.7-14.3-32-32-32s-32 14.3-32 32zm128 0l0 320c0 17.7 14.3 32 32 32s32-14.3 32-32l0-320c0-17.7-14.3-32-32-32s-32 14.3-32 32z"
          />
          <path d="M52.5 71.4c-9.5-7.9-22.8-9.7-34.1-4.4S0 83.6 0 96L0 416c0 12.4 7.2 23.7 18.4 29s24.5 3.6 34.1-4.4l192-160c7.3-6.1 11.5-15.1 11.5-24.6s-4.2-18.5-11.5-24.6l-192-160z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M52.5 71.4c-9.5-7.9-22.8-9.7-34.1-4.4S0 83.6 0 96L0 416c0 12.4 7.2 23.7 18.4 29s24.5 3.6 34.1-4.4l192-160c7.3-6.1 11.5-15.1 11.5-24.6s-4.2-18.5-11.5-24.6l-192-160zM384 96c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 320c0 17.7 14.3 32 32 32s32-14.3 32-32l0-320zm128 0c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 320c0 17.7 14.3 32 32 32s32-14.3 32-32l0-320z" />
      )}
      {variant === "classic-light" && (
        <path d="M384 80c0-8.8-7.2-16-16-16s-16 7.2-16 16l0 352c0 8.8 7.2 16 16 16s16-7.2 16-16l0-352zm128 0c0-8.8-7.2-16-16-16s-16 7.2-16 16l0 352c0 8.8 7.2 16 16 16s16-7.2 16-16l0-352zM224 256L32 416 32 96 224 256zM52.5 71.4c-9.5-7.9-22.8-9.7-34.1-4.4S0 83.6 0 96L0 416c0 12.4 7.2 23.7 18.4 29s24.5 3.6 34.1-4.4l192-160c7.3-6.1 11.5-15.1 11.5-24.6s-4.2-18.5-11.5-24.6l-192-160z" />
      )}
    </svg>
  );
}
