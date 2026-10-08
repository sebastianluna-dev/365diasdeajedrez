import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `presentation-screen`, in Duotone Light (the default), Duotone
 * Solid, Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function PresentationScreenIcon({ className, variant = "duotone-light" }: IconProps) {
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
          <path opacity=".4" d="M64 64l0 256c0 17.7 14.3 32 32 32l320 0c17.7 0 32-14.3 32-32l0-256-384 0z" />
          <path d="M16 32C7.2 32 0 39.2 0 48S7.2 64 16 64l16 0 0 256c0 35.3 28.7 64 64 64l144 0 0 47.7-73.2 51.2c-7.2 5.1-9 15-3.9 22.3s15 9 22.3 3.9l70.8-49.6 70.8 49.6c7.2 5.1 17.2 3.3 22.3-3.9s3.3-17.2-3.9-22.3l-73.2-51.2 0-47.7 144 0c35.3 0 64-28.7 64-64l0-256 16 0c8.8 0 16-7.2 16-16s-7.2-16-16-16L16 32zM448 64l0 256c0 17.7-14.3 32-32 32L96 352c-17.7 0-32-14.3-32-32l0-256 384 0z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path opacity=".4" d="M32 80l448 0 0 240c0 35.3-28.7 64-64 64L96 384c-35.3 0-64-28.7-64-64L32 80z" />
          <path d="M24 32C10.7 32 0 42.7 0 56S10.7 80 24 80l464 0c13.3 0 24-10.7 24-24s-10.7-24-24-24L24 32zM232 384l0 35.5-69.8 48.8c-10.9 7.6-13.5 22.6-5.9 33.4s22.6 13.5 33.4 5.9l66.2-46.4 66.2 46.4c10.9 7.6 25.8 5 33.4-5.9s5-25.8-5.9-33.4l-69.8-48.8 0-35.5-48 0z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M24 32l464 0c13.3 0 24 10.7 24 24s-10.7 24-24 24L24 80C10.7 80 0 69.3 0 56S10.7 32 24 32zM232 384L96 384c-35.3 0-64-28.7-64-64l0-192 448 0 0 192c0 35.3-28.7 64-64 64l-136 0 0 35.5 69.8 48.8c10.9 7.6 13.5 22.6 5.9 33.4s-22.6 13.5-33.4 5.9l-66.2-46.4-66.2 46.4c-10.9 7.6-25.8 5-33.4-5.9s-5-25.8 5.9-33.4l69.8-48.8 0-35.5z" />
      )}
      {variant === "classic-light" && (
        <path d="M16 32C7.2 32 0 39.2 0 48S7.2 64 16 64l16 0 0 256c0 35.3 28.7 64 64 64l144 0 0 47.7-73.2 51.2c-7.2 5.1-9 15-3.9 22.3s15 9 22.3 3.9l70.8-49.6 70.8 49.6c7.2 5.1 17.2 3.3 22.3-3.9s3.3-17.2-3.9-22.3l-73.2-51.2 0-47.7 144 0c35.3 0 64-28.7 64-64l0-256 16 0c8.8 0 16-7.2 16-16s-7.2-16-16-16L16 32zM448 64l0 256c0 17.7-14.3 32-32 32L96 352c-17.7 0-32-14.3-32-32l0-256 384 0z" />
      )}
    </svg>
  );
}
