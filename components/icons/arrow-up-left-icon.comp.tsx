import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `arrow-up-left`, in twelve styles (Duotone Light is the default), as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ArrowUpLeftIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox={
        {
          "duotone-light": "-149.33 -85.33 682.67 682.67",
          "duotone-solid": "-149.33 -85.33 682.67 682.67",
          "classic-solid": "-149.33 -85.33 682.67 682.67",
          "classic-light": "-149.33 -85.33 682.67 682.67",
          "sharp-duotone-light": "-149.33 -85.33 682.67 682.67",
          "sharp-light": "-149.33 -85.33 682.67 682.67",
          "classic-regular": "-149.33 -85.33 682.67 682.67",
          "duotone-regular": "-149.33 -85.33 682.67 682.67",
          "sharp-solid": "-117.33 -85.33 682.67 682.67",
          "sharp-duotone-solid": "-117.33 -85.33 682.67 682.67",
          "sharp-regular": "-117.33 -85.33 682.67 682.67",
          "sharp-duotone-regular": "-117.33 -85.33 682.67 682.67",
        }[variant]
      }
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "duotone-light" && (
        <path d="M16 64C7.2 64 0 71.2 0 80L0 336c0 8.8 7.2 16 16 16s16-7.2 16-16l0-217.4 324.7 324.7c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6L54.6 96 272 96c8.8 0 16-7.2 16-16s-7.2-16-16-16L16 64z" />
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M64 128l0 45.3 265.4 265.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 128 64 128z"
          />
          <path d="M0 96C0 78.3 14.3 64 32 64l224 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-192 0 0 192c0 17.7-14.3 32-32 32S0 337.7 0 320L0 96z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M32 64C14.3 64 0 78.3 0 96L0 320c0 17.7 14.3 32 32 32s32-14.3 32-32l0-146.7 265.4 265.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 128 256 128c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 64z" />
      )}
      {variant === "classic-light" && (
        <path d="M16 64C7.2 64 0 71.2 0 80L0 336c0 8.8 7.2 16 16 16s16-7.2 16-16l0-217.4 324.7 324.7c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6L54.6 96 272 96c8.8 0 16-7.2 16-16s-7.2-16-16-16L16 64z" />
      )}
      {variant === "sharp-duotone-light" && (
        <path d="M16.1 64l-16 0 0 288 32 0 0-233.4 324.7 324.7 11.3 11.3 22.6-22.6-11.3-11.3-324.7-324.7 233.4 0 0-32-272 0z" />
      )}
      {variant === "sharp-light" && (
        <path d="M16.1 64l-16 0 0 288 32 0 0-233.4 324.7 324.7 11.3 11.3 22.6-22.6-11.3-11.3-324.7-324.7 233.4 0 0-32-272 0z" />
      )}
      {variant === "classic-regular" && (
        <path d="M24 64C10.7 64 0 74.7 0 88L0 328c0 13.3 10.7 24 24 24s24-10.7 24-24l0-182.1 295 295c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9L81.9 112 264 112c13.3 0 24-10.7 24-24s-10.7-24-24-24L24 64z" />
      )}
      {variant === "duotone-regular" && (
        <path d="M24 64C10.7 64 0 74.7 0 88L0 328c0 13.3 10.7 24 24 24s24-10.7 24-24l0-182.1 295 295c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9L81.9 112 264 112c13.3 0 24-10.7 24-24s-10.7-24-24-24L24 64z" />
      )}
      {variant === "sharp-solid" && (
        <path d="M64.3 64l-32 0 0 288 64 0 0-178.7 265.4 265.4 22.6 22.6 45.3-45.3-22.6-22.6-265.4-265.4 178.7 0 0-64-256 0z" />
      )}
      {variant === "sharp-duotone-solid" && (
        <>
          <path opacity=".4" d="M96.3 128l0 45.3 265.4 265.4 22.6 22.6 45.3-45.3-22.6-22.6-265.4-265.4-45.3 0z" />
          <path d="M32.3 64l288 0 0 64-224 0 0 224-64 0 0-288z" />
        </>
      )}
      {variant === "sharp-regular" && (
        <path d="M56.4 64l-24 0 0 288 48 0 0-206.1 295 295 17 17 33.9-33.9-17-17-295-295 206.1 0 0-48-264 0z" />
      )}
      {variant === "sharp-duotone-regular" && (
        <path d="M56.4 64l-24 0 0 288 48 0 0-206.1 295 295 17 17 33.9-33.9-17-17-295-295 206.1 0 0-48-264 0z" />
      )}
    </svg>
  );
}
