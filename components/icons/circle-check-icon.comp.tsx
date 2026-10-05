import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * A tick in a ring. In Duotone Light, one line of what a plan includes, on the
 * site; in Duotone Solid, what is done (a finished chapter, a learned lesson),
 * which has to read filled next to the empty ring of what is not. Font
 * Awesome's `circle-check`, in Duotone Light (the default), Duotone Solid,
 * Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function CircleCheckIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 512 512" width="18" height="18" fill="currentColor" aria-hidden="true">
      {variant === "duotone-light" && (
        <>
          <path
            opacity=".4"
            d="M32 256a224 224 0 1 0 448 0 224 224 0 1 0 -448 0zm116.7 20.7c6.2-6.2 16.4-6.2 22.6 0l50.7 50.7 117-160.8c5.2-7.1 15.2-8.7 22.3-3.5s8.7 15.2 3.5 22.3l-128 176c-2.8 3.8-7 6.2-11.7 6.5s-9.3-1.3-12.6-4.6l-64-64c-6.2-6.2-6.2-16.4 0-22.6z"
          />
          <path d="M256 512a256 256 0 1 1 0-512 256 256 0 1 1 0 512zm0-480a224 224 0 1 0 0 448 224 224 0 1 0 0-448zm83.1 134.6c5.2-7.1 15.2-8.7 22.3-3.5s8.7 15.2 3.5 22.3l-128 176c-2.8 3.8-7 6.2-11.7 6.5s-9.3-1.3-12.6-4.6l-64-64c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0l50.7 50.7 117-160.8z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M0 256a256 256 0 1 0 512 0 256 256 0 1 0 -512 0zm135.1 7.1c9.4-9.4 24.6-9.4 33.9 0L221.1 315.2 340.5 151c7.8-10.7 22.8-13.1 33.5-5.3s13.1 22.8 5.3 33.5L243.4 366.1c-4.1 5.7-10.5 9.3-17.5 9.8s-13.9-2-18.8-7l-72-72c-9.4-9.4-9.4-24.6 0-33.9z"
          />
          <path d="M340.5 151c7.8-10.7 22.8-13.1 33.5-5.3s13.1 22.8 5.3 33.5L243.4 366.1c-4.1 5.7-10.5 9.3-17.5 9.8s-13.9-2-18.8-7l-72-72c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0L221.1 315.2 340.5 151z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M256 512a256 256 0 1 1 0-512 256 256 0 1 1 0 512zM374 145.7c-10.7-7.8-25.7-5.4-33.5 5.3L221.1 315.2 169 263.1c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l72 72c5 5 11.8 7.5 18.8 7s13.4-4.1 17.5-9.8L379.3 179.2c7.8-10.7 5.4-25.7-5.3-33.5z" />
      )}
      {variant === "classic-light" && (
        <path d="M256 512a256 256 0 1 1 0-512 256 256 0 1 1 0 512zm0-480a224 224 0 1 0 0 448 224 224 0 1 0 0-448zm83.1 134.6c5.2-7.1 15.2-8.7 22.3-3.5s8.7 15.2 3.5 22.3l-128 176c-2.8 3.8-7 6.2-11.7 6.5s-9.3-1.3-12.6-4.6l-64-64c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0l50.7 50.7 117-160.8z" />
      )}
    </svg>
  );
}
