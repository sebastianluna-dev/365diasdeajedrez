import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `child`, in Duotone Light (the default), Duotone Solid or
 * Classic Solid, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ChildIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="-181.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "duotone-light" && (
        <>
          <path
            opacity=".4"
            d="M112 204.1l0 147.9 96 0 0-147.9c-14.5-7.8-31-12.1-48-12.1s-33.5 4.3-48 12.1zM128 64a32 32 0 1 0 64 0 32 32 0 1 0 -64 0z"
          />
          <path d="M128 64a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm96 0A64 64 0 1 0 96 64 64 64 0 1 0 224 64zM73.9 240.2c1.9-3.1 3.9-6 6.1-8.9L80 496c0 8.8 7.2 16 16 16s16-7.2 16-16l0-112 96 0 0 112c0 8.8 7.2 16 16 16s16-7.2 16-16l0-264.7c2.2 2.8 4.2 5.8 6.1 8.9l44.3 72.2c4.6 7.5 14.5 9.9 22 5.3s9.9-14.5 5.3-22l-44.3-72.2C249.2 184 206.3 160 160 160S70.8 184 46.6 223.5L2.4 295.6c-4.6 7.5-2.3 17.4 5.3 22s17.4 2.3 22-5.3l44.3-72.2zM208 352l-96 0 0-147.9c14.5-7.8 31-12.1 48-12.1s33.5 4.3 48 12.1L208 352z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path opacity=".4" d="M96 64A64 64 0 1 0 224 64 64 64 0 1 0 96 64z" />
          <path d="M144 384l0 96c0 17.7-14.3 32-32 32s-32-14.3-32-32L80 287.8 59.1 321c-9.4 15-29.2 19.4-44.1 10S-4.5 301.9 4.9 287l39.9-63.3C69.7 184 113.2 160 160 160s90.3 24 115.2 63.6L315.1 287c9.4 15 4.9 34.7-10 44.1s-34.7 4.9-44.1-10L240 287.8 240 480c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-96-32 0z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M96 64A64 64 0 1 1 224 64 64 64 0 1 1 96 64zm48 320l0 96c0 17.7-14.3 32-32 32s-32-14.3-32-32L80 287.8 59.1 321c-9.4 15-29.2 19.4-44.1 10S-4.5 301.9 4.9 287l39.9-63.3C69.7 184 113.2 160 160 160s90.3 24 115.2 63.6L315.1 287c9.4 15 4.9 34.7-10 44.1s-34.7 4.9-44.1-10L240 287.8 240 480c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-96-32 0z" />
      )}
    </svg>
  );
}
