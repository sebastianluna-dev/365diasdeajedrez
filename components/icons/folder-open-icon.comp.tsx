import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `folder-open`, in Duotone Light or, with `variant="solid"`,
 * Duotone Solid.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function FolderOpenIcon({ className, variant = "light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="-53.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "solid" ? (
        <>
          <path
            opacity=".4"
            d="M32.4 96l0 288c0 6.3 .9 12.4 2.6 18.1-.2-5.7 .5-11.5 2.5-17.3l48-144C92 221.2 110.4 208 131 208l381.4 0 0-64c0-35.3-28.7-64-64-64L331.1 80c-6.9 0-13.7-2.2-19.2-6.4L273.5 44.8C262.4 36.5 249 32 235.1 32L96.4 32c-35.3 0-64 28.7-64 64z"
          />
          <path d="M83 448l394.8 0c20.7 0 39-13.2 45.5-32.8l48-144c10.4-31.1-12.8-63.2-45.5-63.2L131 208c-20.7 0-39 13.2-45.5 32.8l-48 144C27.1 415.9 50.3 448 83 448z" />
        </>
      ) : (
        <>
          <path
            opacity=".4"
            d="M82.3 395.2C79 405.5 86.7 416 97.5 416L477 416c7 0 13.2-4.5 15.3-11.2l50-160c3.2-10.3-4.5-20.8-15.3-20.8l-379.4 0c-7 0-13.2 4.5-15.3 11.2l-50 160z"
          />
          <path d="M97.5 416c-10.8 0-18.5-10.5-15.3-20.8l50-160c2.1-6.7 8.3-11.2 15.3-11.2L527 224c10.8 0 18.5 10.5 15.3 20.8l-50 160C490.1 411.5 484 416 477 416L97.5 416zm126.7 32L477 448c21 0 39.6-13.6 45.8-33.7l50-160c9.7-30.9-13.4-62.3-45.8-62.3l-379.4 0c-21 0-39.6 13.6-45.8 33.7L64.2 345.6 64.2 96c0-17.7 14.3-32 32-32l138.7 0c6.9 0 13.7 2.2 19.2 6.4l38.4 28.8c11.1 8.3 24.6 12.8 38.4 12.8l117.3 0c17.7 0 32 14.3 32 32l32 0c0-35.3-28.7-64-64-64L330.9 80c-6.9 0-13.7-2.2-19.2-6.4L273.3 44.8C262.2 36.5 248.8 32 234.9 32L96.2 32c-35.3 0-64 28.7-64 64l0 288c0 35.3 28.7 64 64 64l128 0z" />
        </>
      )}
    </svg>
  );
}
