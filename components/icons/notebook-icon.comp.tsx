import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `notebook`, in Duotone Light (the default), Duotone Solid or
 * Classic Solid, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function NotebookIcon({ className, variant = "duotone-light" }: IconProps) {
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
          <path opacity=".4" d="M224 32l192 0c17.7 0 32 14.3 32 32l0 384c0 17.7-14.3 32-32 32l-192 0 0-448z" />
          <path d="M192 32l0 448-64 0c-17.7 0-32-14.3-32-32l0-48 32 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-32 0 0-96 32 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-32 0 0-96 32 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-32 0 0-48c0-17.7 14.3-32 32-32l64 0zm32 0l192 0c17.7 0 32 14.3 32 32l0 384c0 17.7-14.3 32-32 32l-192 0 0-448zM64 64l0 48-48 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l48 0 0 96-48 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l48 0 0 96-48 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l48 0 0 48c0 35.3 28.7 64 64 64l288 0c35.3 0 64-28.7 64-64l0-384c0-35.3-28.7-64-64-64L128 0C92.7 0 64 28.7 64 64z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path opacity=".4" d="M192 0L432 0c26.5 0 48 21.5 48 48l0 416c0 26.5-21.5 48-48 48l-240 0 0-512z" />
          <path d="M112 0C85.5 0 64 21.5 64 48l0 56-40 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l40 0 0 80-40 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l40 0 0 80-40 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l40 0 0 56c0 26.5 21.5 48 48 48l80 0 0-512-80 0z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M64 64l0 40-40 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l40 0 0 80-40 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l40 0 0 80-40 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l40 0 0 40c0 35.3 28.7 64 64 64l48 0 0-512-48 0C92.7 0 64 28.7 64 64zM416 0l-192 0 0 512 192 0c35.3 0 64-28.7 64-64l0-384c0-35.3-28.7-64-64-64z" />
      )}
    </svg>
  );
}
