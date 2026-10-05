import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `ellipsis-vertical`, in Duotone Light (the default), Duotone
 * Solid, Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function EllipsisVerticalIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox={
        {
          "duotone-light": "-309.33 -85.33 682.67 682.67",
          "duotone-solid": "-277.33 -85.33 682.67 682.67",
          "classic-solid": "-277.33 -85.33 682.67 682.67",
          "classic-light": "-309.33 -85.33 682.67 682.67",
        }[variant]
      }
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "duotone-light" && (
        <path d="M32 416c17.7 0 32 14.3 32 32s-14.3 32-32 32-32-14.3-32-32 14.3-32 32-32zm0-192c17.7 0 32 14.3 32 32s-14.3 32-32 32-32-14.3-32-32 14.3-32 32-32zM0 64A32 32 0 1 1 64 64 32 32 0 1 1 0 64z" />
      )}
      {variant === "duotone-solid" && (
        <>
          <path opacity=".4" d="M8 256c0 30.9 25.1 56 56 56s56-25.1 56-56-25.1-56-56-56-56 25.1-56 56z" />
          <path d="M120 424c0-30.9-25.1-56-56-56s-56 25.1-56 56 25.1 56 56 56 56-25.1 56-56zm0-336A56 56 0 1 0 8 88 56 56 0 1 0 120 88z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M64 144a56 56 0 1 1 0-112 56 56 0 1 1 0 112zm0 224c30.9 0 56 25.1 56 56s-25.1 56-56 56-56-25.1-56-56 25.1-56 56-56zm56-112c0 30.9-25.1 56-56 56s-56-25.1-56-56 25.1-56 56-56 56 25.1 56 56z" />
      )}
      {variant === "classic-light" && (
        <path d="M32 416c17.7 0 32 14.3 32 32s-14.3 32-32 32-32-14.3-32-32 14.3-32 32-32zm0-192c17.7 0 32 14.3 32 32s-14.3 32-32 32-32-14.3-32-32 14.3-32 32-32zM0 64A32 32 0 1 1 64 64 32 32 0 1 1 0 64z" />
      )}
    </svg>
  );
}
