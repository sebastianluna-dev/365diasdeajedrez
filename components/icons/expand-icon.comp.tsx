import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Full screen, in the game viewer. Font Awesome's `expand`, in Duotone Light
 * or, with `variant="solid"`, Duotone Solid.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ExpandIcon({ className, variant = "light" }: IconProps) {
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
            d="M0 352l0 96c0 17.7 14.3 32 32 32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0 0-64c0-17.7-14.3-32-32-32S0 334.3 0 352zM288 64c0 17.7 14.3 32 32 32l64 0 0 64c0 17.7 14.3 32 32 32s32-14.3 32-32l0-96c0-17.7-14.3-32-32-32l-96 0c-17.7 0-32 14.3-32 32z"
          />
          <path d="M0 64C0 46.3 14.3 32 32 32l96 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0 0 64c0 17.7-14.3 32-32 32S0 177.7 0 160L0 64zM416 320c17.7 0 32 14.3 32 32l0 96c0 17.7-14.3 32-32 32l-96 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l64 0 0-64c0-17.7 14.3-32 32-32z" />
        </>
      ) : (
        <>
          <path
            opacity=".4"
            d="M0 176L0 336c0-8.8 7.2-16 16-16s16 7.2 16 16l0 112 112 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l160 0c-8.8 0-16-7.2-16-16s7.2-16 16-16l112 0 0-112c0-8.8 7.2-16 16-16s16 7.2 16 16l0-160c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-112-112 0c-8.8 0-16-7.2-16-16s7.2-16 16-16L144 32c8.8 0 16 7.2 16 16s-7.2 16-16 16L32 64 32 176c0 8.8-7.2 16-16 16S0 184.8 0 176z"
          />
          <path d="M144 32c8.8 0 16 7.2 16 16s-7.2 16-16 16L32 64 32 176c0 8.8-7.2 16-16 16S0 184.8 0 176L0 48c0-8.8 7.2-16 16-16l128 0zM0 336c0-8.8 7.2-16 16-16s16 7.2 16 16l0 112 112 0c8.8 0 16 7.2 16 16s-7.2 16-16 16L16 480c-8.8 0-16-7.2-16-16L0 336zM432 32c8.8 0 16 7.2 16 16l0 128c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-112-112 0c-8.8 0-16-7.2-16-16s7.2-16 16-16l128 0zM416 336c0-8.8 7.2-16 16-16s16 7.2 16 16l0 128c0 8.8-7.2 16-16 16l-128 0c-8.8 0-16-7.2-16-16s7.2-16 16-16l112 0 0-112z" />
        </>
      )}
    </svg>
  );
}
