import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `computer-mouse`, in Duotone Light (the default), Duotone
 * Solid, Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ComputerMouseIcon({ className, variant = "duotone-light" }: IconProps) {
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
            d="M32 160l0 32 144 0 0-160-16 0C89.3 32 32 89.3 32 160zm0 64l0 128c0 70.7 57.3 128 128 128l64 0c70.7 0 128-57.3 128-128l0-128-320 0zM208 32l0 160 144 0 0-32c0-70.7-57.3-128-128-128l-16 0z"
          />
          <path d="M192 224l-160 0 0 128c0 70.7 57.3 128 128 128l64 0c70.7 0 128-57.3 128-128l0-128-160 0zm192-32l0 160c0 88.4-71.6 160-160 160l-64 0C71.6 512 0 440.4 0 352L0 160C0 71.6 71.6 0 160 0l64 0c88.4 0 160 71.6 160 160l0 32zM208 32l0 160 144 0 0-32c0-70.7-57.3-128-128-128l-16 0zm-32 0l-16 0C89.3 32 32 89.3 32 160l0 32 144 0 0-160z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M0 160C0 71.6 71.6 0 160 0l8 0 0 192-168 0 0-32zm0 80l384 0 0 112c0 88.4-71.6 160-160 160l-64 0C71.6 512 0 440.4 0 352L0 240zM216 0l8 0c88.4 0 160 71.6 160 160l0 32-168 0 0-192z"
          />
          <path d="M168 192l-168 0 0 48 384 0 0-48-168 0 0-192-48 0 0 192z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M0 192l168 0 0-192-8 0C71.6 0 0 71.6 0 160l0 32zm0 48L0 352c0 88.4 71.6 160 160 160l64 0c88.4 0 160-71.6 160-160l0-112-384 0zm384-48l0-32C384 71.6 312.4 0 224 0l-8 0 0 192 168 0z" />
      )}
      {variant === "classic-light" && (
        <path d="M192 224l-160 0 0 128c0 70.7 57.3 128 128 128l64 0c70.7 0 128-57.3 128-128l0-128-160 0zm192-32l0 160c0 88.4-71.6 160-160 160l-64 0C71.6 512 0 440.4 0 352L0 160C0 71.6 71.6 0 160 0l64 0c88.4 0 160 71.6 160 160l0 32zM208 32l0 160 144 0 0-32c0-70.7-57.3-128-128-128l-16 0zm-32 0l-16 0C89.3 32 32 89.3 32 160l0 32 144 0 0-160z" />
      )}
    </svg>
  );
}
