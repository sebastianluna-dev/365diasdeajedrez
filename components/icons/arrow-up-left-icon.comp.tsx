import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `arrow-up-left`, in Duotone Light (the default), Duotone
 * Solid, Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ArrowUpLeftIcon({ className, variant = "duotone-light" }: IconProps) {
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
    </svg>
  );
}
