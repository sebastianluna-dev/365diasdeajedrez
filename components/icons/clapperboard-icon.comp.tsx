import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `clapperboard`, in Duotone Light (the default), Duotone Solid,
 * Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function ClapperboardIcon({ className, variant = "duotone-light" }: IconProps) {
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
          <path opacity=".4" d="M32 224l448 0 0 160c0 17.7-14.3 32-32 32L64 416c-17.7 0-32-14.3-32-32l0-160z" />
          <path d="M448 96l-113.4 0-96 96 114.7 0 96-96c-.4 0-.9 0-1.3 0zm-49.4 96l81.4 0 0-64c0-5.1-1.2-9.8-3.3-14.1L398.6 192zM512 192l0 192c0 35.3-28.7 64-64 64L64 448c-35.3 0-64-28.7-64-64L0 128C0 92.7 28.7 64 64 64l384 0c35.3 0 64 28.7 64 64l0 64zM33.4 192l96-96-65.4 0c-17.7 0-32 14.3-32 32l0 64 1.4 0zM32 224l0 160c0 17.7 14.3 32 32 32l384 0c17.7 0 32-14.3 32-32l0-160-448 0zm46.6-32l114.7 0 96-96-114.7 0-96 96z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path opacity=".4" d="M0 160l512 0 0 224c0 35.3-28.7 64-64 64L64 448c-35.3 0-64-28.7-64-64L0 160z" />
          <path d="M422.1 64l-95 95-1 1-92.1 0 96-96 92.1 0zm-28.1 96l86.9-86.9C499.5 84.3 512 104.7 512 128l0 32-118.1 0zm-224-96l92.1 0-95 95-1 1-92.1 0 96-96zm-67.9 0l-95 95-1 1-6.1 0 0-32C0 92.7 28.7 64 64 64l38.1 0z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M448 64c2 0 3.9 .1 5.8 .3l-95.7 95.7 67.9 0 72-72c8.8 11 14 24.9 14 40l0 256c0 35.3-28.7 64-64 64L64 448c-35.3 0-64-28.7-64-64L0 128C0 92.7 28.7 64 64 64l70.1 0-96 96 67.9 0 95-95 1-1 92.1 0-96 96 67.9 0 95-95 1-1 86.1 0z" />
      )}
      {variant === "classic-light" && (
        <path d="M448 96l-113.4 0-96 96 114.7 0 96-96c-.4 0-.9 0-1.3 0zm-49.4 96l81.4 0 0-64c0-5.1-1.2-9.8-3.3-14.1L398.6 192zM512 192l0 192c0 35.3-28.7 64-64 64L64 448c-35.3 0-64-28.7-64-64L0 128C0 92.7 28.7 64 64 64l384 0c35.3 0 64 28.7 64 64l0 64zM33.4 192l96-96-65.4 0c-17.7 0-32 14.3-32 32l0 64 1.4 0zM32 224l0 160c0 17.7 14.3 32 32 32l384 0c17.7 0 32-14.3 32-32l0-160-448 0zm46.6-32l114.7 0 96-96-114.7 0-96 96z" />
      )}
      {variant === "sharp-duotone-light" && (
        <>
          <path opacity=".4" d="M32 224l0 192 448 0 0-192-448 0z" />
          <path d="M334.6 96l-96 96 114.7 0 96-96-114.7 0zM193.4 192l96-96-114.7 0-96 96 114.7 0zM0 224l0-160 512 0 0 384-512 0 0-224zm480 0l-448 0 0 192 448 0 0-192zm0-32l0-81.4-81.4 81.4 81.4 0zM33.4 192l96-96-97.4 0 0 96 1.4 0z" />
        </>
      )}
      {variant === "sharp-light" && (
        <path d="M334.6 96l-96 96 114.7 0 96-96-114.7 0zM193.4 192l96-96-114.7 0-96 96 114.7 0zM0 224l0-160 512 0 0 384-512 0 0-224zm480 0l-448 0 0 192 448 0 0-192zm0-32l0-81.4-81.4 81.4 81.4 0zM33.4 192l96-96-97.4 0 0 96 1.4 0z" />
      )}
    </svg>
  );
}
