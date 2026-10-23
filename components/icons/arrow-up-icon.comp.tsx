import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Up: promoting a variation in the move menu and, turned 45°, the way out to
 * the public site in the user menu. Font Awesome's `arrow-up`, in Duotone
 * Light (the default), Duotone Solid, Classic Solid or Classic Light, as
 * `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ArrowUpIcon({ className, variant = "duotone-light" }: IconProps) {
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
        <path d="M181.2 4.7c6.2-6.2 16.4-6.2 22.6 0l176 176c6.2 6.2 6.2 16.4 0 22.6s-16.4 6.2-22.6 0L208.5 54.6 208.5 496c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-441.4-148.7 148.7c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l176-176z" />
      )}
      {variant === "duotone-solid" && (
        <>
          <path opacity=".4" d="M160 109.3l32-32 32 32 0 370.7c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-370.7z" />
          <path d="M169.4 9.4c12.5-12.5 32.8-12.5 45.3 0l160 160c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L192 77.3 54.6 214.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l160-160z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M214.6 9.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 109.3 160 480c0 17.7 14.3 32 32 32s32-14.3 32-32l0-370.7 105.4 105.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z" />
      )}
      {variant === "classic-light" && (
        <path d="M203.3 4.7c-6.2-6.2-16.4-6.2-22.6 0l-176 176c-6.2 6.2-6.2 16.4 0 22.6s16.4 6.2 22.6 0L176 54.6 176 496c0 8.8 7.2 16 16 16s16-7.2 16-16l0-441.4 148.7 148.7c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6l-176-176z" />
      )}
      {variant === "sharp-duotone-light" && (
        <path d="M390.7 192l-22.6 22.6-160-160 0 457.4-32 0 0-457.4-160 160-22.6-22.6 198.6-198.6 198.6 198.6z" />
      )}
      {variant === "sharp-light" && (
        <path d="M203.4 4.7l-11.3-11.3-11.3 11.3-176 176-11.3 11.3 22.6 22.6 11.3-11.3 148.7-148.7 0 457.4 32 0 0-457.4 148.7 148.7 11.3 11.3 22.6-22.6-11.3-11.3-176-176z" />
      )}
      {variant === "classic-regular" && (
        <path d="M209.5 7c-9.4-9.4-24.6-9.4-33.9 0L7.5 175c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l127-127 0 406.1c0 13.3 10.7 24 24 24s24-10.7 24-24l0-406.1 127 127c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9L209.5 7z" />
      )}
      {variant === "duotone-regular" && (
        <path d="M175.5 7c9.4-9.4 24.6-9.4 33.9 0l168 168c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-127-127 0 406.1c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-406.1-127 127c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9L175.5 7z" />
      )}
      {variant === "sharp-solid" && (
        <path d="M246.9 9.4l-22.6-22.6-22.6 22.6-160 160-22.6 22.6 45.3 45.3c1.3-1.3 44-44 128-128l0 402.7 64 0 0-402.7c84 84 126.7 126.7 128 128l45.3-45.3-22.6-22.6-160-160z" />
      )}
      {variant === "sharp-duotone-solid" && (
        <>
          <path opacity=".4" d="M192.3 109.3l32-32 32 32 0 402.7-64 0 0-402.7z" />
          <path d="M224.3-13.3l22.6 22.6 160 160 22.6 22.6-45.3 45.3-22.6-22.6-137.4-137.4-137.4 137.4-22.6 22.6-45.3-45.3 22.6-22.6 160-160 22.6-22.6z" />
        </>
      )}
      {variant === "sharp-regular" && (
        <path d="M241.4 7l-17-17-17 17-185 185 33.9 33.9 17-17 127-127 0 430.1 48 0 0-430.1 127 127 17 17 33.9-33.9-17-17-168-168z" />
      )}
      {variant === "sharp-duotone-regular" && (
        <path d="M426.4 192l-33.9 33.9-144-144 0 430.1-48 0 0-430.1-144 144-33.9-33.9 201.9-201.9 201.9 201.9z" />
      )}
    </svg>
  );
}
