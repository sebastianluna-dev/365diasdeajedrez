import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `wallet`, in Duotone Light (the default), Duotone Solid,
 * Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function WalletIcon({ className, variant = "duotone-light" }: IconProps) {
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
            d="M32 112c0-26.5 21.5-48 48-48l384 0c8.8 0 16-7.2 16-16l0 64c-13.4-10.1-30-16-48-16L112 96c-8.8 0-16 7.2-16 16s7.2 16 16 16l320 0c26.5 0 48 21.5 48 48l0 192c0 26.5-21.5 48-48 48L80 416c-26.5 0-48-21.5-48-48l0-256zM360 272a24 24 0 1 0 48 0 24 24 0 1 0 -48 0z"
          />
          <path d="M80 32C35.8 32 0 67.8 0 112L0 368c0 44.2 35.8 80 80 80l352 0c44.2 0 80-35.8 80-80l0-192c0-44.2-35.8-80-80-80L112 96c-8.8 0-16 7.2-16 16s7.2 16 16 16l320 0c26.5 0 48 21.5 48 48l0 192c0 26.5-21.5 48-48 48L80 416c-26.5 0-48-21.5-48-48l0-256c0-26.5 21.5-48 48-48l384 0c8.8 0 16-7.2 16-16s-7.2-16-16-16L80 32zM384 296a24 24 0 1 0 0-48 24 24 0 1 0 0 48z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M48 104c0-13.3 10.7-24 24-24l384 0c13.3 0 24-10.7 24-24l0 80.6c-9.4-5.4-20.3-8.6-32-8.6L72 128c-13.3 0-24-10.7-24-24z"
          />
          <path d="M64 32C28.7 32 0 60.7 0 96L0 384c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-192c0-35.3-28.7-64-64-64L72 128c-13.3 0-24-10.7-24-24S58.7 80 72 80l384 0c13.3 0 24-10.7 24-24s-10.7-24-24-24L64 32zM416 256a32 32 0 1 1 0 64 32 32 0 1 1 0-64z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M64 32C28.7 32 0 60.7 0 96L0 384c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-192c0-35.3-28.7-64-64-64L72 128c-13.3 0-24-10.7-24-24S58.7 80 72 80l384 0c13.3 0 24-10.7 24-24s-10.7-24-24-24L64 32zM416 256a32 32 0 1 1 0 64 32 32 0 1 1 0-64z" />
      )}
      {variant === "classic-light" && (
        <path d="M80 32C35.8 32 0 67.8 0 112L0 368c0 44.2 35.8 80 80 80l352 0c44.2 0 80-35.8 80-80l0-192c0-44.2-35.8-80-80-80L112 96c-8.8 0-16 7.2-16 16s7.2 16 16 16l320 0c26.5 0 48 21.5 48 48l0 192c0 26.5-21.5 48-48 48L80 416c-26.5 0-48-21.5-48-48l0-256c0-26.5 21.5-48 48-48l384 0c8.8 0 16-7.2 16-16s-7.2-16-16-16L80 32zM384 296a24 24 0 1 0 0-48 24 24 0 1 0 0 48z" />
      )}
    </svg>
  );
}
