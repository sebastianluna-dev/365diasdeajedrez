import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * To the last move, in the game viewer, which draws it in Classic Solid. Font
 * Awesome's `forward-step`, in Duotone Light (the default), Duotone Solid,
 * Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ForwardStepIcon({ className, variant = "duotone-light" }: IconProps) {
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
            d="M32 72l0 368c0 2.9 1.6 5.6 4.2 7s5.7 1.3 8.2-.4l280-184 10.2-6.7-10.2-6.7-280-184c-2.5-1.6-5.6-1.8-8.2-.4S32 69.1 32 72z"
          />
          <path d="M368 32c-8.8 0-16 7.2-16 16l0 181.2-10-6.6-280-184c-12.3-8.1-28-8.8-41-1.8S0 57.3 0 72L0 440c0 14.7 8.1 28.2 21 35.2s28.7 6.3 41-1.8l280-184 10-6.6 0 181.2c0 8.8 7.2 16 16 16s16-7.2 16-16l0-416c0-8.8-7.2-16-16-16zM44.4 65.3l280 184 10.2 6.7-10.2 6.7-280 184c-2.5 1.6-5.6 1.8-8.2 .4s-4.2-4.1-4.2-7L32 72c0-2.9 1.6-5.6 4.2-7s5.7-1.3 8.2 .4z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M0 72L0 440c0 14.7 8.1 28.2 21 35.2s28.7 6.3 41-1.8l258-169.6 0-95.7-258-169.6c-12.3-8.1-28-8.8-41-1.8S0 57.3 0 72z"
          />
          <path d="M352 32l0 0c17.7 0 32 14.3 32 32l0 384c0 17.7-14.3 32-32 32l0 0c-17.7 0-32-14.3-32-32l0-384c0-17.7 14.3-32 32-32z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M21 36.8c12.9-7 28.7-6.3 41 1.8L320 208.1 320 64c0-17.7 14.3-32 32-32s32 14.3 32 32l0 384c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-144.1-258 169.6c-12.3 8.1-28 8.8-41 1.8S0 454.7 0 440L0 72C0 57.3 8.1 43.8 21 36.8z" />
      )}
      {variant === "classic-light" && (
        <path d="M368 32c-8.8 0-16 7.2-16 16l0 181.2-10-6.6-280-184c-12.3-8.1-28-8.8-41-1.8S0 57.3 0 72L0 440c0 14.7 8.1 28.2 21 35.2s28.7 6.3 41-1.8l280-184 10-6.6 0 181.2c0 8.8 7.2 16 16 16s16-7.2 16-16l0-416c0-8.8-7.2-16-16-16zM44.4 65.3l280 184 10.2 6.7-10.2 6.7-280 184c-2.5 1.6-5.6 1.8-8.2 .4s-4.2-4.1-4.2-7L32 72c0-2.9 1.6-5.6 4.2-7s5.7-1.3 8.2 .4z" />
      )}
      {variant === "sharp-duotone-light" && (
        <>
          <path opacity=".4" d="M32 73.7L32 438.3 323.6 256 32 73.7z" />
          <path d="M0 53.7l0-37.7 352 220 0-204 32 0 0 448-32 0 0-204-352 220 0-442.3zM323.6 256L32 73.7 32 438.3 323.6 256z" />
        </>
      )}
      {variant === "sharp-light" && (
        <path d="M0 53.7l0-37.7 352 220 0-204 32 0 0 448-32 0 0-204-352 220 0-442.3zM323.6 256L32 73.7 32 438.3 323.6 256z" />
      )}
      {variant === "classic-regular" && (
        <path d="M360 32c-13.3 0-24 10.7-24 24L336 218.7 62 38.6c-12.3-8.1-28-8.8-41-1.8S0 57.3 0 72L0 440c0 14.7 8.1 28.2 21 35.2s28.7 6.3 41-1.8L336 293.4 336 456c0 13.3 10.7 24 24 24s24-10.7 24-24l0-400c0-13.3-10.7-24-24-24zM305.4 256L48 425.2 48 86.8 305.4 256z" />
      )}
      {variant === "duotone-regular" && (
        <>
          <path opacity=".4" d="M48 86.8L48 425.2 305.4 256 48 86.8z" />
          <path d="M360 32c-13.3 0-24 10.7-24 24L336 218.7 62 38.6c-12.3-8.1-28-8.8-41-1.8S0 57.3 0 72L0 440c0 14.7 8.1 28.2 21 35.2s28.7 6.3 41-1.8L336 293.4 336 456c0 13.3 10.7 24 24 24s24-10.7 24-24l0-400c0-13.3-10.7-24-24-24zM305.4 256L48 425.2 48 86.8 305.4 256z" />
        </>
      )}
      {variant === "sharp-solid" && <path d="M320 296l0 184 64 0 0-448-64 0 0 184-320-200 0 480 320-200z" />}
      {variant === "sharp-duotone-solid" && (
        <>
          <path opacity=".4" d="M0 16L320 216 320 296 0 496 0 16z" />
          <path d="M320 32l64 0 0 448-64 0z" />
        </>
      )}
      {variant === "sharp-regular" && (
        <path d="M0 72.6l0-56.6 336 210 0-194 48 0 0 448-48 0 0-194-336 210 0-423.4zM293.4 256L48 102.6 48 409.4 293.4 256z" />
      )}
      {variant === "sharp-duotone-regular" && (
        <>
          <path opacity=".4" d="M48 102.6L48 409.4 293.4 256 48 102.6z" />
          <path d="M0 72.6l0-56.6 336 210 0-194 48 0 0 448-48 0 0-194-336 210 0-423.4zM293.4 256L48 102.6 48 409.4 293.4 256z" />
        </>
      )}
    </svg>
  );
}
