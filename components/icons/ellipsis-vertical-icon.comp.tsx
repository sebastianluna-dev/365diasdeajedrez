import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `ellipsis-vertical`, in Duotone Light or, with
 * `variant="solid"`, Duotone Solid.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function EllipsisVerticalIcon({ className, variant = "light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox={variant === "solid" ? "-277.33 -85.33 682.67 682.67" : "-309.33 -85.33 682.67 682.67"}
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "solid" ? (
        <>
          <path opacity=".4" d="M8 256c0 30.9 25.1 56 56 56s56-25.1 56-56-25.1-56-56-56-56 25.1-56 56z" />
          <path d="M120 424c0-30.9-25.1-56-56-56s-56 25.1-56 56 25.1 56 56 56 56-25.1 56-56zm0-336A56 56 0 1 0 8 88 56 56 0 1 0 120 88z" />
        </>
      ) : (
        <path d="M32 416c17.7 0 32 14.3 32 32s-14.3 32-32 32-32-14.3-32-32 14.3-32 32-32zm0-192c17.7 0 32 14.3 32 32s-14.3 32-32 32-32-14.3-32-32 14.3-32 32-32zM0 64A32 32 0 1 1 64 64 32 32 0 1 1 0 64z" />
      )}
    </svg>
  );
}
