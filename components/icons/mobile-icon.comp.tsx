import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `mobile`, in Duotone Light or, with `variant="solid"`,
 * Duotone Solid.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function MobileIcon({ className, variant = "light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="-149.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "solid" ? (
        <>
          <path
            opacity=".4"
            d="M16 368l0 80c0 35.3 28.7 64 64 64l224 0c35.3 0 64-28.7 64-64l0-80-352 0zm112 72c0-13.3 10.7-24 24-24l80 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-80 0c-13.3 0-24-10.7-24-24z"
          />
          <path d="M16 64C16 28.7 44.7 0 80 0L304 0c35.3 0 64 28.7 64 64l0 304-352 0 0-304z" />
        </>
      ) : (
        <>
          <path
            opacity=".4"
            d="M48 64c0-17.7 14.3-32 32-32l224 0c17.7 0 32 14.3 32 32l0 384c0 17.7-14.3 32-32 32L80 480c-17.7 0-32-14.3-32-32L48 64zm96 352c0 8.8 7.2 16 16 16l64 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-64 0c-8.8 0-16 7.2-16 16z"
          />
          <path d="M80 32C62.3 32 48 46.3 48 64l0 384c0 17.7 14.3 32 32 32l224 0c17.7 0 32-14.3 32-32l0-384c0-17.7-14.3-32-32-32L80 32zM16 64C16 28.7 44.7 0 80 0L304 0c35.3 0 64 28.7 64 64l0 384c0 35.3-28.7 64-64 64L80 512c-35.3 0-64-28.7-64-64L16 64zM160 400l64 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-64 0c-8.8 0-16-7.2-16-16s7.2-16 16-16z" />
        </>
      )}
    </svg>
  );
}
