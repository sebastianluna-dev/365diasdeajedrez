import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `chart-simple`, in Duotone Light (the default), Duotone Solid
 * or Classic Solid, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ChartSimpleIcon({ className, variant = "duotone-light" }: IconProps) {
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
            d="M32 272l0 160c0 8.8 7.2 16 16 16l32 0c8.8 0 16-7.2 16-16l0-160c0-8.8-7.2-16-16-16l-32 0c-8.8 0-16 7.2-16 16zM416 144l0 288c0 8.8 7.2 16 16 16l32 0c8.8 0 16-7.2 16-16l0-288c0-8.8-7.2-16-16-16l-32 0c-8.8 0-16 7.2-16 16z"
          />
          <path d="M272 64c8.8 0 16 7.2 16 16l0 352c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-352c0-8.8 7.2-16 16-16l32 0zM240 32c-26.5 0-48 21.5-48 48l0 352c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-352c0-26.5-21.5-48-48-48l-32 0zM80 256c8.8 0 16 7.2 16 16l0 160c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-160c0-8.8 7.2-16 16-16l32 0zM48 224c-26.5 0-48 21.5-48 48L0 432c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-160c0-26.5-21.5-48-48-48l-32 0zm384-96l32 0c8.8 0 16 7.2 16 16l0 288c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-288c0-8.8 7.2-16 16-16zm-48 16l0 288c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48l-32 0c-26.5 0-48 21.5-48 48z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M192 80c0-26.5 21.5-48 48-48l32 0c26.5 0 48 21.5 48 48l0 352c0 26.5-21.5 48-48 48l-32 0c-26.5 0-48-21.5-48-48l0-352z"
          />
          <path d="M432 96c-26.5 0-48 21.5-48 48l0 288c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48l-32 0zM48 224c-26.5 0-48 21.5-48 48L0 432c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-160c0-26.5-21.5-48-48-48l-32 0z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M192 80c0-26.5 21.5-48 48-48l32 0c26.5 0 48 21.5 48 48l0 352c0 26.5-21.5 48-48 48l-32 0c-26.5 0-48-21.5-48-48l0-352zM0 272c0-26.5 21.5-48 48-48l32 0c26.5 0 48 21.5 48 48l0 160c0 26.5-21.5 48-48 48l-32 0c-26.5 0-48-21.5-48-48L0 272zM432 96l32 0c26.5 0 48 21.5 48 48l0 288c0 26.5-21.5 48-48 48l-32 0c-26.5 0-48-21.5-48-48l0-288c0-26.5 21.5-48 48-48z" />
      )}
    </svg>
  );
}
