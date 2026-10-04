import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * The like on a message of the site's reviews chat, which draws it in Duotone
 * Solid. Font Awesome's `heart`, in Duotone Light (the default), Duotone Solid
 * or Classic Solid, as `variant` says. Its Duotone Solid drawing is a single
 * layer, drawn at full strength: at 40 % it would read as switched off.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function HeartIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 512 512" width="14" height="14" fill="currentColor" aria-hidden="true">
      {variant === "duotone-light" && (
        <>
          <path
            opacity=".4"
            d="M32 165.1c0 55 34.4 107.1 71.8 152.5 42.1 51.2 93.4 96 128.5 122.9 6.2 4.8 14.4 7.5 23.7 7.5s17.4-2.7 23.7-7.5c35.1-26.8 86.4-71.7 128.5-122.9 37.3-45.4 71.8-97.5 71.8-152.5 0-55.9-45.3-101.1-101.1-101.1-32.4 0-62.9 15.6-81.9 41.9l-28 38.7c-3 4.2-7.8 6.6-13 6.6s-10-2.5-13-6.6l-28-38.7C196.1 79.6 165.6 64 133.1 64 77.3 64 32 109.3 32 165.1z"
          />
          <path d="M378.9 64c-32.4 0-62.9 15.6-81.9 41.9l-28 38.7c-3 4.2-7.8 6.6-13 6.6s-10-2.5-13-6.6l-28-38.7 0 0c-19-26.3-49.5-41.9-81.9-41.9-55.9 0-101.1 45.3-101.1 101.1 0 55 34.4 107.1 71.8 152.5 42.1 51.2 93.4 96 128.5 122.9 6.2 4.8 14.4 7.5 23.7 7.5s17.4-2.7 23.7-7.5c35.1-26.8 86.4-71.7 128.5-122.9 37.3-45.4 71.8-97.5 71.8-152.5 0-55.9-45.3-101.1-101.1-101.1zM271 87.1c25-34.6 65.2-55.1 107.9-55.1 73.5 0 133.1 59.6 133.1 133.1 0 67.4-41.6 127.3-79.1 172.8-44.1 53.6-97.3 100.1-133.8 127.9-12.4 9.4-27.6 14.1-43.1 14.1s-30.8-4.6-43.1-14.1C176.4 438 123.2 391.5 79.1 338 41.6 292.4 0 232.5 0 165.1 0 91.6 59.6 32 133.1 32 175.8 32 216 52.5 241 87.1l15 20.7 15-20.7z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <path d="M241 87.1l15 20.7 15-20.7C296 52.5 336.2 32 378.9 32 452.4 32 512 91.6 512 165.1l0 2.6c0 112.2-139.9 242.5-212.9 298.2-12.4 9.4-27.6 14.1-43.1 14.1s-30.8-4.6-43.1-14.1C139.9 410.2 0 279.9 0 167.7l0-2.6C0 91.6 59.6 32 133.1 32 175.8 32 216 52.5 241 87.1z" />
      )}
      {variant === "classic-solid" && (
        <path d="M241 87.1l15 20.7 15-20.7C296 52.5 336.2 32 378.9 32 452.4 32 512 91.6 512 165.1l0 2.6c0 112.2-139.9 242.5-212.9 298.2-12.4 9.4-27.6 14.1-43.1 14.1s-30.8-4.6-43.1-14.1C139.9 410.2 0 279.9 0 167.7l0-2.6C0 91.6 59.6 32 133.1 32 175.8 32 216 52.5 241 87.1z" />
      )}
    </svg>
  );
}
