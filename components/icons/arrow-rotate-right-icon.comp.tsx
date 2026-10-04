import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `arrow-rotate-right`, in Duotone Light or, with
 * `variant="solid"`, Duotone Solid.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ArrowRotateRightIcon({ className, variant = "light" }: IconProps) {
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
            d="M75 75C-25 175-25 337 75 437S337 537 437 437c10.9-10.9 20.6-22.5 29.1-34.7 10.1-14.5 6.6-34.4-7.9-44.6s-34.4-6.6-44.6 7.9c-6.4 9.1-13.7 17.9-21.9 26.1-75 75-196.5 75-271.5 0s-75-196.5 0-271.5 196.5-75 271.5 0c.3 .3 .5 .5 .8 .7l7.5 7 48 0 0-42.8-11.4-10.6C336.6-25 174.8-24.9 75 75z"
          />
          <path d="M480 0c-17.7 0-32 14.3-32 32l0 96-96 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l128 0c17.7 0 32-14.3 32-32l0-128c0-17.7-14.3-32-32-32z" />
        </>
      ) : (
        <path d="M496 0c-8.8 0-16 7.2-16 16l0 103.8-37-39.1C394.4 29.2 326.8 0 256 0 114.6 0 0 114.6 0 256S114.6 512 256 512c98.3 0 183.6-55.4 226.5-136.5 4.1-7.8 1.1-17.5-6.7-21.6s-17.5-1.1-21.6 6.7C416.6 431.6 341.9 480 256 480 132.3 480 32 379.7 32 256S132.3 32 256 32c62 0 121.2 25.5 163.8 70.6L458.9 144 352 144c-8.8 0-16 7.2-16 16s7.2 16 16 16l144 0c8.8 0 16-7.2 16-16l0-144c0-8.8-7.2-16-16-16z" />
      )}
    </svg>
  );
}
