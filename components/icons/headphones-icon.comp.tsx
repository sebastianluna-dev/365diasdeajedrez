import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `headphones`, in Duotone Light or, with `variant="solid"`,
 * Duotone Solid.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function HeadphonesIcon({ className, variant = "light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="-117.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "solid" ? (
        <>
          <path
            opacity=".4"
            d="M0 224L0 352c0-41.8 26.7-77.4 64-90.5L64 224c0-88.4 71.6-160 160-160s160 71.6 160 160l0 37.5c37.3 13.2 64 48.7 64 90.5l0-128C448 100.3 347.7 0 224 0S0 100.3 0 224z"
          />
          <path d="M96 256c-53 0-96 43-96 96l0 32c0 53 43 96 96 96l16 0c26.5 0 48-21.5 48-48l0-128c0-26.5-21.5-48-48-48l-16 0zm240 0c-26.5 0-48 21.5-48 48l0 128c0 26.5 21.5 48 48 48l16 0c53 0 96-43 96-96l0-32c0-53-43-96-96-96l-16 0z" />
        </>
      ) : (
        <>
          <path
            opacity=".4"
            d="M32 351.8c.1-35.3 28.7-63.8 64-63.8l16 0c8.8 0 16 7.2 16 16l0 128c0 8.8-7.2 16-16 16l-16 0c-35.3 0-63.9-28.6-64-64 0-10.7 0-21.2 0-32.2zm289.2-54c2.4-5.8 8.1-9.9 14.8-9.9l16 0c35.3 0 64 28.7 64 64l0 32c0 35.3-28.7 64-64 64l-16 0c-6.7 0-12.4-4.1-14.8-10 0-.3 0-.5 0-.8l0-137.8c0-.5 0-1 0-1.5z"
          />
          <path d="M32 224C32 118 118 32 224 32s192 86 192 192l0 56.4c-17-15.2-39.4-24.4-64-24.4l-16 0c-26.5 0-48 21.5-48 48l0 128c0 26.5 21.5 48 48 48l16 0c53 0 96-43 96-96l0-160C448 100.3 347.7 0 224 0S0 100.3 0 224L0 384c0 53 43 96 96 96l16 0c26.5 0 48-21.5 48-48l0-128c0-26.5-21.5-48-48-48l-16 0c-24.6 0-47 9.2-64 24.4L32 224zm0 128c0-35.3 28.7-64 64-64l16 0c8.8 0 16 7.2 16 16l0 128c0 8.8-7.2 16-16 16l-16 0c-35.3 0-64-28.7-64-64l0-32zm384 0l0 32c0 35.3-28.7 64-64 64l-16 0c-8.8 0-16-7.2-16-16l0-128c0-8.8 7.2-16 16-16l16 0c35.3 0 64 28.7 64 64z" />
        </>
      )}
    </svg>
  );
}
