import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `bolt`, in Duotone Light (the default), Duotone Solid or
 * Classic Solid, as `variant` says. Its Duotone Solid drawing is a single
 * layer, drawn at full strength: at 40 % it would read as switched off.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function BoltIcon({ className, variant = "duotone-light" }: IconProps) {
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
            d="M32 256l144.7 0c10.6 0 20.5 5.3 26.5 14.1s7.2 20 3.2 29.8L128 496 416 256 271.3 256c-10.6 0-20.5-5.3-26.5-14.1s-7.2-20-3.2-29.8L320 16 32 256z"
          />
          <path d="M284.1 192L349.7 27.9c5.4-13.6 1-29.2-10.9-37.8s-28-8.1-39.3 1.3l-288 240C1.2 240-2.7 254.2 1.9 266.9S18.5 288 32 288l144.7 0-12.8 32-65.6 164.1c-5.4 13.6-.9 29.2 10.9 37.8s28 8.1 39.3-1.3l288-240c10.3-8.6 14.2-22.8 9.6-35.5S429.5 224 416 224l-144.7 0 12.8-32zm-80.8 78.1c-6-8.8-15.9-14.1-26.5-14.1L32 256 320 16 241.6 212.1c-3.9 9.9-2.7 21 3.2 29.8S260.6 256 271.3 256l144.7 0-288 240 78.4-196.1c3.9-9.9 2.7-21-3.2-29.8z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <path d="M338.8-9.9c11.9 8.6 16.3 24.2 10.9 37.8L271.3 224 416 224c13.5 0 25.5 8.4 30.1 21.1s.7 26.9-9.6 35.5l-288 240c-11.3 9.4-27.4 9.9-39.3 1.3s-16.3-24.2-10.9-37.8L176.7 288 32 288c-13.5 0-25.5-8.4-30.1-21.1s-.7-26.9 9.6-35.5l288-240c11.3-9.4 27.4-9.9 39.3-1.3z" />
      )}
      {variant === "classic-solid" && (
        <path d="M338.8-9.9c11.9 8.6 16.3 24.2 10.9 37.8L271.3 224 416 224c13.5 0 25.5 8.4 30.1 21.1s.7 26.9-9.6 35.5l-288 240c-11.3 9.4-27.4 9.9-39.3 1.3s-16.3-24.2-10.9-37.8L176.7 288 32 288c-13.5 0-25.5-8.4-30.1-21.1s-.7-26.9 9.6-35.5l288-240c11.3-9.4 27.4-9.9 39.3-1.3z" />
      )}
    </svg>
  );
}
