import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `message`, in Duotone Light (the default), Duotone Solid,
 * Classic Solid or Classic Light, as `variant` says. Its Duotone Solid drawing
 * is a single layer, drawn at full strength: at 40 % it would read as switched
 * off.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function MessageIcon({ className, variant = "duotone-light" }: IconProps) {
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
            d="M32 128l0 224c0 35.3 28.7 64 64 64l40 0c13.3 0 24 10.7 24 24l0 68 112-84c6.9-5.2 15.3-8 24-8l120 0c35.3 0 64-28.7 64-64l0-224c0-35.3-28.7-64-64-64L96 64c-35.3 0-64 28.7-64 64z"
          />
          <path d="M179.2 533.6s0 0 0 0l-6.4 4.8c-4.8 3.6-10.7 5.6-16.8 5.6-15.5 0-28-12.5-28-28l0-68-32 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l320 0c53 0 96 43 96 96l0 224c0 53-43 96-96 96l-120 0c-1.7 0-3.4 .6-4.8 1.6l-112 84zM160 468l0 40 112-84c6.9-5.2 15.3-8 24-8l120 0c35.3 0 64-28.7 64-64l0-224c0-35.3-28.7-64-64-64L96 64c-35.3 0-64 28.7-64 64l0 224c0 35.3 28.7 64 64 64l40 0c13.3 0 24 10.7 24 24l0 28z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <path d="M0 352L0 128C0 75 43 32 96 32l320 0c53 0 96 43 96 96l0 224c0 53-43 96-96 96l-120 0c-5.2 0-10.2 1.7-14.4 4.8L166.4 539.2c-4.2 3.1-9.2 4.8-14.4 4.8-13.3 0-24-10.7-24-24l0-72-32 0c-53 0-96-43-96-96z" />
      )}
      {variant === "classic-solid" && (
        <path d="M0 352L0 128C0 75 43 32 96 32l320 0c53 0 96 43 96 96l0 224c0 53-43 96-96 96l-120 0c-5.2 0-10.2 1.7-14.4 4.8L166.4 539.2c-4.2 3.1-9.2 4.8-14.4 4.8-13.3 0-24-10.7-24-24l0-72-32 0c-53 0-96-43-96-96z" />
      )}
      {variant === "classic-light" && (
        <path d="M179.2 533.6s0 0 0 0l-6.4 4.8c-4.8 3.6-10.7 5.6-16.8 5.6-15.5 0-28-12.5-28-28l0-68-32 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l320 0c53 0 96 43 96 96l0 224c0 53-43 96-96 96l-120 0c-1.7 0-3.4 .6-4.8 1.6l-112 84zM160 468l0 40 112-84c6.9-5.2 15.3-8 24-8l120 0c35.3 0 64-28.7 64-64l0-224c0-35.3-28.7-64-64-64L96 64c-35.3 0-64 28.7-64 64l0 224c0 35.3 28.7 64 64 64l40 0c13.3 0 24 10.7 24 24l0 28z" />
      )}
      {variant === "sharp-duotone-light" && (
        <>
          <path opacity=".4" d="M32 64l0 352 128 0 0 71.5 111.5-66.9 7.6-4.6 200.9 0 0-352-448 0z" />
          <path d="M288 448l224 0 0-416-512 0 0 416 128 0 0 96c5.3-3.2 58.7-35.2 160-96zM160 487.5l0-71.5-128 0 0-352 448 0 0 352-200.9 0-7.6 4.6-111.5 66.9z" />
        </>
      )}
      {variant === "sharp-light" && (
        <path d="M288 448l224 0 0-416-512 0 0 416 128 0 0 96c5.3-3.2 58.7-35.2 160-96zM160 487.5l0-71.5-128 0 0-352 448 0 0 352-200.9 0-7.6 4.6-111.5 66.9z" />
      )}
    </svg>
  );
}
