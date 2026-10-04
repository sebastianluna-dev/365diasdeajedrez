import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `sparkle`, in Duotone Light (the default), Duotone Solid or
 * Classic Solid, as `variant` says. Its Duotone Solid drawing is a single
 * layer, drawn at full strength: at 40 % it would read as switched off.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function SparkleIcon({ className, variant = "duotone-light" }: IconProps) {
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
          <path
            opacity=".4"
            d="M46.8 256l138.6 51.9c8.7 3.2 15.5 10.1 18.8 18.8L256 465.2 307.9 326.6c3.2-8.7 10.1-15.5 18.8-18.8L465.2 256 326.6 204.1c-8.7-3.2-15.5-10.1-18.8-18.8L256 46.8 204.1 185.4c-3.2 8.7-10.1 15.5-18.8 18.8L46.8 256z"
          />
          <path d="M326.6 204.1L465.2 256 326.6 307.9c-8.7 3.2-15.5 10.1-18.8 18.8L256 465.2 204.1 326.6c-3.2-8.7-10.1-15.5-18.8-18.8L46.8 256 185.4 204.1c8.7-3.2 15.5-10.1 18.8-18.8L256 46.8 307.9 185.4c3.2 8.7 10.1 15.5 18.8 18.8zm11.2-30L278.5 15.6C275 6.2 266 0 256 0s-19 6.2-22.5 15.6L174.2 174.2 15.6 233.5C6.2 237 0 246 0 256s6.2 19 15.6 22.5l158.6 59.4 59.4 158.6C237 505.8 246 512 256 512s19-6.2 22.5-15.6l59.4-158.6 158.6-59.4C505.8 275 512 266 512 256s-6.2-19-15.6-22.5L337.8 174.2z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <path d="M278.5 15.6C275 6.2 266 0 256 0s-19 6.2-22.5 15.6L174.2 174.2 15.6 233.5C6.2 237 0 246 0 256s6.2 19 15.6 22.5l158.6 59.4 59.4 158.6C237 505.8 246 512 256 512s19-6.2 22.5-15.6l59.4-158.6 158.6-59.4C505.8 275 512 266 512 256s-6.2-19-15.6-22.5L337.8 174.2 278.5 15.6z" />
      )}
      {variant === "classic-solid" && (
        <path d="M278.5 15.6C275 6.2 266 0 256 0s-19 6.2-22.5 15.6L174.2 174.2 15.6 233.5C6.2 237 0 246 0 256s6.2 19 15.6 22.5l158.6 59.4 59.4 158.6C237 505.8 246 512 256 512s19-6.2 22.5-15.6l59.4-158.6 158.6-59.4C505.8 275 512 266 512 256s-6.2-19-15.6-22.5L337.8 174.2 278.5 15.6z" />
      )}
    </svg>
  );
}
