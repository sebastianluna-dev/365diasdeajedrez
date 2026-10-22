import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Whoever is signed in, in the menu of the bar. Font Awesome's `user`, in
 * Duotone Light (the default), Duotone Solid, Classic Solid, Classic Light, Sharp Duotone Light or Sharp Light,
 * as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function UserIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="-117.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "duotone-light" && (
        <>
          <path
            opacity=".4"
            d="M16 512c8.8 0 16-7.2 16-16l0-16c0-79.5 64.5-144 144-144l96 0c79.5 0 144 64.5 144 144l0 16c0 8.8 7.2 16 16 16L16 512zM320 128a96 96 0 1 1 -192 0 96 96 0 1 1 192 0z"
          />
          <path d="M128 128a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zm224 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0zM32 480c0-79.5 64.5-144 144-144l96 0c79.5 0 144 64.5 144 144l0 16c0 8.8 7.2 16 16 16s16-7.2 16-16l0-16c0-97.2-78.8-176-176-176l-96 0C78.8 304 0 382.8 0 480l0 16c0 8.8 7.2 16 16 16s16-7.2 16-16l0-16z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path opacity=".4" d="M104 128a120 120 0 1 0 240 0 120 120 0 1 0 -240 0z" />
          <path d="M16 482.3C16 383.8 95.8 304 194.3 304l59.4 0c98.5 0 178.3 79.8 178.3 178.3 0 16.4-13.3 29.7-29.7 29.7L45.7 512C29.3 512 16 498.7 16 482.3z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M224 248a120 120 0 1 0 0-240 120 120 0 1 0 0 240zm-29.7 56C95.8 304 16 383.8 16 482.3 16 498.7 29.3 512 45.7 512l356.6 0c16.4 0 29.7-13.3 29.7-29.7 0-98.5-79.8-178.3-178.3-178.3l-59.4 0z" />
      )}
      {variant === "classic-light" && (
        <path d="M128 128a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zm224 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0zM32 480c0-79.5 64.5-144 144-144l96 0c79.5 0 144 64.5 144 144l0 16c0 8.8 7.2 16 16 16s16-7.2 16-16l0-16c0-97.2-78.8-176-176-176l-96 0C78.8 304 0 382.8 0 480l0 16c0 8.8 7.2 16 16 16s16-7.2 16-16l0-16z" />
      )}
      {variant === "sharp-duotone-light" && (
        <>
          <path
            opacity=".4"
            d="M33.5 512l381 0-54.2-176-272.7 0-54.2 176zM128 128a96 96 0 1 0 192 0 96 96 0 1 0 -192 0z"
          />
          <path d="M128 128a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zM33.5 512l54.2-176 272.7 0 54.2 176 33.5 0-64-208-320 0-64 208 33.5 0zM224 256a128 128 0 1 0 0-256 128 128 0 1 0 0 256z" />
        </>
      )}
      {variant === "sharp-light" && (
        <path d="M128 128a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zM33.5 512l54.2-176 272.7 0 54.2 176 33.5 0-64-208-320 0-64 208 33.5 0zM224 256a128 128 0 1 0 0-256 128 128 0 1 0 0 256z" />
      )}
    </svg>
  );
}
