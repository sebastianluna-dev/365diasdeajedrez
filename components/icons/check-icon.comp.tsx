import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * The tick of what is chosen: the select, the check cards, the move menu and
 * the lesson outline's filter. Font Awesome's `check`, in Duotone Light (the
 * default), Duotone Solid or Classic Solid, as `variant` says. Its Duotone
 * Solid drawing is a single layer, drawn at full strength: at 40 % it would
 * read as switched off.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function CheckIcon({ className, variant = "duotone-light" }: IconProps) {
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
        <path d="M441.4 67.1c7.1 5.2 8.7 15.2 3.5 22.4l-280 384c-2.8 3.8-7 6.2-11.7 6.5s-9.2-1.3-12.6-4.6l-136-136c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0l122.8 122.8 269-368.9c5.2-7.1 15.2-8.7 22.4-3.5z" />
      )}
      {variant === "duotone-solid" && (
        <path d="M434.8 70.1c14.3 10.4 17.5 30.4 7.1 44.7l-256 352c-5.5 7.6-14 12.3-23.4 13.1s-18.5-2.7-25.1-9.3l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l101.5 101.5 234-321.7c10.4-14.3 30.4-17.5 44.7-7.1z" />
      )}
      {variant === "classic-solid" && (
        <path d="M434.8 70.1c14.3 10.4 17.5 30.4 7.1 44.7l-256 352c-5.5 7.6-14 12.3-23.4 13.1s-18.5-2.7-25.1-9.3l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l101.5 101.5 234-321.7c10.4-14.3 30.4-17.5 44.7-7.1z" />
      )}
    </svg>
  );
}
