import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `note-sticky`, in Duotone Light (the default), Duotone Solid,
 * Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function NoteStickyIcon({ className, variant = "duotone-light" }: IconProps) {
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
            d="M32 96l0 320c0 17.7 14.3 32 32 32l192 0 0-96c0-35.3 28.7-64 64-64l96 0 0-192c0-17.7-14.3-32-32-32L64 64C46.3 64 32 78.3 32 96z"
          />
          <path d="M256 448L64 448c-17.7 0-32-14.3-32-32L32 96c0-17.7 14.3-32 32-32l320 0c17.7 0 32 14.3 32 32l0 192-96 0c-35.3 0-64 28.7-64 64l0 96zM402.7 320L288 434.7 288 352c0-17.7 14.3-32 32-32l82.7 0zM0 416c0 35.3 28.7 64 64 64l197.5 0c17 0 33.3-6.7 45.3-18.7L429.3 338.7c12-12 18.7-28.3 18.7-45.3L448 96c0-35.3-28.7-64-64-64L64 32C28.7 32 0 60.7 0 96L0 416z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M0 96L0 416c0 35.3 28.7 64 64 64l224 0 0-128c0-17.7 14.3-32 32-32l128 0 0-224c0-35.3-28.7-64-64-64L64 32C28.7 32 0 60.7 0 96z"
          />
          <path d="M448 320c0 15.4-6.1 30.1-17 41L329 463c-10.9 10.9-25.6 17-41 17l0-128c0-17.7 14.3-32 32-32l128 0z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M64 480c-35.3 0-64-28.7-64-64L0 96C0 60.7 28.7 32 64 32l320 0c35.3 0 64 28.7 64 64l0 213.5c0 17-6.7 33.3-18.7 45.3L322.7 461.3c-12 12-28.3 18.7-45.3 18.7L64 480zM389.5 304L296 304c-13.3 0-24 10.7-24 24l0 93.5 117.5-117.5z" />
      )}
      {variant === "classic-light" && (
        <path d="M256 448L64 448c-17.7 0-32-14.3-32-32L32 96c0-17.7 14.3-32 32-32l320 0c17.7 0 32 14.3 32 32l0 192-96 0c-35.3 0-64 28.7-64 64l0 96zM402.7 320L288 434.7 288 352c0-17.7 14.3-32 32-32l82.7 0zM0 416c0 35.3 28.7 64 64 64l197.5 0c17 0 33.3-6.7 45.3-18.7L429.3 338.7c12-12 18.7-28.3 18.7-45.3L448 96c0-35.3-28.7-64-64-64L64 32C28.7 32 0 60.7 0 96L0 416z" />
      )}
    </svg>
  );
}
