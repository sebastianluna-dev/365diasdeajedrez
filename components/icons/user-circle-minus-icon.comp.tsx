import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `user-circle-minus`, in Duotone Light (the default), Duotone
 * Solid, Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function UserCircleMinusIcon({ className, variant = "duotone-light" }: IconProps) {
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
          <path
            opacity=".4"
            d="M16 512c8.8 0 16-7.2 16-16l0-16c0-79.5 64.5-144 144-144l74.9 0c-7.1 20-10.9 41.6-10.9 64 0 41.8 13.4 80.5 36 112L16 512zM320 128a96 96 0 1 1 -192 0 96 96 0 1 1 192 0z"
          />
          <path d="M128 128a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zm224 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0zM32 480c0-79.5 64.5-144 144-144l74.9 0c4-11.2 8.9-21.9 14.8-32L176 304C78.8 304 0 382.8 0 480l0 16c0 8.8 7.2 16 16 16s16-7.2 16-16l0-16zM432 288a112 112 0 1 1 0 224 112 112 0 1 1 0-224zm0 256a144 144 0 1 0 0-288 144 144 0 1 0 0 288zm80-144c0-8.8-7.2-16-16-16l-128 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l128 0c8.8 0 16-7.2 16-16z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M16 482.3C16 498.7 29.3 512 45.7 512L276 512c-22.7-31.5-36-70.2-36-112 0-34.8 9.3-67.5 25.5-95.6-3.9-.3-7.8-.4-11.8-.4l-59.4 0C95.8 304 16 383.8 16 482.3zM104 128a120 120 0 1 0 240 0 120 120 0 1 0 -240 0z"
          />
          <path d="M432 544a144 144 0 1 0 0-288 144 144 0 1 0 0 288zm64-128l-128 0c-8.8 0-16-7.2-16-16s7.2-16 16-16l128 0c8.8 0 16 7.2 16 16s-7.2 16-16 16z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M224 8a120 120 0 1 1 0 240 120 120 0 1 1 0-240zM194.3 304l59.4 0c3.9 0 7.9 .1 11.8 .4-16.2 28.2-25.5 60.8-25.5 95.6 0 41.8 13.4 80.5 36 112L45.7 512C29.3 512 16 498.7 16 482.3 16 383.8 95.8 304 194.3 304zM288 400a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm224 0c0-8.8-7.2-16-16-16l-128 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l128 0c8.8 0 16-7.2 16-16z" />
      )}
      {variant === "classic-light" && (
        <path d="M128 128a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zm224 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0zM32 480c0-79.5 64.5-144 144-144l74.9 0c4-11.2 8.9-21.9 14.8-32L176 304C78.8 304 0 382.8 0 480l0 16c0 8.8 7.2 16 16 16s16-7.2 16-16l0-16zM432 288a112 112 0 1 1 0 224 112 112 0 1 1 0-224zm0 256a144 144 0 1 0 0-288 144 144 0 1 0 0 288zm80-144c0-8.8-7.2-16-16-16l-128 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l128 0c8.8 0 16-7.2 16-16z" />
      )}
    </svg>
  );
}
