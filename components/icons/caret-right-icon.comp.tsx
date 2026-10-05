import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * The step of the trail that says where one is in a course, which draws it in
 * Duotone Solid. `AngleRightIcon` is the open chevron, for what opens and
 * closes. Font Awesome's `caret-right`, in Duotone Light (the default),
 * Duotone Solid, Classic Solid or Classic Light, as `variant` says. Its
 * Duotone Solid drawing is a single layer, drawn at full strength: at 40 % it
 * would read as switched off.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function CaretRightIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 256 512" width="8" height="16" fill="currentColor" aria-hidden="true">
      {variant === "duotone-light" && (
        <>
          <path
            opacity=".4"
            d="M80.3 128l0 256 16 16 144-144-144-144-16 16zm16 0L223.2 254.9c.3 .4 .6 .8 .7 1.1-42.5 42.8-85 85.4-127.6 128l0-256z"
          />
          <path d="M246.9 233.4c11.6 12.9 12.8 32.4 0 45.2l-128 128c-9.1 9.2-22.9 11.9-34.9 6.9l-4.3-2.2c-9.5-5.7-15.5-16.1-15.5-27.4l0-256 .3-4.8c1.4-9.4 7-17.7 15.1-22.6l4.3-2.2c10.5-4.3 22.3-2.8 31.2 3.8l3.7 3.1 128 128zm-23 22.7c-.1-.3-.3-.7-.7-1.1L96.3 128 96.3 384 224 256.3c0-.1-.1-.2-.1-.2z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <path d="M249.3 235.8c10.2 12.6 9.5 31.1-2.2 42.8l-128 128c-9.2 9.2-22.9 11.9-34.9 6.9S64.5 396.9 64.5 384l0-256c0-12.9 7.8-24.6 19.8-29.6s25.7-2.2 34.9 6.9l128 128 2.2 2.4z" />
      )}
      {variant === "classic-solid" && (
        <path d="M249.3 235.8c10.2 12.6 9.5 31.1-2.2 42.8l-128 128c-9.2 9.2-22.9 11.9-34.9 6.9S64.5 396.9 64.5 384l0-256c0-12.9 7.8-24.6 19.8-29.6s25.7-2.2 34.9 6.9l128 128 2.2 2.4z" />
      )}
      {variant === "classic-light" && (
        <path d="M246.9 233.4c11.6 12.9 12.8 32.4 0 45.2l-128 128c-9.1 9.2-22.9 11.9-34.9 6.9l-4.3-2.2c-9.5-5.7-15.5-16.1-15.5-27.4l0-256 .3-4.8c1.4-9.4 7-17.7 15.1-22.6l4.3-2.2c10.5-4.3 22.3-2.8 31.2 3.8l3.7 3.1 128 128zm-23 22.7c-.1-.3-.3-.7-.7-1.1L96.3 128 96.3 384 224 256.3c0-.1-.1-.2-.1-.2z" />
      )}
    </svg>
  );
}
