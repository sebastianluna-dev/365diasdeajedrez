import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `microphone`, in Duotone Light or, with `variant="solid"`,
 * Duotone Solid.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function MicrophoneIcon({ className, variant = "light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="-149.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "solid" ? (
        <>
          <path
            opacity=".4"
            d="M0 184l0 40c0 97.9 73.3 178.7 168 190.5l0 49.5-48 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l144 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-48 0 0-49.5c94.7-11.8 168-92.6 168-190.5l0-40c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 40c0 79.5-64.5 144-144 144S48 303.5 48 224l0-40c0-13.3-10.7-24-24-24S0 170.7 0 184z"
          />
          <path d="M96 96c0-53 43-96 96-96s96 43 96 96l0 128c0 53-43 96-96 96s-96-43-96-96L96 96z" />
        </>
      ) : (
        <>
          <path
            opacity=".4"
            d="M128 96l0 128c0 35.3 28.7 64 64 64s64-28.7 64-64l0-128c0-35.3-28.7-64-64-64s-64 28.7-64 64z"
          />
          <path d="M192 32c35.3 0 64 28.7 64 64l0 128c0 35.3-28.7 64-64 64s-64-28.7-64-64l0-128c0-35.3 28.7-64 64-64zM96 96l0 128c0 53 43 96 96 96s96-43 96-96l0-128c0-53-43-96-96-96S96 43 96 96zM32 176c0-8.8-7.2-16-16-16S0 167.2 0 176l0 48C0 324.6 77.4 407.2 176 415.3l0 64.7-64 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l160 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-64 0 0-64.7c98.6-8.1 176-90.7 176-191.3l0-48c0-8.8-7.2-16-16-16s-16 7.2-16 16l0 48c0 88.4-71.6 160-160 160S32 312.4 32 224l0-48z" />
        </>
      )}
    </svg>
  );
}
