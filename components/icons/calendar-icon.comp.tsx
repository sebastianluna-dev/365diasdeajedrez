import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * The date picker's field. Font Awesome's `calendar`, in Duotone Light (the
 * default), Duotone Solid, Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function CalendarIcon({ className, variant = "duotone-light" }: IconProps) {
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
          <path opacity=".4" d="M32 192l0 224c0 17.7 14.3 32 32 32l320 0c17.7 0 32-14.3 32-32l0-224-384 0z" />
          <path d="M112 0c8.8 0 16 7.2 16 16l0 48 192 0 0-48c0-8.8 7.2-16 16-16s16 7.2 16 16l0 48 32 0c35.3 0 64 28.7 64 64l0 288c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 128C0 92.7 28.7 64 64 64l32 0 0-48c0-8.8 7.2-16 16-16zM384 96L64 96c-17.7 0-32 14.3-32 32l0 32 384 0 0-32c0-17.7-14.3-32-32-32zm32 96l-384 0 0 224c0 17.7 14.3 32 32 32l320 0c17.7 0 32-14.3 32-32l0-224z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path opacity=".4" d="M0 160l448 0 0 272c0 26.5-21.5 48-48 48L48 480c-26.5 0-48-21.5-48-48L0 160z" />
          <path d="M160 32c0-17.7-14.3-32-32-32S96 14.3 96 32l0 32-48 0C21.5 64 0 85.5 0 112l0 48 448 0 0-48c0-26.5-21.5-48-48-48l-48 0 0-32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 32-128 0 0-32z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M128 0C110.3 0 96 14.3 96 32l0 32-32 0C28.7 64 0 92.7 0 128l0 48 448 0 0-48c0-35.3-28.7-64-64-64l-32 0 0-32c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 32-128 0 0-32c0-17.7-14.3-32-32-32zM0 224L0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-192-448 0z" />
      )}
      {variant === "classic-light" && (
        <path d="M112 0c8.8 0 16 7.2 16 16l0 48 192 0 0-48c0-8.8 7.2-16 16-16s16 7.2 16 16l0 48 32 0c35.3 0 64 28.7 64 64l0 288c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 128C0 92.7 28.7 64 64 64l32 0 0-48c0-8.8 7.2-16 16-16zM384 96L64 96c-17.7 0-32 14.3-32 32l0 32 384 0 0-32c0-17.7-14.3-32-32-32zm32 96l-384 0 0 224c0 17.7 14.3 32 32 32l320 0c17.7 0 32-14.3 32-32l0-224z" />
      )}
      {variant === "sharp-duotone-light" && (
        <>
          <path opacity=".4" d="M32 192l384 0 0 256-384 0 0-256z" />
          <path d="M128 0l0 64 192 0 0-64 32 0 0 64 96 0 0 416-448 0 0-416 96 0 0-64 32 0zM416 96l-384 0 0 64 384 0 0-64zm0 96l-384 0 0 256 384 0 0-256z" />
        </>
      )}
      {variant === "sharp-light" && (
        <path d="M128 0l0 64 192 0 0-64 32 0 0 64 96 0 0 416-448 0 0-416 96 0 0-64 32 0zM416 96l-384 0 0 64 384 0 0-64zm0 96l-384 0 0 256 384 0 0-256z" />
      )}
    </svg>
  );
}
