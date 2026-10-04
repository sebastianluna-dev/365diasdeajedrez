import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `circle-left`, in Duotone Light (the default), Duotone Solid
 * or Classic Solid, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function CircleLeftIcon({ className, variant = "duotone-light" }: IconProps) {
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
            d="M32 256a224 224 0 1 0 448 0 224 224 0 1 0 -448 0zm95-17L231 135c6.9-6.9 17.2-8.9 26.2-5.2S272 142.3 272 152l0 40 72 0c22.1 0 40 17.9 40 40l0 48c0 22.1-17.9 40-40 40l-72 0 0 40c0 9.7-5.8 18.5-14.8 22.2s-19.3 1.7-26.2-5.2L127 273c-9.4-9.4-9.4-24.6 0-33.9z"
          />
          <path d="M32 256a224 224 0 1 1 448 0 224 224 0 1 1 -448 0zm480 0a256 256 0 1 0 -512 0 256 256 0 1 0 512 0zM240 340.7L155.3 256 240 171.3 240 208c0 8.8 7.2 16 16 16l88 0c4.4 0 8 3.6 8 8l0 48c0 4.4-3.6 8-8 8l-88 0c-8.8 0-16 7.2-16 16l0 36.7zM231 135L127 239c-9.4 9.4-9.4 24.6 0 33.9L231 377c6.9 6.9 17.2 8.9 26.2 5.2S272 369.7 272 360l0-40 72 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-72 0 0-40c0-9.7-5.8-18.5-14.8-22.2s-19.3-1.7-26.2 5.2z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M0 256a256 256 0 1 0 512 0 256 256 0 1 0 -512 0zm124.7-11.3l104-104c4.6-4.6 11.5-5.9 17.4-3.5s9.9 8.3 9.9 14.8l0 56 96 0c17.7 0 32 14.3 32 32l0 32c0 17.7-14.3 32-32 32l-96 0 0 56c0 6.5-3.9 12.3-9.9 14.8s-12.9 1.1-17.4-3.5l-104-104c-6.2-6.2-6.2-16.4 0-22.6z"
          />
          <path d="M124.7 267.3c-6.2-6.2-6.2-16.4 0-22.6l104-104c4.6-4.6 11.5-5.9 17.4-3.5s9.9 8.3 9.9 14.8l0 56 96 0c17.7 0 32 14.3 32 32l0 32c0 17.7-14.3 32-32 32l-96 0 0 56c0 6.5-3.9 12.3-9.9 14.8s-12.9 1.1-17.4-3.5l-104-104z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M512 256a256 256 0 1 0 -512 0 256 256 0 1 0 512 0zM124.7 244.7l104-104c4.6-4.6 11.5-5.9 17.4-3.5s9.9 8.3 9.9 14.8l0 56 96 0c17.7 0 32 14.3 32 32l0 32c0 17.7-14.3 32-32 32l-96 0 0 56c0 6.5-3.9 12.3-9.9 14.8s-12.9 1.1-17.4-3.5l-104-104c-6.2-6.2-6.2-16.4 0-22.6z" />
      )}
    </svg>
  );
}
