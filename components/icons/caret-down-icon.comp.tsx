import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `caret-down`, in twelve styles (Duotone Light is the default), as `variant` says. Its Duotone Solid drawing
 * is a single layer, drawn at full strength: at 40 % it would read as switched
 * off.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function CaretDownIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox={
        {
          "duotone-light": "-181.33 -85.33 682.67 682.67",
          "duotone-solid": "-181.33 -85.33 682.67 682.67",
          "classic-solid": "-181.33 -85.33 682.67 682.67",
          "classic-light": "-181.33 -85.33 682.67 682.67",
          "sharp-duotone-light": "-149.33 -85.33 682.67 682.67",
          "sharp-light": "-149.33 -85.33 682.67 682.67",
          "classic-regular": "-181.33 -85.33 682.67 682.67",
          "duotone-regular": "-181.33 -85.33 682.67 682.67",
          "sharp-solid": "-149.33 -85.33 682.67 682.67",
          "sharp-duotone-solid": "-149.33 -85.33 682.67 682.67",
          "sharp-regular": "-149.33 -85.33 682.67 682.67",
          "sharp-duotone-regular": "-149.33 -85.33 682.67 682.67",
        }[variant]
      }
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "duotone-light" && (
        <>
          <path opacity=".4" d="M32.5 224L159.4 350.9c.4 .3 .8 .6 1.1 .7 42.8-42.5 85.4-85 128-127.6l-256 0z" />
          <path d="M137.9 374.6c12.9 11.6 32.4 12.8 45.2 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9l-2.2-4.3c-5.7-9.5-16.1-15.5-27.4-15.5l-256 0-4.8 .3c-9.4 1.4-17.7 7-22.6 15.1l-2.2 4.3C-1.4 222.2 .2 234 6.7 243l3.1 3.7 128 128zm22.7-23c-.3-.1-.7-.3-1.1-.7L32.5 224 288.5 224 160.8 351.7c-.1 0-.2-.1-.2-.1z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <path d="M140.3 376.8c12.6 10.2 31.1 9.5 42.8-2.2l128-128c9.2-9.2 11.9-22.9 6.9-34.9S301.4 192 288.5 192l-256 0c-12.9 0-24.6 7.8-29.6 19.8S.7 237.5 9.9 246.6l128 128 2.4 2.2z" />
      )}
      {variant === "classic-solid" && (
        <path d="M140.3 376.8c12.6 10.2 31.1 9.5 42.8-2.2l128-128c9.2-9.2 11.9-22.9 6.9-34.9S301.4 192 288.5 192l-256 0c-12.9 0-24.6 7.8-29.6 19.8S.7 237.5 9.9 246.6l128 128 2.4 2.2z" />
      )}
      {variant === "classic-light" && (
        <path d="M137.9 374.6c12.9 11.6 32.4 12.8 45.2 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9l-2.2-4.3c-5.7-9.5-16.1-15.5-27.4-15.5l-256 0-4.8 .3c-9.4 1.4-17.7 7-22.6 15.1l-2.2 4.3C-1.4 222.2 .2 234 6.7 243l3.1 3.7 128 128zm22.7-23c-.3-.1-.7-.3-1.1-.7L32.5 224 288.5 224 160.8 351.7c-.1 0-.2-.1-.2-.1z" />
      )}
      {variant === "sharp-duotone-light" && (
        <>
          <path opacity=".4" d="M86.8 224L297.2 224 192 343.6 86.8 224z" />
          <path d="M368 192L16 192 192 392 368 192zM86.8 224L297.2 224 192 343.6 86.8 224z" />
        </>
      )}
      {variant === "sharp-light" && (
        <path d="M368 192L16 192 192 392 368 192zM86.8 224L297.2 224 192 343.6 86.8 224z" />
      )}
      {variant === "classic-regular" && (
        <path d="M137.9 374.6c12.9 11.6 32.4 12.8 45.2 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9l-2.2-4.3c-5.7-9.5-16.1-15.5-27.4-15.5l-256 0-4.8 .3c-9.4 1.4-17.7 7-22.6 15.1l-2.2 4.3c-4.9 12-2.2 25.7 6.9 34.9l128 128zM71.1 240l178.8 0-89.4 89.4-89.4-89.4z" />
      )}
      {variant === "duotone-regular" && (
        <>
          <path opacity=".4" d="M71.1 240l178.8 0-89.4 89.4-89.4-89.4z" />
          <path d="M137.9 374.6c12.9 11.6 32.4 12.8 45.2 0l128-128c9.2-9.2 11.9-22.9 6.9-34.9l-2.2-4.3c-5.7-9.5-16.1-15.5-27.4-15.5l-256 0-4.8 .3c-9.4 1.4-17.7 7-22.6 15.1l-2.2 4.3c-4.9 12-2.2 25.7 6.9 34.9l128 128zM71.1 240l178.8 0-89.4 89.4-89.4-89.4z" />
        </>
      )}
      {variant === "sharp-solid" && <path d="M16 192l176 200 176-200-352 0z" />}
      {variant === "sharp-duotone-solid" && <path opacity=".4" d="M16 192l176 200 176-200-352 0z" />}
      {variant === "sharp-regular" && (
        <path d="M368 192L16 192 192 392 368 192zM122.2 240l139.6 0-69.8 79.3-69.8-79.3z" />
      )}
      {variant === "sharp-duotone-regular" && (
        <>
          <path opacity=".4" d="M122.2 240l139.6 0-69.8 79.3-69.8-79.3z" />
          <path d="M368 192L16 192 192 392 368 192zM122.2 240l139.6 0-69.8 79.3-69.8-79.3z" />
        </>
      )}
    </svg>
  );
}
