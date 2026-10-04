import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `display`, in Duotone Light (the default), Duotone Solid or
 * Classic Solid, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function DisplayIcon({ className, variant = "duotone-light" }: IconProps) {
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
            d="M32 96l0 256c0 17.7 14.3 32 32 32l384 0c17.7 0 32-14.3 32-32l0-256c0-17.7-14.3-32-32-32L64 64C46.3 64 32 78.3 32 96zM202.9 480l106.2 0-10.7-64-84.9 0-10.7 64z"
          />
          <path d="M64 64l384 0c17.7 0 32 14.3 32 32l0 256c0 17.7-14.3 32-32 32L64 384c-17.7 0-32-14.3-32-32L32 96c0-17.7 14.3-32 32-32zM448 32L64 32C28.7 32 0 60.7 0 96L0 352c0 35.3 28.7 64 64 64l117.1 0-10.7 64-58.4 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l288 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-58.4 0-10.7-64 117.1 0c35.3 0 64-28.7 64-64l0-256c0-35.3-28.7-64-64-64zM298.4 416l10.7 64-106.2 0 10.7-64 84.9 0z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M0 96L0 352c0 35.3 28.7 64 64 64l144 0-16 48-72 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l272 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-72 0-16-48 144 0c35.3 0 64-28.7 64-64l0-256c0-35.3-28.7-64-64-64L64 32C28.7 32 0 60.7 0 96zm64 0l384 0 0 256-384 0 0-256z"
          />
          <path d="M64 96l384 0 0 256-384 0z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M448 96l0 256-384 0 0-256 384 0zM64 32C28.7 32 0 60.7 0 96L0 352c0 35.3 28.7 64 64 64l144 0-16 48-72 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l272 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-72 0-16-48 144 0c35.3 0 64-28.7 64-64l0-256c0-35.3-28.7-64-64-64L64 32z" />
      )}
    </svg>
  );
}
