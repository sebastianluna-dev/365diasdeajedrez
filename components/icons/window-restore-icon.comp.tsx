import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `window-restore`, in Duotone Light (the default), Duotone
 * Solid or Classic Solid, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function WindowRestoreIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="-53.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "duotone-light" && (
        <>
          <path opacity=".4" d="M32 288l0 128c0 17.7 14.3 32 32 32l288 0c17.7 0 32-14.3 32-32l0-128-352 0z" />
          <path d="M512 64L224 64c-17.7 0-32 14.3-32 32l0 16-32 0 0-16c0-35.3 28.7-64 64-64l288 0c35.3 0 64 28.7 64 64l0 192c0 35.3-28.7 64-64 64l-48 0 0-32 48 0c17.7 0 32-14.3 32-32l0-192c0-17.7-14.3-32-32-32zM352 192L64 192c-17.7 0-32 14.3-32 32l0 32 352 0 0-32c0-17.7-14.3-32-32-32zm32 96l-352 0 0 128c0 17.7 14.3 32 32 32l288 0c17.7 0 32-14.3 32-32l0-128zM64 160l288 0c35.3 0 64 28.7 64 64l0 192c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 224c0-35.3 28.7-64 64-64z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M160 96l0 64 64 0 0-64 288 0 0 192-96 0 0 64 96 0c35.3 0 64-28.7 64-64l0-192c0-35.3-28.7-64-64-64L224 32c-35.3 0-64 28.7-64 64z"
          />
          <path d="M64 160c-35.3 0-64 28.7-64 64L0 416c0 35.3 28.7 64 64 64l288 0c35.3 0 64-28.7 64-64l0-192c0-35.3-28.7-64-64-64L64 160zm24 80l240 0c13.3 0 24 10.7 24 24s-10.7 24-24 24L88 288c-13.3 0-24-10.7-24-24s10.7-24 24-24z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M512 96L160 96c0-35.3 28.7-64 64-64l288 0c35.3 0 64 28.7 64 64l0 192c0 35.3-28.7 64-64 64l-48 0 0-64 48 0 0-192zM0 224c0-35.3 28.7-64 64-64l288 0c35.3 0 64 28.7 64 64l0 192c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 224zm64 40c0 13.3 10.7 24 24 24l240 0c13.3 0 24-10.7 24-24s-10.7-24-24-24L88 240c-13.3 0-24 10.7-24 24z" />
      )}
    </svg>
  );
}
