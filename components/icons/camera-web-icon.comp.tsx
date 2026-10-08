import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `camera-web`, in Duotone Light (the default), Duotone Solid,
 * Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function CameraWebIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="-117.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "duotone-light" && (
        <>
          <path
            opacity=".4"
            d="M32 224a192 192 0 1 0 384 0 192 192 0 1 0 -384 0zm320 0a128 128 0 1 1 -256 0 128 128 0 1 1 256 0z"
          />
          <path d="M32 224a192 192 0 1 1 384 0 192 192 0 1 1 -384 0zM240 447.4C356.2 439.2 448 342.3 448 224 448 100.3 347.7 0 224 0S0 100.3 0 224C0 342.3 91.8 439.2 208 447.4l0 32.6-80 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l192 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-80 0 0-32.6zM128 224a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zm224 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path opacity=".4" d="M96 224a128 128 0 1 0 256 0 128 128 0 1 0 -256 0z" />
          <path d="M224 96a128 128 0 1 1 0 256 128 128 0 1 1 0-256zm24 350.7C360.4 434.8 448 339.6 448 224 448 100.3 347.7 0 224 0S0 100.3 0 224C0 339.6 87.6 434.8 200 446.7l0 33.3-80 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l208 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-80 0 0-33.3z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M64 224a160 160 0 1 1 320 0 160 160 0 1 1 -320 0zM248 446.7C360.4 434.8 448 339.6 448 224 448 100.3 347.7 0 224 0S0 100.3 0 224C0 339.6 87.6 434.8 200 446.7l0 33.3-80 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l208 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-80 0 0-33.3zM224 336a112 112 0 1 0 0-224 112 112 0 1 0 0 224z" />
      )}
      {variant === "classic-light" && (
        <path d="M32 224a192 192 0 1 1 384 0 192 192 0 1 1 -384 0zM240 447.4C356.2 439.2 448 342.3 448 224 448 100.3 347.7 0 224 0S0 100.3 0 224C0 342.3 91.8 439.2 208 447.4l0 32.6-80 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l192 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-80 0 0-32.6zM128 224a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zm224 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0z" />
      )}
    </svg>
  );
}
