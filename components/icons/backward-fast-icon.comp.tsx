import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `backward-fast`, in Duotone Light (the default), Duotone
 * Solid or Classic Solid, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function BackwardFastIcon({ className, variant = "duotone-light" }: IconProps) {
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
          <path opacity=".4" d="M32 256L256 448 256 64 32 256zm256-27.4l0 54.9 192 164.6 0-384-192 164.6z" />
          <path d="M16 480c-8.8 0-16-7.2-16-16L0 48c0-8.8 7.2-16 16-16s16 7.2 16 16L32 213.9 235.2 39.7c9.5-8.1 22.8-10 34.2-4.8S288 51.5 288 64l0 122.4 171.2-146.7c9.5-8.1 22.8-10 34.2-4.8S512 51.5 512 64l0 384c0 12.5-7.3 23.8-18.6 29.1s-24.7 3.4-34.2-4.8L288 325.6 288 448c0 12.5-7.3 23.8-18.6 29.1s-24.7 3.4-34.2-4.8L32 298.1 32 464c0 8.8-7.2 16-16 16zM288 283.4l192 164.6 0-384-192 164.6 0 54.9zM256 448L256 64 32 256 256 448z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M64 210.7l0 90.5 169.4 169.4c9.2 9.2 22.9 11.9 34.9 6.9S288 460.9 288 448l0-146.7 169.4 169.4c9.2 9.2 22.9 11.9 34.9 6.9S512 460.9 512 448l0-384c0-12.9-7.8-24.6-19.8-29.6s-25.7-2.2-34.9 6.9L288 210.7 288 64c0-12.9-7.8-24.6-19.8-29.6s-25.7-2.2-34.9 6.9L64 210.7z"
          />
          <path d="M32 480c-17.7 0-32-14.3-32-32L0 64C0 46.3 14.3 32 32 32S64 46.3 64 64l0 384c0 17.7-14.3 32-32 32z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M492.2 477.6c-12 5-25.7 2.2-34.9-6.9L288 301.3 288 448c0 12.9-7.8 24.6-19.8 29.6s-25.7 2.2-34.9-6.9L64 301.3 64 448c0 17.7-14.3 32-32 32S0 465.7 0 448L0 64C0 46.3 14.3 32 32 32S64 46.3 64 64L64 210.7 233.4 41.4c9.2-9.2 22.9-11.9 34.9-6.9S288 51.1 288 64l0 146.7 169.4-169.4c9.2-9.2 22.9-11.9 34.9-6.9S512 51.1 512 64l0 384c0 12.9-7.8 24.6-19.8 29.6z" />
      )}
    </svg>
  );
}
