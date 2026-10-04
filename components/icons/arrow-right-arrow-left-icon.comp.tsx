import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Turning the board round, in the game viewer. Font Awesome's
 * `arrow-right-arrow-left`, in Duotone Light or, with `variant="solid"`,
 * Duotone Solid.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ArrowRightArrowLeftIcon({ className, variant = "light" }: IconProps) {
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
            d="M9.4 361.4l96-96c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3L109.3 352 480 352c17.7 0 32 14.3 32 32s-14.3 32-32 32l-370.7 0 41.4 41.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0l-96-96c-12.5-12.5-12.5-32.8 0-45.3z"
          />
          <path d="M502.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-96 96c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L402.7 160 32 160c-17.7 0-32-14.3-32-32S14.3 96 32 96l370.7 0-41.4-41.4c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l96 96z" />
        </>
      ) : (
        <path d="M139.3 484.7c6.2 6.2 6.2 16.4 0 22.6s-16.4 6.2-22.6 0l-112-112c-6.2-6.2-6.2-16.4 0-22.6l112-112c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6L54.6 368 496 368c8.8 0 16 7.2 16 16s-7.2 16-16 16l-441.4 0 84.7 84.7zm233.4-256L457.4 144 16 144c-8.8 0-16-7.2-16-16s7.2-16 16-16l441.4 0-84.7-84.7c-6.2-6.2-6.2-16.4 0-22.6s16.4-6.2 22.6 0l112 112c6.2 6.2 6.2 16.4 0 22.6l-112 112c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6z" />
      )}
    </svg>
  );
}
