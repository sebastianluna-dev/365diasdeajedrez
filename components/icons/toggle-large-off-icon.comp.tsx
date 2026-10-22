import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `toggle-large-off`, in Duotone Light (the default), Duotone
 * Solid, Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ToggleLargeOffIcon({ className, variant = "duotone-light" }: IconProps) {
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
          <path opacity=".4" d="M32 256a128 128 0 1 0 256 0 128 128 0 1 0 -256 0z" />
          <path d="M160 384a128 128 0 1 1 0-256 128 128 0 1 1 0 256zm0 32l256 0c88.4 0 160-71.6 160-160S504.4 96 416 96L160 96C71.6 96 0 167.6 0 256S71.6 416 160 416zm96-32c38.9-29.2 64-75.7 64-128s-25.1-98.8-64-128l160 0c70.7 0 128 57.3 128 128S486.7 384 416 384l-160 0z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M0 256C0 362 86 448 192 448l192 0c106 0 192-86 192-192S490 64 384 64L192 64C86 64 0 150 0 256zm64 0c0-70.7 57.3-128 128-128l192 0c70.7 0 128 57.3 128 128S454.7 384 384 384l-192 0c-70.7 0-128-57.3-128-128z"
          />
          <path d="M64 256a128 128 0 1 1 256 0 128 128 0 1 1 -256 0z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M192 384a128 128 0 1 1 0-256 128 128 0 1 1 0 256zm0 64l192 0c106 0 192-86 192-192S490 64 384 64L192 64C86 64 0 150 0 256S86 448 192 448zm143.1-64c30.4-34 48.9-78.8 48.9-128s-18.5-94-48.9-128l48.9 0c70.7 0 128 57.3 128 128S454.7 384 384 384l-48.9 0z" />
      )}
      {variant === "classic-light" && (
        <path d="M160 384a128 128 0 1 1 0-256 128 128 0 1 1 0 256zm0 32l256 0c88.4 0 160-71.6 160-160S504.4 96 416 96L160 96C71.6 96 0 167.6 0 256S71.6 416 160 416zm96-32c38.9-29.2 64-75.7 64-128s-25.1-98.8-64-128l160 0c70.7 0 128 57.3 128 128S486.7 384 416 384l-160 0z" />
      )}
      {variant === "sharp-duotone-light" && (
        <>
          <path
            opacity=".4"
            d="M32 128l256 0 0 256-256 0 0-256zm32 32l0 192 192 0 0-192-192 0zm32 32l128 0 0 128-128 0 0-128z"
          />
          <path d="M32 128l256 0 0 256-256 0 0-256zM288 416l288 0 0-320-576 0 0 320 288 0zm32-32l0-256 224 0 0 256-224 0zM96 192l128 0 0 128-128 0 0-128zM64 160l0 192 192 0 0-192-192 0z" />
        </>
      )}
      {variant === "sharp-light" && (
        <path d="M32 128l256 0 0 256-256 0 0-256zM288 416l288 0 0-320-576 0 0 320 288 0zm32-32l0-256 224 0 0 256-224 0zM96 192l128 0 0 128-128 0 0-128zM64 160l0 192 192 0 0-192-192 0z" />
      )}
    </svg>
  );
}
