import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `ellipsis-vertical`, in twelve styles (Duotone Light is the default), as `variant` says.
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
          "sharp-duotone-light": "-309.33 -85.33 682.67 682.67",
          "sharp-light": "-309.33 -85.33 682.67 682.67",
          "classic-regular": "-277.33 -85.33 682.67 682.67",
          "duotone-regular": "-277.33 -85.33 682.67 682.67",
          "sharp-solid": "-277.33 -85.33 682.67 682.67",
          "sharp-duotone-solid": "-277.33 -85.33 682.67 682.67",
          "sharp-regular": "-277.33 -85.33 682.67 682.67",
          "sharp-duotone-regular": "-277.33 -85.33 682.67 682.67",
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
      {variant === "sharp-duotone-light" && (
        <path d="M0 32l64 0 0 64-64 0 0-64zM0 224l64 0 0 64-64 0 0-64zM64 416l0 64-64 0 0-64 64 0z" />
      )}
      {variant === "sharp-light" && (
        <path d="M0 32l64 0 0 64-64 0 0-64zM0 224l64 0 0 64-64 0 0-64zM64 416l0 64-64 0 0-64 64 0z" />
      )}
      {variant === "classic-regular" && (
        <path d="M112 80a48 48 0 1 1 -96 0 48 48 0 1 1 96 0zM16 256c0-26.5 21.5-48 48-48s48 21.5 48 48-21.5 48-48 48-48-21.5-48-48zm96 176c0 26.5-21.5 48-48 48s-48-21.5-48-48 21.5-48 48-48 48 21.5 48 48z" />
      )}
      {variant === "duotone-regular" && (
        <path d="M112 80a48 48 0 1 1 -96 0 48 48 0 1 1 96 0zM16 256c0-26.5 21.5-48 48-48s48 21.5 48 48-21.5 48-48 48-48-21.5-48-48zm96 176c0 26.5-21.5 48-48 48s-48-21.5-48-48 21.5-48 48-48 48 21.5 48 48z" />
      )}
      {variant === "sharp-solid" && (
        <path d="M120 32l-112 0 0 112 112 0 0-112zM8 200l0 112 112 0 0-112-112 0zM8 368l0 112 112 0 0-112-112 0z" />
      )}
      {variant === "sharp-duotone-solid" && (
        <>
          <path opacity=".4" d="M8 200l112 0 0 112-112 0 0-112z" />
          <path d="M120 32l-112 0 0 112 112 0 0-112zm0 336l-112 0 0 112 112 0 0-112z" />
        </>
      )}
      {variant === "sharp-regular" && (
        <path d="M16 32l96 0 0 96-96 0 0-96zm0 176l96 0 0 96-96 0 0-96zm96 176l0 96-96 0 0-96 96 0z" />
      )}
      {variant === "sharp-duotone-regular" && (
        <path d="M16 32l96 0 0 96-96 0 0-96zm0 176l96 0 0 96-96 0 0-96zm96 176l0 96-96 0 0-96 96 0z" />
      )}
    </svg>
  );
}
