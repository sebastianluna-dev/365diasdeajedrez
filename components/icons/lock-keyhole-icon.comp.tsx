import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `lock-keyhole`, in Duotone Light (the default), Duotone Solid,
 * Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function LockKeyholeIcon({ className, variant = "duotone-light" }: IconProps) {
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
        <>
          <path
            opacity=".4"
            d="M32 224l0 224c0 17.7 14.3 32 32 32l256 0c17.7 0 32-14.3 32-32l0-224c0-17.7-14.3-32-32-32L64 192c-17.7 0-32 14.3-32 32zm144 64c0-8.8 7.2-16 16-16s16 7.2 16 16l0 96c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-96z"
          />
          <path d="M192 0c53 0 96 43 96 96l0 64-192 0 0-64c0-53 43-96 96-96zM64 96l0 64c-35.3 0-64 28.7-64 64L0 448c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-224c0-35.3-28.7-64-64-64l0-64c0-70.7-57.3-128-128-128S64 25.3 64 96zm0 96l256 0c17.7 0 32 14.3 32 32l0 224c0 17.7-14.3 32-32 32L64 480c-17.7 0-32-14.3-32-32l0-224c0-17.7 14.3-32 32-32zm144 96c0-8.8-7.2-16-16-16s-16 7.2-16 16l0 96c0 8.8 7.2 16 16 16s16-7.2 16-16l0-96z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M64 96l0 64 64 0 0-64c0-35.3 28.7-64 64-64s64 28.7 64 64l0 64 64 0 0-64c0-70.7-57.3-128-128-128S64 25.3 64 96z"
          />
          <path d="M64 160c-35.3 0-64 28.7-64 64L0 448c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-224c0-35.3-28.7-64-64-64L64 160zM216 296l0 80c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-80c0-13.3 10.7-24 24-24s24 10.7 24 24z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M192 32c35.3 0 64 28.7 64 64l0 64-128 0 0-64c0-35.3 28.7-64 64-64zM64 96l0 64c-35.3 0-64 28.7-64 64L0 448c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-224c0-35.3-28.7-64-64-64l0-64c0-70.7-57.3-128-128-128S64 25.3 64 96zM216 296l0 80c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-80c0-13.3 10.7-24 24-24s24 10.7 24 24z" />
      )}
      {variant === "classic-light" && (
        <path d="M192 0c53 0 96 43 96 96l0 64-192 0 0-64c0-53 43-96 96-96zM64 96l0 64c-35.3 0-64 28.7-64 64L0 448c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-224c0-35.3-28.7-64-64-64l0-64c0-70.7-57.3-128-128-128S64 25.3 64 96zm0 96l256 0c17.7 0 32 14.3 32 32l0 224c0 17.7-14.3 32-32 32L64 480c-17.7 0-32-14.3-32-32l0-224c0-17.7 14.3-32 32-32zm144 96c0-8.8-7.2-16-16-16s-16 7.2-16 16l0 96c0 8.8 7.2 16 16 16s16-7.2 16-16l0-96z" />
      )}
    </svg>
  );
}
