import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `caret-up`, in twelve styles (Duotone Light is the default), as `variant` says. Its Duotone Solid drawing
 * is a single layer, drawn at full strength: at 40 % it would read as switched
 * off.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function CaretUpIcon({ className, variant = "duotone-light" }: IconProps) {
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
          <path
            opacity=".4"
            d="M16.5 288l144-144 144 144-16 16-256 0-16-16zm16 0l256 0c-42.6-42.6-85.1-85.2-128-127.6-.3 .1-.7 .3-1.1 .7L32.5 288z"
          />
          <path d="M137.9 137.4c12.9-11.6 32.4-12.8 45.2 0l128 128c9.2 9.2 11.9 22.9 6.9 34.9l-2.2 4.3c-5.7 9.5-16.1 15.5-27.4 15.5l-256 0-4.8-.3c-9.4-1.4-17.7-7-22.6-15.1l-2.2-4.3C-1.4 289.8 .2 277.9 6.7 269l3.1-3.7 128-128zm22.7 23c-.3 .1-.7 .3-1.1 .7L32.5 288 288.5 288 160.8 160.3c-.1 0-.2 .1-.2 .1z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <path d="M140.3 135.2c12.6-10.3 31.1-9.5 42.8 2.2l128 128c9.2 9.2 11.9 22.9 6.9 34.9S301.4 320 288.5 320l-256 0c-12.9 0-24.6-7.8-29.6-19.8S.7 274.5 9.9 265.4l128-128 2.4-2.2z" />
      )}
      {variant === "classic-solid" && (
        <path d="M140.3 135.2c12.6-10.3 31.1-9.5 42.8 2.2l128 128c9.2 9.2 11.9 22.9 6.9 34.9S301.4 320 288.5 320l-256 0c-12.9 0-24.6-7.8-29.6-19.8S.7 274.5 9.9 265.4l128-128 2.4-2.2z" />
      )}
      {variant === "classic-light" && (
        <path d="M137.9 137.4c12.9-11.6 32.4-12.8 45.2 0l128 128c9.2 9.2 11.9 22.9 6.9 34.9l-2.2 4.3c-5.7 9.5-16.1 15.5-27.4 15.5l-256 0-4.8-.3c-9.4-1.4-17.7-7-22.6-15.1l-2.2-4.3C-1.4 289.8 .2 277.9 6.7 269l3.1-3.7 128-128zm22.7 23c-.3 .1-.7 .3-1.1 .7L32.5 288 288.5 288 160.8 160.3c-.1 0-.2 .1-.2 .1z" />
      )}
      {variant === "sharp-duotone-light" && (
        <>
          <path opacity=".4" d="M86.8 288L192 168.4 297.2 288 86.8 288z" />
          <path d="M368 320L16 320 192 120 368 320zM86.8 288L297.2 288 192 168.4 86.8 288z" />
        </>
      )}
      {variant === "sharp-light" && (
        <path d="M368 320L16 320 192 120 368 320zM86.8 288L297.2 288 192 168.4 86.8 288z" />
      )}
      {variant === "classic-regular" && (
        <path d="M137.9 137.4c12.9-11.6 32.4-12.8 45.2 0l128 128c9.2 9.2 11.9 22.9 6.9 34.9l-2.2 4.3c-5.7 9.5-16.1 15.5-27.4 15.5l-256 0-4.8-.3c-9.4-1.4-17.7-7-22.6-15.1l-2.2-4.3c-4.9-12-2.2-25.7 6.9-34.9l128-128zM71.1 272l178.8 0-89.4-89.4-89.4 89.4z" />
      )}
      {variant === "duotone-regular" && (
        <>
          <path opacity=".4" d="M71.1 272l89.4-89.4 89.4 89.4-178.8 0z" />
          <path d="M137.9 137.4c12.9-11.6 32.4-12.8 45.2 0l128 128c9.2 9.2 11.9 22.9 6.9 34.9l-2.2 4.3c-5.7 9.5-16.1 15.5-27.4 15.5l-256 0-4.8-.3c-9.4-1.4-17.7-7-22.6-15.1l-2.2-4.3c-4.9-12-2.2-25.7 6.9-34.9l128-128zM71.1 272l178.8 0-89.4-89.4-89.4 89.4z" />
        </>
      )}
      {variant === "sharp-solid" && <path d="M16 320l176-200 176 200-352 0z" />}
      {variant === "sharp-duotone-solid" && <path opacity=".4" d="M16 320l176-200 176 200-352 0z" />}
      {variant === "sharp-regular" && (
        <path d="M368 320L16 320 192 120 368 320zM122.2 272l139.6 0-69.8-79.3-69.8 79.3z" />
      )}
      {variant === "sharp-duotone-regular" && (
        <>
          <path opacity=".4" d="M122.2 272l69.8-79.3 69.8 79.3-139.6 0z" />
          <path d="M368 320L16 320 192 120 368 320zM122.2 272l139.6 0-69.8-79.3-69.8 79.3z" />
        </>
      )}
    </svg>
  );
}
