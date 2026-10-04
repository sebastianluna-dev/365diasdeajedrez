import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Up: promoting a variation in the move menu and, turned 45°, the way out to
 * the public site in the user menu. Font Awesome's `arrow-up`, in Duotone
 * Light (the default), Duotone Solid or Classic Solid, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ArrowUpIcon({ className, variant = "duotone-light" }: IconProps) {
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
    </svg>
  );
}
