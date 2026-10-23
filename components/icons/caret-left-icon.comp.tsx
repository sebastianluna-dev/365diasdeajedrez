import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `caret-left`, in twelve styles (Duotone Light is the default), as `variant` says. Its Duotone Solid drawing
 * is a single layer, drawn at full strength: at 40 % it would read as switched
 * off.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function CaretLeftIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox={
        {
          "duotone-light": "-213.33 -85.33 682.67 682.67",
          "duotone-solid": "-213.33 -85.33 682.67 682.67",
          "classic-solid": "-213.33 -85.33 682.67 682.67",
          "classic-light": "-213.33 -85.33 682.67 682.67",
          "sharp-duotone-light": "-181.33 -85.33 682.67 682.67",
          "sharp-light": "-181.33 -85.33 682.67 682.67",
          "classic-regular": "-213.33 -85.33 682.67 682.67",
          "duotone-regular": "-213.33 -85.33 682.67 682.67",
          "sharp-solid": "-181.33 -85.33 682.67 682.67",
          "sharp-duotone-solid": "-181.33 -85.33 682.67 682.67",
          "sharp-regular": "-181.33 -85.33 682.67 682.67",
          "sharp-duotone-regular": "-181.33 -85.33 682.67 682.67",
        }[variant]
      }
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "duotone-light" && (
        <>
          <path opacity=".4" d="M32.7 256c.1-.3 .3-.7 .7-1.1l126.9-126.9 0 256c-42.6-42.6-85.1-85.1-127.6-128z" />
          <path d="M9.7 233.4c-11.6 12.9-12.8 32.4 0 45.2l128 128c9.1 9.2 22.9 11.9 34.9 6.9l4.3-2.2c9.5-5.7 15.5-16.1 15.5-27.4l0-256-.3-4.8c-1.4-9.4-7-17.7-15.1-22.6l-4.3-2.2c-10.5-4.3-22.3-2.8-31.2 3.8l-3.7 3.1-128 128zm23 22.7c.1-.3 .3-.7 .7-1.1l126.9-126.9 0 256-127.7-127.7c0-.1 .1-.2 .1-.2z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <path d="M7.7 235.8c-10.3 12.6-9.5 31.1 2.2 42.8l128 128c9.2 9.2 22.9 11.9 34.9 6.9s19.8-16.6 19.8-29.6l0-256c0-12.9-7.8-24.6-19.8-29.6s-25.7-2.2-34.9 6.9l-128 128-2.2 2.4z" />
      )}
      {variant === "classic-solid" && (
        <path d="M7.7 235.8c-10.3 12.6-9.5 31.1 2.2 42.8l128 128c9.2 9.2 22.9 11.9 34.9 6.9s19.8-16.6 19.8-29.6l0-256c0-12.9-7.8-24.6-19.8-29.6s-25.7-2.2-34.9 6.9l-128 128-2.2 2.4z" />
      )}
      {variant === "classic-light" && (
        <path d="M9.7 233.4c-11.6 12.9-12.8 32.4 0 45.2l128 128c9.1 9.2 22.9 11.9 34.9 6.9l4.3-2.2c9.5-5.7 15.5-16.1 15.5-27.4l0-256-.3-4.8c-1.4-9.4-7-17.7-15.1-22.6l-4.3-2.2c-10.5-4.3-22.3-2.8-31.2 3.8l-3.7 3.1-128 128zm23 22.7c.1-.3 .3-.7 .7-1.1l126.9-126.9 0 256-127.7-127.7c0-.1 .1-.2 .1-.2z" />
      )}
      {variant === "sharp-duotone-light" && (
        <>
          <path opacity=".4" d="M72.4 256L192 361.2 192 150.8 72.4 256z" />
          <path d="M224 432L224 80 24 256 224 432zM192 150.8L192 361.2 72.4 256 192 150.8z" />
        </>
      )}
      {variant === "sharp-light" && (
        <path d="M224 432L224 80 24 256 224 432zM192 150.8L192 361.2 72.4 256 192 150.8z" />
      )}
      {variant === "classic-regular" && (
        <path d="M9.7 233.4c-11.6 12.9-12.8 32.4 0 45.2l128 128c9.1 9.2 22.9 11.9 34.9 6.9l4.3-2.2c9.5-5.7 15.5-16.1 15.5-27.4l0-256-.3-4.8c-1.4-9.4-7-17.7-15.1-22.6l-4.3-2.2c-12-4.9-25.7-2.2-34.9 6.9l-128 128zm134.6-66.8l0 178.8-89.4-89.4 89.4-89.4z" />
      )}
      {variant === "duotone-regular" && (
        <>
          <path opacity=".4" d="M54.9 256l89.4 89.4 0-178.8-89.4 89.4z" />
          <path d="M9.7 233.4c-11.6 12.9-12.8 32.4 0 45.2l128 128c9.1 9.2 22.9 11.9 34.9 6.9l4.3-2.2c9.5-5.7 15.5-16.1 15.5-27.4l0-256-.3-4.8c-1.4-9.4-7-17.7-15.1-22.6l-4.3-2.2c-12-4.9-25.7-2.2-34.9 6.9l-128 128zm134.6-66.8l0 178.8-89.4-89.4 89.4-89.4z" />
        </>
      )}
      {variant === "sharp-solid" && <path d="M224 80L24 256 224 432 224 80z" />}
      {variant === "sharp-duotone-solid" && <path opacity=".4" d="M224 80L24 256 224 432 224 80z" />}
      {variant === "sharp-regular" && (
        <path d="M224 432L224 80 24 256 224 432zM176 186.2l0 139.6-79.3-69.8 79.3-69.8z" />
      )}
      {variant === "sharp-duotone-regular" && (
        <>
          <path opacity=".4" d="M96.7 256l79.3 69.8 0-139.6-79.3 69.8z" />
          <path d="M224 432L224 80 24 256 224 432zM176 186.2l0 139.6-79.3-69.8 79.3-69.8z" />
        </>
      )}
    </svg>
  );
}
