import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `box-archive`, in Duotone Light (the default), Duotone Solid
 * or Classic Solid, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function BoxArchiveIcon({ className, variant = "duotone-light" }: IconProps) {
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
            d="M32 80l0 32c0 8.8 7.2 16 16 16l416 0c8.8 0 16-7.2 16-16l0-32c0-8.8-7.2-16-16-16L48 64c-8.8 0-16 7.2-16 16zm32 80l0 256c0 17.7 14.3 32 32 32l320 0c17.7 0 32-14.3 32-32l0-256-384 0zm96 80c0-8.8 7.2-16 16-16l160 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-160 0c-8.8 0-16-7.2-16-16z"
          />
          <path d="M464 64c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16L48 128c-8.8 0-16-7.2-16-16l0-32c0-8.8 7.2-16 16-16l416 0zM0 112c0 20.9 13.4 38.7 32 45.3L32 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-258.7c18.6-6.6 32-24.4 32-45.3l0-32c0-26.5-21.5-48-48-48L48 32C21.5 32 0 53.5 0 80l0 32zM64 416l0-256 384 0 0 256c0 17.7-14.3 32-32 32L96 448c-17.7 0-32-14.3-32-32zM176 224c-8.8 0-16 7.2-16 16s7.2 16 16 16l160 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-160 0z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M32 128l0 288c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-288-448 0zM160 264c0-13.3 10.7-24 24-24l144 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-144 0c-13.3 0-24-10.7-24-24z"
          />
          <path d="M32 32l448 0c17.7 0 32 14.3 32 32l0 32c0 17.7-14.3 32-32 32L32 128C14.3 128 0 113.7 0 96L0 64C0 46.3 14.3 32 32 32z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M0 64C0 46.3 14.3 32 32 32l448 0c17.7 0 32 14.3 32 32l0 32c0 17.7-14.3 32-32 32L32 128C14.3 128 0 113.7 0 96L0 64zM32 176l448 0 0 240c0 35.3-28.7 64-64 64L96 480c-35.3 0-64-28.7-64-64l0-240zm152 64c-13.3 0-24 10.7-24 24s10.7 24 24 24l144 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-144 0z" />
      )}
    </svg>
  );
}
