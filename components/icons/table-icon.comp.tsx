import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `table`, in Duotone Light (the default), Duotone Solid,
 * Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function TableIcon({ className, variant = "duotone-light" }: IconProps) {
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
          <path
            opacity=".4"
            d="M32 192l0 112 176 0 0-112-176 0zm0 144l0 80c0 17.7 14.3 32 32 32l144 0 0-112-176 0zM240 192l0 112 176 0 0-112-176 0zm0 144l0 112 144 0c17.7 0 32-14.3 32-32l0-80-176 0z"
          />
          <path d="M64 64C46.3 64 32 78.3 32 96l0 64 384 0 0-64c0-17.7-14.3-32-32-32L64 64zM0 192L0 96C0 60.7 28.7 32 64 32l320 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 192zm416 0l-176 0 0 112 176 0 0-112zm-208 0l-176 0 0 112 176 0 0-112zm0 144l-176 0 0 80c0 17.7 14.3 32 32 32l144 0 0-112zm32 112l144 0c17.7 0 32-14.3 32-32l0-80-176 0 0 112z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path opacity=".4" d="M64 256l0 64 128 0 0 96 64 0 0-96 128 0 0-64-128 0 0-96-64 0 0 96-128 0z" />
          <path d="M64 160l0 256 320 0 0-256-320 0zM0 96C0 60.7 28.7 32 64 32l320 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M384 32c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64l-320 0-6.5-.3C25.2 476.4 0 449.1 0 416L0 96C0 60.7 28.7 32 64 32l320 0zM64 320l0 96 128 0 0-96-128 0zm192 0l0 96 128 0 0-96-128 0zM64 256l128 0 0-96-128 0 0 96zm192 0l128 0 0-96-128 0 0 96z" />
      )}
      {variant === "classic-light" && (
        <path d="M64 64C46.3 64 32 78.3 32 96l0 64 384 0 0-64c0-17.7-14.3-32-32-32L64 64zM0 192L0 96C0 60.7 28.7 32 64 32l320 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 192zm416 0l-176 0 0 112 176 0 0-112zm-208 0l-176 0 0 112 176 0 0-112zm0 144l-176 0 0 80c0 17.7 14.3 32 32 32l144 0 0-112zm32 112l144 0c17.7 0 32-14.3 32-32l0-80-176 0 0 112z" />
      )}
      {variant === "sharp-duotone-light" && (
        <>
          <path
            opacity=".4"
            d="M32 192l0 112 176 0 0-112-176 0zm0 144l0 112 176 0 0-112-176 0zM240 192l0 112 176 0 0-112-176 0zm0 144l0 112 176 0 0-112-176 0z"
          />
          <path d="M32 64l0 96 384 0 0-96-384 0zM0 192l0-160 448 0 0 448-448 0 0-288zm416 0l-176 0 0 112 176 0 0-112zm-208 0l-176 0 0 112 176 0 0-112zm0 144l-176 0 0 112 176 0 0-112zm32 112l176 0 0-112-176 0 0 112z" />
        </>
      )}
      {variant === "sharp-light" && (
        <path d="M32 64l0 96 384 0 0-96-384 0zM0 192l0-160 448 0 0 448-448 0 0-288zm416 0l-176 0 0 112 176 0 0-112zm-208 0l-176 0 0 112 176 0 0-112zm0 144l-176 0 0 112 176 0 0-112zm32 112l176 0 0-112-176 0 0 112z" />
      )}
    </svg>
  );
}
