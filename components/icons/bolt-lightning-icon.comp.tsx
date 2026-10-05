import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `bolt-lightning`, in Duotone Light (the default), Duotone
 * Solid, Classic Solid or Classic Light, as `variant` says. Its Duotone Solid
 * drawing is a single layer, drawn at full strength: at 40 % it would read as
 * switched off.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function BoltLightningIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="-149.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "duotone-light" && (
        <>
          <path
            opacity=".4"
            d="M32.2 256L200 256c4.9 0 9.6 2.3 12.6 6.2s4.1 8.9 2.9 13.7L171.9 450.2 348.6 192 192 192c-5.1 0-10-2.5-13-6.6s-3.8-9.5-2.2-14.4L223.1 32 64 32c0 1.1-.1 2.2-.3 3.3L32.2 256z"
          />
          <path d="M32 30.9C32 13.8 45.9 0 62.9 0L226.2 0c16.4 0 29.8 13.3 29.8 29.8 0 3.2-.5 6.4-1.5 9.4L214.2 160 355.8 160c15.6 0 28.2 12.6 28.2 28.2 0 5.7-1.7 11.2-4.9 15.9l-203.2 297c-4.6 6.8-12.3 10.8-20.5 10.8-16.2 0-28-15.2-24.1-30.9L179.5 288 30.9 288c-17.1 0-30.9-13.9-30.9-30.9 0-1.5 .1-2.9 .3-4.4L32 30.9zM64 32c0 1.1-.1 2.2-.3 3.3L32.2 256 200 256c4.9 0 9.6 2.3 12.6 6.2s4.1 8.9 2.9 13.7L171.9 450.2 348.6 192 192 192c-5.1 0-10-2.5-13-6.6s-3.8-9.5-2.2-14.4L223.1 32 64 32z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <path d="M0 256L28.5 28c2-16 15.6-28 31.8-28L228.9 0c15 0 27.1 12.1 27.1 27.1 0 3.2-.6 6.5-1.7 9.5L208 160 347.3 160c20.2 0 36.7 16.4 36.7 36.7 0 7.4-2.2 14.6-6.4 20.7l-192.2 281c-5.9 8.6-15.6 13.7-25.9 13.7l-2.9 0c-15.7 0-28.5-12.8-28.5-28.5 0-2.3 .3-4.6 .9-6.9L176 288 32 288c-17.7 0-32-14.3-32-32z" />
      )}
      {variant === "classic-solid" && (
        <path d="M0 256L28.5 28c2-16 15.6-28 31.8-28L228.9 0c15 0 27.1 12.1 27.1 27.1 0 3.2-.6 6.5-1.7 9.5L208 160 347.3 160c20.2 0 36.7 16.4 36.7 36.7 0 7.4-2.2 14.6-6.4 20.7l-192.2 281c-5.9 8.6-15.6 13.7-25.9 13.7l-2.9 0c-15.7 0-28.5-12.8-28.5-28.5 0-2.3 .3-4.6 .9-6.9L176 288 32 288c-17.7 0-32-14.3-32-32z" />
      )}
      {variant === "classic-light" && (
        <path d="M32 30.9C32 13.8 45.9 0 62.9 0L226.2 0c16.4 0 29.8 13.3 29.8 29.8 0 3.2-.5 6.4-1.5 9.4L214.2 160 355.8 160c15.6 0 28.2 12.6 28.2 28.2 0 5.7-1.7 11.2-4.9 15.9l-203.2 297c-4.6 6.8-12.3 10.8-20.5 10.8-16.2 0-28-15.2-24.1-30.9L179.5 288 30.9 288c-17.1 0-30.9-13.9-30.9-30.9 0-1.5 .1-2.9 .3-4.4L32 30.9zM64 32c0 1.1-.1 2.2-.3 3.3L32.2 256 200 256c4.9 0 9.6 2.3 12.6 6.2s4.1 8.9 2.9 13.7L171.9 450.2 348.6 192 192 192c-5.1 0-10-2.5-13-6.6s-3.8-9.5-2.2-14.4L223.1 32 64 32z" />
      )}
    </svg>
  );
}
