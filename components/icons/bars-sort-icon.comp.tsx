import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `bars-sort`, in twelve styles (Duotone Light is the default), as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function BarsSortIcon({ className, variant = "duotone-light" }: IconProps) {
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
        <path d="M0 80c0-8.8 7.2-16 16-16l416 0c8.8 0 16 7.2 16 16s-7.2 16-16 16L16 96C7.2 96 0 88.8 0 80zM0 256c0-8.8 7.2-16 16-16l288 0c8.8 0 16 7.2 16 16s-7.2 16-16 16L16 272c-8.8 0-16-7.2-16-16zM192 432c0 8.8-7.2 16-16 16L16 448c-8.8 0-16-7.2-16-16s7.2-16 16-16l160 0c8.8 0 16 7.2 16 16z" />
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M0 256c0-17.7 14.3-32 32-32l256 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 288c-17.7 0-32-14.3-32-32z"
          />
          <path d="M448 96c0-17.7-14.3-32-32-32L32 64C14.3 64 0 78.3 0 96s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32zM192 416c0-17.7-14.3-32-32-32L32 384c-17.7 0-32 14.3-32 32s14.3 32 32 32l128 0c17.7 0 32-14.3 32-32z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M0 96C0 78.3 14.3 64 32 64l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 128C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32l256 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 288c-17.7 0-32-14.3-32-32zM192 416c0 17.7-14.3 32-32 32L32 448c-17.7 0-32-14.3-32-32s14.3-32 32-32l128 0c17.7 0 32 14.3 32 32z" />
      )}
      {variant === "classic-light" && (
        <path d="M0 80c0-8.8 7.2-16 16-16l416 0c8.8 0 16 7.2 16 16s-7.2 16-16 16L16 96C7.2 96 0 88.8 0 80zM0 256c0-8.8 7.2-16 16-16l288 0c8.8 0 16 7.2 16 16s-7.2 16-16 16L16 272c-8.8 0-16-7.2-16-16zM192 432c0 8.8-7.2 16-16 16L16 448c-8.8 0-16-7.2-16-16s7.2-16 16-16l160 0c8.8 0 16 7.2 16 16z" />
      )}
      {variant === "sharp-duotone-light" && (
        <path d="M0 64l448 0 0 32-448 0 0-32zM0 240l320 0 0 32-320 0 0-32zM192 416l0 32-192 0 0-32 192 0z" />
      )}
      {variant === "sharp-light" && (
        <path d="M0 64l448 0 0 32-448 0 0-32zM0 240l320 0 0 32-320 0 0-32zM192 416l0 32-192 0 0-32 192 0z" />
      )}
      {variant === "classic-regular" && (
        <path d="M0 88C0 74.7 10.7 64 24 64l400 0c13.3 0 24 10.7 24 24s-10.7 24-24 24L24 112C10.7 112 0 101.3 0 88zM0 256c0-13.3 10.7-24 24-24l272 0c13.3 0 24 10.7 24 24s-10.7 24-24 24L24 280c-13.3 0-24-10.7-24-24zM192 424c0 13.3-10.7 24-24 24L24 448c-13.3 0-24-10.7-24-24s10.7-24 24-24l144 0c13.3 0 24 10.7 24 24z" />
      )}
      {variant === "duotone-regular" && (
        <path d="M0 88C0 74.7 10.7 64 24 64l400 0c13.3 0 24 10.7 24 24s-10.7 24-24 24L24 112C10.7 112 0 101.3 0 88zM0 256c0-13.3 10.7-24 24-24l272 0c13.3 0 24 10.7 24 24s-10.7 24-24 24L24 280c-13.3 0-24-10.7-24-24zM192 424c0 13.3-10.7 24-24 24L24 448c-13.3 0-24-10.7-24-24s10.7-24 24-24l144 0c13.3 0 24 10.7 24 24z" />
      )}
      {variant === "sharp-solid" && (
        <path d="M0 64l448 0 0 64-448 0 0-64zM0 224l320 0 0 64-320 0 0-64zM192 384l0 64-192 0 0-64 192 0z" />
      )}
      {variant === "sharp-duotone-solid" && (
        <>
          <path opacity=".4" d="M0 224l0 64 320 0 0-64-320 0z" />
          <path d="M448 64l-448 0 0 64 448 0 0-64zM192 384l-192 0 0 64 192 0 0-64z" />
        </>
      )}
      {variant === "sharp-regular" && (
        <path d="M0 64l448 0 0 48-448 0 0-48zM0 232l320 0 0 48-320 0 0-48zM192 400l0 48-192 0 0-48 192 0z" />
      )}
      {variant === "sharp-duotone-regular" && (
        <path d="M0 64l448 0 0 48-448 0 0-48zM0 232l320 0 0 48-320 0 0-48zM192 400l0 48-192 0 0-48 192 0z" />
      )}
    </svg>
  );
}
