import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * The tick of what is chosen: the select, the check cards, the checkbox, the
 * confirmation's acknowledgement and the move menu. Font Awesome's `check`, in twelve styles (Duotone Light is the default), as `variant` says.
 * Its Duotone Solid drawing is a single layer, drawn at full strength: at 40 %
 * it would read as switched off.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function CheckIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox={
        {
          "duotone-light": "-117.33 -85.33 682.67 682.67",
          "duotone-solid": "-117.33 -85.33 682.67 682.67",
          "classic-solid": "-117.33 -85.33 682.67 682.67",
          "classic-light": "-117.33 -85.33 682.67 682.67",
          "sharp-duotone-light": "-117.33 -85.33 682.67 682.67",
          "sharp-light": "-117.33 -85.33 682.67 682.67",
          "classic-regular": "-117.33 -85.33 682.67 682.67",
          "duotone-regular": "-117.33 -85.33 682.67 682.67",
          "sharp-solid": "-85.33 -85.33 682.67 682.67",
          "sharp-duotone-solid": "-85.33 -85.33 682.67 682.67",
          "sharp-regular": "-85.33 -85.33 682.67 682.67",
          "sharp-duotone-regular": "-85.33 -85.33 682.67 682.67",
        }[variant]
      }
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "duotone-light" && (
        <path d="M441.4 67.1c7.1 5.2 8.7 15.2 3.5 22.4l-280 384c-2.8 3.8-7 6.2-11.7 6.5s-9.2-1.3-12.6-4.6l-136-136c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0l122.8 122.8 269-368.9c5.2-7.1 15.2-8.7 22.4-3.5z" />
      )}
      {variant === "duotone-solid" && (
        <path d="M434.8 70.1c14.3 10.4 17.5 30.4 7.1 44.7l-256 352c-5.5 7.6-14 12.3-23.4 13.1s-18.5-2.7-25.1-9.3l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l101.5 101.5 234-321.7c10.4-14.3 30.4-17.5 44.7-7.1z" />
      )}
      {variant === "classic-solid" && (
        <path d="M434.8 70.1c14.3 10.4 17.5 30.4 7.1 44.7l-256 352c-5.5 7.6-14 12.3-23.4 13.1s-18.5-2.7-25.1-9.3l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l101.5 101.5 234-321.7c10.4-14.3 30.4-17.5 44.7-7.1z" />
      )}
      {variant === "classic-light" && (
        <path d="M441.4 67.1c7.1 5.2 8.7 15.2 3.5 22.4l-280 384c-2.8 3.8-7 6.2-11.7 6.5s-9.2-1.3-12.6-4.6l-136-136c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0l122.8 122.8 269-368.9c5.2-7.1 15.2-8.7 22.4-3.5z" />
      )}
      {variant === "sharp-duotone-light" && (
        <path d="M454.5 76.5l-9.4 12.9-280 384-11 15.1-13.2-13.2-136-136-11.3-11.3 22.6-22.6 11.3 11.3 122.8 122.8 269-368.9 9.4-12.9 25.9 18.9z" />
      )}
      {variant === "sharp-light" && (
        <path d="M454.5 76.5l-9.4 12.9-280 384-11 15.1-13.2-13.2-136-136-11.3-11.3 22.6-22.6 11.3 11.3 122.8 122.8 269-368.9 9.4-12.9 25.9 18.9z" />
      )}
      {variant === "classic-regular" && (
        <path d="M438 68.5c10.8 7.7 13.2 22.7 5.5 33.5l-264 368c-4.1 5.7-10.5 9.4-17.5 9.9S148 478 143 473L7 337c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0L157 419 404.5 74c7.7-10.8 22.7-13.2 33.5-5.5z" />
      )}
      {variant === "duotone-regular" && (
        <path d="M438 68.5c10.8 7.7 13.2 22.7 5.5 33.5l-264 368c-4.1 5.7-10.5 9.4-17.5 9.9S148 478 143 473L7 337c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0L157 419 404.5 74c7.7-10.8 22.7-13.2 33.5-5.5z" />
      )}
      {variant === "sharp-solid" && (
        <path d="M493 88.9l-18.8 25.9-256 352-22 30.3c-.7-.7-52.2-52.2-154.5-154.5L19 320 64.3 274.7c1.9 1.9 43.3 43.3 124.1 124.1l234-321.7 18.8-25.9 51.8 37.6z" />
      )}
      {variant === "sharp-duotone-solid" && (
        <path
          opacity=".4"
          d="M493 88.9l-18.8 25.9-256 352-22 30.3c-.7-.7-52.2-52.2-154.5-154.5L19 320 64.3 274.7c1.9 1.9 43.3 43.3 124.1 124.1l234-321.7 18.8-25.9 51.8 37.6z"
        />
      )}
      {variant === "sharp-regular" && (
        <path d="M489.9 82.5l-14 19.5-264 368-16.5 23-20-20-136-136-17-17 33.9-33.9 17 17 116 116 247.5-345 14-19.5 39 28z" />
      )}
      {variant === "sharp-duotone-regular" && (
        <path d="M489.9 82.5l-14 19.5-264 368-16.5 23-20-20-136-136-17-17 33.9-33.9 17 17 116 116 247.5-345 14-19.5 39 28z" />
      )}
    </svg>
  );
}
