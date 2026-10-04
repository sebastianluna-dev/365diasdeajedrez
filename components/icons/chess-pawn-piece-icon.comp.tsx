import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `chess-pawn-piece`, in Duotone Light or, with
 * `variant="solid"`, Duotone Solid.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ChessPawnPieceIcon({ className, variant = "light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="-181.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "solid" ? (
        <>
          <path
            opacity=".4"
            d="M16 476.5C16 496.1 31.9 512 51.5 512l216.9 0c19.6 0 35.5-15.9 35.5-35.5 0-8.1-2.7-15.9-7.8-22.2L240 384 80 384 23.8 454.3c-5 6.3-7.8 14.1-7.8 22.2z"
          />
          <path d="M256 128c0 24.6-9.2 47-24.4 64l.4 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-5.3 0 13.3 144-160 0 13.3-144-5.3 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l.4 0c-15.2-17-24.4-39.4-24.4-64 0-53 43-96 96-96s96 43 96 96z" />
        </>
      ) : (
        <>
          <path
            opacity=".4"
            d="M48 476.5c0 2 1.6 3.5 3.5 3.5l216.9 0c1.5 0 2.7-.9 3.3-2.2l.3-1.4c0-.8-.3-1.6-.8-2.2-15.5-19.4-31.1-38.8-46.6-58.2l-129.2 0-46.6 58.3c-.5 .6-.8 1.4-.8 2.2zM96 128a64 64 0 1 0 128 0 64 64 0 1 0 -128 0zm16.1 256l95.8 0-13.3-160-69.1 0-13.3 160z"
          />
          <path d="M160 32c53 0 96 43 96 96 0 24.6-9.4 47-24.6 64l.6 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-5.3 0 13.3 160 56.2 70.3c5 6.3 7.8 14.1 7.8 22.2 0 19.6-15.9 35.5-35.5 35.5L51.5 512c-19.6 0-35.5-15.9-35.5-35.5 0-8.1 2.7-15.9 7.8-22.2L80 384 93.3 224 88 224c-8.8 0-16-7.2-16-16s7.2-16 16-16l.6 0c-15.2-17-24.6-39.4-24.6-64 0-53 43-96 96-96zM95.4 416l-46.6 58.3 0 0c-.5 .6-.8 1.4-.8 2.2 0 2 1.6 3.5 3.5 3.5l216.9 0c1.5 0 2.7-.9 3.3-2.2l.3-1.4c0-.8-.3-1.6-.8-2.2l0 0-46.6-58.3-129.2 0zm16.7-32l95.8 0-13.3-160-69.1 0-13.3 160zM160 64a64 64 0 1 0 0 128 64 64 0 1 0 0-128z" />
        </>
      )}
    </svg>
  );
}
