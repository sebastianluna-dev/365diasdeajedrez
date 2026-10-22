import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `table-columns`, in Duotone Light (the default), Duotone
 * Solid, Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function TableColumnsIcon({ className, variant = "duotone-light" }: IconProps) {
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
            d="M32 192l0 224c0 17.7 14.3 32 32 32l144 0 0-256-176 0zm208 0l0 256 144 0c17.7 0 32-14.3 32-32l0-224-176 0z"
          />
          <path d="M384 64c17.7 0 32 14.3 32 32l0 64-384 0 0-64c0-17.7 14.3-32 32-32l320 0zM0 160L0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L64 32C28.7 32 0 60.7 0 96l0 64zM416 416c0 17.7-14.3 32-32 32l-144 0 0-256 176 0 0 224zM208 448L64 448c-17.7 0-32-14.3-32-32l0-224 176 0 0 256z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path opacity=".4" d="M192 160l64 0 0 256-64 0 0-256z" />
          <path d="M64 160l0 256 320 0 0-256-320 0zm0 320c-35.3 0-64-28.7-64-64L0 96C0 60.7 28.7 32 64 32l320 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M0 96C0 60.7 28.7 32 64 32l320 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96zm64 64l0 256 128 0 0-256-128 0zm320 0l-128 0 0 256 128 0 0-256z" />
      )}
      {variant === "classic-light" && (
        <path d="M384 64c17.7 0 32 14.3 32 32l0 64-384 0 0-64c0-17.7 14.3-32 32-32l320 0zM0 160L0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L64 32C28.7 32 0 60.7 0 96l0 64zM416 416c0 17.7-14.3 32-32 32l-144 0 0-256 176 0 0 224zM208 448L64 448c-17.7 0-32-14.3-32-32l0-224 176 0 0 256z" />
      )}
      {variant === "sharp-duotone-light" && (
        <>
          <path opacity=".4" d="M32 192l0 256 176 0 0-256-176 0zm208 0l0 256 176 0 0-256-176 0z" />
          <path d="M416 64l0 96-384 0 0-96 384 0zM0 160l0 320 448 0 0-448-448 0 0 128zM416 448l-176 0 0-256 176 0 0 256zm-208 0l-176 0 0-256 176 0 0 256z" />
        </>
      )}
      {variant === "sharp-light" && (
        <path d="M416 64l0 96-384 0 0-96 384 0zM0 160l0 320 448 0 0-448-448 0 0 128zM416 448l-176 0 0-256 176 0 0 256zm-208 0l-176 0 0-256 176 0 0 256z" />
      )}
    </svg>
  );
}
