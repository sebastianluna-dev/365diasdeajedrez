import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * The plus that opens an answer of the site's FAQ. Font Awesome's `plus`, in
 * Duotone Light (the default), Duotone Solid, Classic Solid or Classic Light,
 * as `variant` says. Its Duotone Solid drawing is a single layer, drawn at
 * full strength: at 40 % it would read as switched off.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function PlusIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 448 512" width="16" height="16" fill="currentColor" aria-hidden="true">
      {variant === "duotone-light" && (
        <path d="M240 48c0-8.8-7.2-16-16-16s-16 7.2-16 16l0 192-192 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l192 0 0 192c0 8.8 7.2 16 16 16s16-7.2 16-16l0-192 192 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-192 0 0-192z" />
      )}
      {variant === "duotone-solid" && (
        <path d="M256 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 160-160 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l160 0 0 160c0 17.7 14.3 32 32 32s32-14.3 32-32l0-160 160 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-160 0 0-160z" />
      )}
      {variant === "classic-solid" && (
        <path d="M256 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 160-160 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l160 0 0 160c0 17.7 14.3 32 32 32s32-14.3 32-32l0-160 160 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-160 0 0-160z" />
      )}
      {variant === "classic-light" && (
        <path d="M240 48c0-8.8-7.2-16-16-16s-16 7.2-16 16l0 192-192 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l192 0 0 192c0 8.8 7.2 16 16 16s16-7.2 16-16l0-192 192 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-192 0 0-192z" />
      )}
    </svg>
  );
}
