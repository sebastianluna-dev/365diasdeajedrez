import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `star-sharp`, in Duotone Light (the default), Duotone Solid
 * or Classic Solid, as `variant` says. Its Duotone Solid drawing is a single
 * layer, drawn at full strength: at 40 % it would read as switched off.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function StarSharpIcon({ className, variant = "duotone-light" }: IconProps) {
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
            d="M43.3 208l126 91c5.5 4 7.9 11.1 5.9 17.6l-43.8 143.9 114.7-89.2c5.8-4.5 13.9-4.5 19.6 0l114.7 89.2-43.8-143.9c-2-6.5 .4-13.6 5.9-17.6l126-91-148.7 0c-7 0-13.1-4.5-15.2-11.1L256 43.6 207.2 196.9C205.1 203.5 199 208 192 208L43.3 208z"
          />
          <path d="M256 43.6L207.2 196.9C205.1 203.5 199 208 192 208l-148.7 0 126 91c5.5 4 7.9 11.1 5.9 17.6l-43.8 143.9 114.7-89.2c5.8-4.5 13.9-4.5 19.6 0l114.7 89.2-43.8-143.9c-2-6.5 .4-13.6 5.9-17.6l126-91-148.7 0c-7 0-13.1-4.5-15.2-11.1L256 43.6zM230.3 18.8C233.9 7.6 244.3 0 256 0s22.1 7.6 25.7 18.8l50 157.2 153.7 0c14.7 0 26.6 11.9 26.6 26.6 0 8.5-4.1 16.6-11 21.6l-130.3 94.1 50.8 167c4.1 13.3-5.9 26.8-19.8 26.8-4.6 0-9.1-1.5-12.7-4.4L256 404.3 123.1 507.6c-3.6 2.8-8.1 4.4-12.7 4.4-13.9 0-23.9-13.4-19.8-26.8l50.8-167-130.3-94.1c-6.9-5-11-13-11-21.6 0-14.7 11.9-26.6 26.6-26.6l153.7 0 50-157.2z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <path d="M278.9 16.7C275.7 6.8 266.5 0 256 0s-19.7 6.8-22.9 16.7L182.5 176 24 176c-10.3 0-19.4 6.5-22.7 16.2s-.1 20.4 8 26.7L140.1 320.7 89.1 480.7c-3.2 10 .5 21 9.1 27s20.2 5.7 28.5-.7L256 406.4 385.3 506.9c8.3 6.5 19.8 6.8 28.5 .7s12.3-16.9 9.1-27L371.9 320.7 502.7 218.9c8.1-6.3 11.3-17 8-26.7S498.3 176 488 176l-158.5 0-50.7-159.3z" />
      )}
      {variant === "classic-solid" && (
        <path d="M278.9 16.7C275.7 6.8 266.5 0 256 0s-19.7 6.8-22.9 16.7L182.5 176 24 176c-10.3 0-19.4 6.5-22.7 16.2s-.1 20.4 8 26.7L140.1 320.7 89.1 480.7c-3.2 10 .5 21 9.1 27s20.2 5.7 28.5-.7L256 406.4 385.3 506.9c8.3 6.5 19.8 6.8 28.5 .7s12.3-16.9 9.1-27L371.9 320.7 502.7 218.9c8.1-6.3 11.3-17 8-26.7S498.3 176 488 176l-158.5 0-50.7-159.3z" />
      )}
    </svg>
  );
}
