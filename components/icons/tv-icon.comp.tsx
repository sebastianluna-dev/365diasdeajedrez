import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `tv`, in Duotone Light (the default), Duotone Solid or
 * Classic Solid, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function TvIcon({ className, variant = "duotone-light" }: IconProps) {
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
            d="M32 96l0 256c0 17.7 14.3 32 32 32l448 0c17.7 0 32-14.3 32-32l0-256c0-17.7-14.3-32-32-32L64 64C46.3 64 32 78.3 32 96z"
          />
          <path d="M64 64C46.3 64 32 78.3 32 96l0 256c0 17.7 14.3 32 32 32l448 0c17.7 0 32-14.3 32-32l0-256c0-17.7-14.3-32-32-32L64 64zM0 96C0 60.7 28.7 32 64 32l448 0c35.3 0 64 28.7 64 64l0 256c0 35.3-28.7 64-64 64L64 416c-35.3 0-64-28.7-64-64L0 96zM144 480l288 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-288 0c-8.8 0-16-7.2-16-16s7.2-16 16-16z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M0 96C0 60.7 28.7 32 64 32l448 0c35.3 0 64 28.7 64 64l0 240c0 35.3-28.7 64-64 64L64 400c-35.3 0-64-28.7-64-64L0 96zm64 0l0 240 448 0 0-240-448 0zm64 384c0-17.7 14.3-32 32-32l256 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-256 0c-17.7 0-32-14.3-32-32z"
          />
          <path d="M64 96l448 0 0 240-448 0 0-240z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M64 96l0 240 448 0 0-240-448 0zM0 96C0 60.7 28.7 32 64 32l448 0c35.3 0 64 28.7 64 64l0 240c0 35.3-28.7 64-64 64L64 400c-35.3 0-64-28.7-64-64L0 96zM160 448l256 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-256 0c-17.7 0-32-14.3-32-32s14.3-32 32-32z" />
      )}
    </svg>
  );
}
