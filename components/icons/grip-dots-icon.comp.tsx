import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `grip-dots`, in Duotone Light or, with `variant="solid"`,
 * Duotone Solid.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function GripDotsIcon({ className, variant = "light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="-85.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "solid" ? (
        <>
          <path
            opacity=".4"
            d="M0 352a64 64 0 1 0 128 0 64 64 0 1 0 -128 0zm192 0a64 64 0 1 0 128 0 64 64 0 1 0 -128 0zm192 0a64 64 0 1 0 128 0 64 64 0 1 0 -128 0z"
          />
          <path d="M64 224a64 64 0 1 0 0-128 64 64 0 1 0 0 128zM256 96a64 64 0 1 0 0 128 64 64 0 1 0 0-128zm192 0a64 64 0 1 0 0 128 64 64 0 1 0 0-128z" />
        </>
      ) : (
        <>
          <path
            opacity=".4"
            d="M32 160a32 32 0 1 0 64 0 32 32 0 1 0 -64 0zm0 192a32 32 0 1 0 64 0 32 32 0 1 0 -64 0zM224 160a32 32 0 1 0 64 0 32 32 0 1 0 -64 0zm0 192a32 32 0 1 0 64 0 32 32 0 1 0 -64 0zM416 160a32 32 0 1 0 64 0 32 32 0 1 0 -64 0zm0 192a32 32 0 1 0 64 0 32 32 0 1 0 -64 0z"
          />
          <path d="M64 192a32 32 0 1 1 0-64 32 32 0 1 1 0 64zm64-32a64 64 0 1 0 -128 0 64 64 0 1 0 128 0zm160 0a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zM256 96a64 64 0 1 0 0 128 64 64 0 1 0 0-128zm224 64a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zM448 96a64 64 0 1 0 0 128 64 64 0 1 0 0-128zm32 256a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zm-32-64a64 64 0 1 0 0 128 64 64 0 1 0 0-128zM256 384a32 32 0 1 1 0-64 32 32 0 1 1 0 64zm64-32a64 64 0 1 0 -128 0 64 64 0 1 0 128 0zM96 352a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zM64 288a64 64 0 1 0 0 128 64 64 0 1 0 0-128z" />
        </>
      )}
    </svg>
  );
}
