import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `clone`, in Duotone Light (the default), Duotone Solid or
 * Classic Solid, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function CloneIcon({ className, variant = "duotone-light" }: IconProps) {
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
            d="M192 64l0 224c0 17.7 14.3 32 32 32l224 0c17.7 0 32-14.3 32-32l0-224c0-17.7-14.3-32-32-32L224 32c-17.7 0-32 14.3-32 32z"
          />
          <path d="M288 480L64 480c-17.7 0-32-14.3-32-32l0-224c0-17.7 14.3-32 32-32l48 0 0-32-48 0c-35.3 0-64 28.7-64 64L0 448c0 35.3 28.7 64 64 64l224 0c35.3 0 64-28.7 64-64l0-48-32 0 0 48c0 17.7-14.3 32-32 32zM224 320c-17.7 0-32-14.3-32-32l0-224c0-17.7 14.3-32 32-32l224 0c17.7 0 32 14.3 32 32l0 224c0 17.7-14.3 32-32 32l-224 0zm-64-32c0 35.3 28.7 64 64 64l224 0c35.3 0 64-28.7 64-64l0-224c0-35.3-28.7-64-64-64L224 0c-35.3 0-64 28.7-64 64l0 224z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M0 224L0 448c0 35.3 28.7 64 64 64l224 0c35.3 0 64-28.7 64-64l0-96-64 0 0 96-224 0 0-224 96 0 0-64-96 0c-35.3 0-64 28.7-64 64z"
          />
          <path d="M224 352l224 0c35.3 0 64-28.7 64-64l0-224c0-35.3-28.7-64-64-64L224 0c-35.3 0-64 28.7-64 64l0 224c0 35.3 28.7 64 64 64z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M288 448l-224 0 0-224 48 0 0-64-48 0c-35.3 0-64 28.7-64 64L0 448c0 35.3 28.7 64 64 64l224 0c35.3 0 64-28.7 64-64l0-48-64 0 0 48zm-64-96l224 0c35.3 0 64-28.7 64-64l0-224c0-35.3-28.7-64-64-64L224 0c-35.3 0-64 28.7-64 64l0 224c0 35.3 28.7 64 64 64z" />
      )}
    </svg>
  );
}
