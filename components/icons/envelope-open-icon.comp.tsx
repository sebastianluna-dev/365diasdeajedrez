import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `envelope-open`, in Duotone Light (the default), Duotone
 * Solid or Classic Solid, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function EnvelopeOpenIcon({ className, variant = "duotone-light" }: IconProps) {
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
            d="M32 200.4L32 424c0 13.3 10.7 24 23.9 24l400.2 0c13.2 0 23.9-10.7 23.9-24l0-223.6-175.3 134.4c-28.7 22-68.6 22-97.3 0L32 200.4z"
          />
          <path d="M512 424c0 30.9-24.9 56-55.9 56L55.9 480C24.9 480 0 454.9 0 424L0 152c.2-15.5 8.1-29.9 21-38.5L211.6-13.6c26.9-17.9 61.9-17.9 88.8 0L491 113.5c12.9 8.6 20.8 23 21 38.5l0 272zM55.9 448l400.2 0c13.2 0 23.9-10.7 23.9-24l0-223.6-175.3 134.4c-28.7 22-68.6 22-97.3 0L32 200.4 32 424c0 13.3 10.7 24 23.9 24zM480 152.6c0-5.1-2.5-9.8-6.7-12.6L282.6 13c-16.1-10.7-37.1-10.7-53.3 0L38.7 140.1c-4.2 2.8-6.7 7.5-6.7 12.6 0 4.7 2.2 9.1 5.9 12L226.8 309.4c17.2 13.2 41.2 13.2 58.4 0L474.1 164.6c3.7-2.9 5.9-7.3 5.9-12z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M64.4 175.8L256 33.9 447.6 175.8 289.5 293c-9.7 7.2-21.4 11-33.5 11s-23.8-3.9-33.5-11L64.4 175.8z"
          />
          <path d="M64.4 175.8L256 33.9 447.6 175.8 289.5 293c-9.7 7.2-21.4 11-33.5 11s-23.8-3.9-33.5-11L64.4 175.8zM256-32c-12.1 0-23.8 3.9-33.5 11L25.9 124.7C9.6 136.8 0 155.8 0 176.1L0 416c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-239.9c0-20.3-9.6-39.4-25.9-51.4L289.5-21c-9.7-7.2-21.4-11-33.5-11z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M64.4 175.8L256 33.9 447.6 175.8 289.5 293c-9.7 7.2-21.4 11-33.5 11s-23.8-3.9-33.5-11L64.4 175.8zM256-32c-12.1 0-23.8 3.9-33.5 11L25.9 124.7C9.6 136.8 0 155.8 0 176.1L0 416c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-239.9c0-20.3-9.6-39.4-25.9-51.4L289.5-21c-9.7-7.2-21.4-11-33.5-11z" />
      )}
    </svg>
  );
}
