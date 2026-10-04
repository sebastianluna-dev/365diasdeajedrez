import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `infinity`, in Duotone Light (the default), Duotone Solid or
 * Classic Solid, as `variant` says. Its Duotone Solid drawing is a single
 * layer, drawn at full strength: at 40 % it would read as switched off.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function InfinityIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="-21.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "duotone-light" && (
        <path d="M0 233.5C0 157.5 61.5 96 137.5 96 176.7 96 214.1 112.8 240.2 142.1l79.8 89.8 79.8-89.8C425.9 112.8 463.3 96 502.5 96 578.5 96 640 157.5 640 233.5l0 45.1c0 75.9-61.5 137.5-137.5 137.5-39.3 0-76.7-16.8-102.7-46.1l-79.8-89.8-79.8 89.8C214.1 399.2 176.7 416 137.5 416 61.5 416 0 354.5 0 278.5l0-45.1zM298.6 256l-82.3-92.6C196.3 140.9 167.6 128 137.5 128 79.2 128 32 175.2 32 233.5l0 45.1c0 58.2 47.2 105.5 105.5 105.5 30.1 0 58.8-12.9 78.8-35.4L298.6 256zm42.8 0l82.3 92.6c20 22.5 48.7 35.4 78.8 35.4 58.2 0 105.5-47.2 105.5-105.5l0-45.1c0-58.2-47.2-105.5-105.5-105.5-30.1 0-58.8 12.9-78.8 35.4L341.4 256z" />
      )}
      {variant === "duotone-solid" && (
        <path d="M0 256c0-88.4 71.6-160 160-160 50.4 0 97.8 23.7 128 64l32 42.7 32-42.7c30.2-40.3 77.6-64 128-64 88.4 0 160 71.6 160 160S568.4 416 480 416c-50.4 0-97.8-23.7-128-64l-32-42.7-32 42.7c-30.2 40.3-77.6 64-128 64-88.4 0-160-71.6-160-160zm280 0l-43.2-57.6c-18.1-24.2-46.6-38.4-76.8-38.4-53 0-96 43-96 96s43 96 96 96c30.2 0 58.7-14.2 76.8-38.4L280 256zm80 0l43.2 57.6c18.1 24.2 46.6 38.4 76.8 38.4 53 0 96-43 96-96s-43-96-96-96c-30.2 0-58.7 14.2-76.8 38.4L360 256z" />
      )}
      {variant === "classic-solid" && (
        <path d="M0 256c0-88.4 71.6-160 160-160 50.4 0 97.8 23.7 128 64l32 42.7 32-42.7c30.2-40.3 77.6-64 128-64 88.4 0 160 71.6 160 160S568.4 416 480 416c-50.4 0-97.8-23.7-128-64l-32-42.7-32 42.7c-30.2 40.3-77.6 64-128 64-88.4 0-160-71.6-160-160zm280 0l-43.2-57.6c-18.1-24.2-46.6-38.4-76.8-38.4-53 0-96 43-96 96s43 96 96 96c30.2 0 58.7-14.2 76.8-38.4L280 256zm80 0l43.2 57.6c18.1 24.2 46.6 38.4 76.8 38.4 53 0 96-43 96-96s-43-96-96-96c-30.2 0-58.7 14.2-76.8 38.4L360 256z" />
      )}
    </svg>
  );
}
