import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `toggle-on`, in twelve styles (Duotone Light is the default), as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ToggleOnIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="-53.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "duotone-light" && (
        <>
          <path
            opacity=".4"
            d="M32 256c0 70.7 57.3 128 128 128l256 0c70.7 0 128-57.3 128-128S486.7 128 416 128l-256 0C89.3 128 32 185.3 32 256zm480 0a96 96 0 1 1 -192 0 96 96 0 1 1 192 0z"
          />
          <path d="M160 128C89.3 128 32 185.3 32 256S89.3 384 160 384l256 0c70.7 0 128-57.3 128-128S486.7 128 416 128l-256 0zM0 256C0 167.6 71.6 96 160 96l256 0c88.4 0 160 71.6 160 160S504.4 416 416 416l-256 0C71.6 416 0 344.4 0 256zm480 0a64 64 0 1 0 -128 0 64 64 0 1 0 128 0zm-160 0a96 96 0 1 1 192 0 96 96 0 1 1 -192 0z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M0 256C0 362 86 448 192 448l192 0c106 0 192-86 192-192S490 64 384 64L192 64C86 64 0 150 0 256zm480 0a96 96 0 1 1 -192 0 96 96 0 1 1 192 0z"
          />
          <path d="M288 256a96 96 0 1 1 192 0 96 96 0 1 1 -192 0z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M192 64C86 64 0 150 0 256S86 448 192 448l192 0c106 0 192-86 192-192S490 64 384 64L192 64zm192 96a96 96 0 1 1 0 192 96 96 0 1 1 0-192z" />
      )}
      {variant === "classic-light" && (
        <path d="M160 128C89.3 128 32 185.3 32 256S89.3 384 160 384l256 0c70.7 0 128-57.3 128-128S486.7 128 416 128l-256 0zM0 256C0 167.6 71.6 96 160 96l256 0c88.4 0 160 71.6 160 160S504.4 416 416 416l-256 0C71.6 416 0 344.4 0 256zm480 0a64 64 0 1 0 -128 0 64 64 0 1 0 128 0zm-160 0a96 96 0 1 1 192 0 96 96 0 1 1 -192 0z" />
      )}
      {variant === "sharp-duotone-light" && (
        <>
          <path opacity=".4" d="M32 128l512 0 0 256-512 0 0-256zm288 32l0 192 192 0 0-192-192 0z" />
          <path d="M32 128l0 256 512 0 0-256-512 0zM0 96l576 0 0 320-576 0 0-320zm352 96l0 128 128 0 0-128-128 0zm-32-32l192 0 0 192-192 0 0-192z" />
        </>
      )}
      {variant === "sharp-light" && (
        <path d="M32 128l0 256 512 0 0-256-512 0zM0 96l576 0 0 320-576 0 0-320zm352 96l0 128 128 0 0-128-128 0zm-32-32l192 0 0 192-192 0 0-192z" />
      )}
      {variant === "classic-regular" && (
        <path d="M192 112c-79.5 0-144 64.5-144 144s64.5 144 144 144l192 0c79.5 0 144-64.5 144-144S463.5 112 384 112l-192 0zM0 256C0 150 86 64 192 64l192 0c106 0 192 86 192 192S490 448 384 448l-192 0C86 448 0 362 0 256zm384-96a96 96 0 1 1 0 192 96 96 0 1 1 0-192z" />
      )}
      {variant === "duotone-regular" && (
        <>
          <path
            opacity=".4"
            d="M48 256c0 79.5 64.5 144 144 144l192 0c79.5 0 144-64.5 144-144S463.5 112 384 112l-192 0c-79.5 0-144 64.5-144 144zm432 0a96 96 0 1 1 -192 0 96 96 0 1 1 192 0z"
          />
          <path d="M192 112c-79.5 0-144 64.5-144 144s64.5 144 144 144l192 0c79.5 0 144-64.5 144-144S463.5 112 384 112l-192 0zM0 256C0 150 86 64 192 64l192 0c106 0 192 86 192 192S490 448 384 448l-192 0C86 448 0 362 0 256zm384-96a96 96 0 1 1 0 192 96 96 0 1 1 0-192z" />
        </>
      )}
      {variant === "sharp-solid" && <path d="M576 64l-576 0 0 384 576 0 0-384zm-96 96l0 192-192 0 0-192 192 0z" />}
      {variant === "sharp-duotone-solid" && (
        <>
          <path opacity=".4" d="M0 64l0 384 576 0 0-384-576 0zm288 96l192 0 0 192-192 0 0-192z" />
          <path d="M480 160l-192 0 0 192 192 0 0-192z" />
        </>
      )}
      {variant === "sharp-regular" && (
        <path d="M48 112l0 288 480 0 0-288-480 0zM0 64l576 0 0 384-576 0 0-384zm480 96l0 192-192 0 0-192 192 0z" />
      )}
      {variant === "sharp-duotone-regular" && (
        <>
          <path opacity=".4" d="M48 112l480 0 0 288-480 0 0-288zm240 48l0 192 192 0 0-192-192 0z" />
          <path d="M48 112l0 288 480 0 0-288-480 0zM0 64l576 0 0 384-576 0 0-384zm480 96l0 192-192 0 0-192 192 0z" />
        </>
      )}
    </svg>
  );
}
