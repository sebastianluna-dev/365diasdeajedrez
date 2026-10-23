import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * To the first move, in the game viewer, which draws it in Classic Solid. Font
 * Awesome's `backward-step`, in Duotone Light (the default), Duotone Solid,
 * Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function BackwardStepIcon({ className, variant = "duotone-light" }: IconProps) {
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
            d="M49.4 256l10.2 6.7 280 184c2.5 1.6 5.6 1.8 8.2 .4s4.2-4.1 4.2-7l0-368c0-2.9-1.6-5.6-4.2-7s-5.7-1.3-8.2 .4l-280 184-10.2 6.7z"
          />
          <path d="M16 32c8.8 0 16 7.2 16 16l0 181.2 10-6.6 280-184c12.3-8.1 28-8.8 41-1.8S384 57.3 384 72l0 368c0 14.7-8.1 28.2-21 35.2s-28.7 6.3-41-1.8l-280-184-10-6.6 0 181.2c0 8.8-7.2 16-16 16S0 472.8 0 464L0 48c0-8.8 7.2-16 16-16zM339.6 65.3l-280 184-10.2 6.7 10.2 6.7 280 184c2.5 1.6 5.6 1.8 8.2 .4s4.2-4.1 4.2-7l0-368c0-2.9-1.6-5.6-4.2-7s-5.7-1.3-8.2 .4z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M64 208.1l0 95.7 258 169.6c12.3 8.1 28 8.8 41 1.8s21-20.5 21-35.2l0-368c0-14.7-8.1-28.2-21-35.2s-28.7-6.3-41 1.8L64 208.1z"
          />
          <path d="M32 32l0 0C14.3 32 0 46.3 0 64L0 448c0 17.7 14.3 32 32 32l0 0c17.7 0 32-14.3 32-32L64 64c0-17.7-14.3-32-32-32z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M363 36.8c-12.9-7-28.7-6.3-41 1.8L64 208.1 64 64c0-17.7-14.3-32-32-32S0 46.3 0 64L0 448c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144.1 258 169.6c12.3 8.1 28 8.8 41 1.8s21-20.5 21-35.2l0-368c0-14.7-8.1-28.2-21-35.2z" />
      )}
      {variant === "classic-light" && (
        <path d="M16 32c8.8 0 16 7.2 16 16l0 181.2 10-6.6 280-184c12.3-8.1 28-8.8 41-1.8S384 57.3 384 72l0 368c0 14.7-8.1 28.2-21 35.2s-28.7 6.3-41-1.8l-280-184-10-6.6 0 181.2c0 8.8-7.2 16-16 16S0 472.8 0 464L0 48c0-8.8 7.2-16 16-16zM339.6 65.3l-280 184-10.2 6.7 10.2 6.7 280 184c2.5 1.6 5.6 1.8 8.2 .4s4.2-4.1 4.2-7l0-368c0-2.9-1.6-5.6-4.2-7s-5.7-1.3-8.2 .4z" />
      )}
      {variant === "sharp-duotone-light" && (
        <>
          <path opacity=".4" d="M60.4 256L352 73.7 352 438.3 60.4 256z" />
          <path d="M384 53.7l0-37.7-352 220 0-204-32 0 0 448 32 0 0-204 352 220 0-442.3zM60.4 256L352 73.7 352 438.3 60.4 256z" />
        </>
      )}
      {variant === "sharp-light" && (
        <path d="M384 53.7l0-37.7-352 220 0-204-32 0 0 448 32 0 0-204 352 220 0-442.3zM60.4 256L352 73.7 352 438.3 60.4 256z" />
      )}
      {variant === "classic-regular" && (
        <path d="M78.6 256L336 425.2 336 86.8 78.6 256zM363 475.2c-12.9 7-28.7 6.3-41-1.8L48 293.4 48 456c0 13.3-10.7 24-24 24S0 469.3 0 456L0 56C0 42.7 10.7 32 24 32S48 42.7 48 56L48 218.7 322 38.6c12.3-8.1 28-8.8 41-1.8S384 57.3 384 72l0 368c0 14.7-8.1 28.2-21 35.2z" />
      )}
      {variant === "duotone-regular" && (
        <>
          <path opacity=".4" d="M78.6 256L336 86.8 336 425.2 78.6 256z" />
          <path d="M24 32c13.3 0 24 10.7 24 24L48 218.7 322 38.6c12.3-8.1 28-8.8 41-1.8S384 57.3 384 72l0 368c0 14.7-8.1 28.2-21 35.2s-28.7 6.3-41-1.8L48 293.4 48 456c0 13.3-10.7 24-24 24S0 469.3 0 456L0 56C0 42.7 10.7 32 24 32zM78.6 256L336 425.2 336 86.8 78.6 256z" />
        </>
      )}
      {variant === "sharp-solid" && <path d="M64 296l0 184-64 0 0-448 64 0 0 184 320-200 0 480-320-200z" />}
      {variant === "sharp-duotone-solid" && (
        <>
          <path opacity=".4" d="M64 216l0 80 320 200 0-480-320 200z" />
          <path d="M64 32l-64 0 0 448 64 0z" />
        </>
      )}
      {variant === "sharp-regular" && (
        <path d="M384 72.6l0-56.6-336 210 0-194-48 0 0 448 48 0 0-194 336 210 0-423.4zM90.6 256L336 102.6 336 409.4 90.6 256z" />
      )}
      {variant === "sharp-duotone-regular" && (
        <>
          <path opacity=".4" d="M90.6 256L336 102.6 336 409.4 90.6 256z" />
          <path d="M384 72.6l0-56.6-336 210 0-194-48 0 0 448 48 0 0-194 336 210 0-423.4zM90.6 256L336 102.6 336 409.4 90.6 256z" />
        </>
      )}
    </svg>
  );
}
