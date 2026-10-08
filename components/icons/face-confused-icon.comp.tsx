import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `face-confused`, in Duotone Light (the default), Duotone
 * Solid, Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function FaceConfusedIcon({ className, variant = "duotone-light" }: IconProps) {
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
            d="M32 256a224 224 0 1 0 448 0 224 224 0 1 0 -448 0zM147.5 394c-5.5-6.9-4.4-17 2.5-22.5l1.1-.9C205 327.5 272 304 341 304l11 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-11 0c-61.8 0-121.7 21-169.9 59.6l-1.1 .9c-6.9 5.5-17 4.4-22.5-2.5zM200 208a24 24 0 1 1 -48 0 24 24 0 1 1 48 0zm160 0a24 24 0 1 1 -48 0 24 24 0 1 1 48 0z"
          />
          <path d="M480 256a224 224 0 1 0 -448 0 224 224 0 1 0 448 0zM0 256a256 256 0 1 1 512 0 256 256 0 1 1 -512 0zM171.1 395.6l-1.1 .9c-6.9 5.5-17 4.4-22.5-2.5s-4.4-17 2.5-22.5l1.1-.9C205 327.5 272 304 341 304l11 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-11 0c-61.8 0-121.7 21-169.9 59.6zM152 208a24 24 0 1 1 48 0 24 24 0 1 1 -48 0zm184-24a24 24 0 1 1 0 48 24 24 0 1 1 0-48z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M0 256a256 256 0 1 0 512 0 256 256 0 1 0 -512 0zm208-48a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zM156.8 390.4c-8-10.6-5.8-25.6 4.8-33.6l12.8-9.6c37.4-28 82.9-43.2 129.6-43.2l40 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-40 0c-36.3 0-71.7 11.8-100.8 33.6l-12.8 9.6c-10.6 8-25.6 5.8-33.6-4.8zM368 208a32 32 0 1 1 -64 0 32 32 0 1 1 64 0z"
          />
          <path d="M176 240a32 32 0 1 0 0-64 32 32 0 1 0 0 64zm160 0a32 32 0 1 0 0-64 32 32 0 1 0 0 64z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512zM203.2 385.6l-12.8 9.6c-10.6 8-25.6 5.8-33.6-4.8s-5.8-25.6 4.8-33.6l12.8-9.6c37.4-28 82.9-43.2 129.6-43.2l40 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-40 0c-36.3 0-71.7 11.8-100.8 33.6zM144 208a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm192-32a32 32 0 1 1 0 64 32 32 0 1 1 0-64z" />
      )}
      {variant === "classic-light" && (
        <path d="M480 256a224 224 0 1 0 -448 0 224 224 0 1 0 448 0zM0 256a256 256 0 1 1 512 0 256 256 0 1 1 -512 0zM171.1 395.6l-1.1 .9c-6.9 5.5-17 4.4-22.5-2.5s-4.4-17 2.5-22.5l1.1-.9C205 327.5 272 304 341 304l11 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-11 0c-61.8 0-121.7 21-169.9 59.6zM152 208a24 24 0 1 1 48 0 24 24 0 1 1 -48 0zm184-24a24 24 0 1 1 0 48 24 24 0 1 1 0-48z" />
      )}
    </svg>
  );
}
