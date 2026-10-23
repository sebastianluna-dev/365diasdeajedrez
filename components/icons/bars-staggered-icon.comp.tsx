import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `bars-staggered`, in twelve styles (Duotone Light is the default), as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function BarsStaggeredIcon({ className, variant = "duotone-light" }: IconProps) {
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
        <path d="M0 80c0-8.8 7.2-16 16-16l416 0c8.8 0 16 7.2 16 16s-7.2 16-16 16L16 96C7.2 96 0 88.8 0 80zM64 256c0-8.8 7.2-16 16-16l416 0c8.8 0 16 7.2 16 16s-7.2 16-16 16L80 272c-8.8 0-16-7.2-16-16zM448 432c0 8.8-7.2 16-16 16L16 448c-8.8 0-16-7.2-16-16s7.2-16 16-16l416 0c8.8 0 16 7.2 16 16z" />
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M64 256c0-17.7 14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L96 288c-17.7 0-32-14.3-32-32z"
          />
          <path d="M448 96c0-17.7-14.3-32-32-32L32 64C14.3 64 0 78.3 0 96s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32zm0 320c0-17.7-14.3-32-32-32L32 384c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M0 96C0 78.3 14.3 64 32 64l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 128C14.3 128 0 113.7 0 96zM64 256c0-17.7 14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L96 288c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32L32 448c-17.7 0-32-14.3-32-32s14.3-32 32-32l384 0c17.7 0 32 14.3 32 32z" />
      )}
      {variant === "classic-light" && (
        <path d="M0 80c0-8.8 7.2-16 16-16l416 0c8.8 0 16 7.2 16 16s-7.2 16-16 16L16 96C7.2 96 0 88.8 0 80zM64 256c0-8.8 7.2-16 16-16l416 0c8.8 0 16 7.2 16 16s-7.2 16-16 16L80 272c-8.8 0-16-7.2-16-16zM448 432c0 8.8-7.2 16-16 16L16 448c-8.8 0-16-7.2-16-16s7.2-16 16-16l416 0c8.8 0 16 7.2 16 16z" />
      )}
      {variant === "sharp-duotone-light" && (
        <path d="M0 64l448 0 0 32-448 0 0-32zM64 240l448 0 0 32-448 0 0-32zM448 416l0 32-448 0 0-32 448 0z" />
      )}
      {variant === "sharp-light" && (
        <path d="M0 64l448 0 0 32-448 0 0-32zM64 240l448 0 0 32-448 0 0-32zM448 416l0 32-448 0 0-32 448 0z" />
      )}
      {variant === "classic-regular" && (
        <path d="M0 88C0 74.7 10.7 64 24 64l400 0c13.3 0 24 10.7 24 24s-10.7 24-24 24L24 112C10.7 112 0 101.3 0 88zM64 256c0-13.3 10.7-24 24-24l400 0c13.3 0 24 10.7 24 24s-10.7 24-24 24L88 280c-13.3 0-24-10.7-24-24zM448 424c0 13.3-10.7 24-24 24L24 448c-13.3 0-24-10.7-24-24s10.7-24 24-24l400 0c13.3 0 24 10.7 24 24z" />
      )}
      {variant === "duotone-regular" && (
        <path d="M0 88C0 74.7 10.7 64 24 64l400 0c13.3 0 24 10.7 24 24s-10.7 24-24 24L24 112C10.7 112 0 101.3 0 88zM64 256c0-13.3 10.7-24 24-24l400 0c13.3 0 24 10.7 24 24s-10.7 24-24 24L88 280c-13.3 0-24-10.7-24-24zM448 424c0 13.3-10.7 24-24 24L24 448c-13.3 0-24-10.7-24-24s10.7-24 24-24l400 0c13.3 0 24 10.7 24 24z" />
      )}
      {variant === "sharp-solid" && (
        <path d="M0 64l448 0 0 64-448 0 0-64zM64 224l448 0 0 64-448 0 0-64zM448 384l0 64-448 0 0-64 448 0z" />
      )}
      {variant === "sharp-duotone-solid" && (
        <>
          <path opacity=".4" d="M64 224l0 64 448 0 0-64-448 0z" />
          <path d="M448 64l-448 0 0 64 448 0 0-64zm0 320l-448 0 0 64 448 0 0-64z" />
        </>
      )}
      {variant === "sharp-regular" && (
        <path d="M0 64l448 0 0 48-448 0 0-48zM64 232l448 0 0 48-448 0 0-48zM448 400l0 48-448 0 0-48 448 0z" />
      )}
      {variant === "sharp-duotone-regular" && (
        <path d="M0 64l448 0 0 48-448 0 0-48zM64 232l448 0 0 48-448 0 0-48zM448 400l0 48-448 0 0-48 448 0z" />
      )}
    </svg>
  );
}
