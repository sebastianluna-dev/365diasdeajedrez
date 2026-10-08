import type { IconProps } from "@/components/icons/icon-variant.const";

/**
 * Font Awesome's `paper-plane-top`, in Duotone Light (the default), Duotone
 * Solid, Classic Solid or Classic Light, as `variant` says.
 *
 * Font Awesome Pro 7.3.1 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2026 Fonticons, Inc.
 */
export function PaperPlaneTopIcon({ className, variant = "duotone-light" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="-53.33 -85.33 682.67 682.67"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {variant === "duotone-light" && (
        <>
          <path opacity=".4" d="M69.2 37.5L156 240 516.1 240 69.2 37.5zm0 437.1L516.1 272 156 272 69.2 474.5z" />
          <path d="M156 272L516.1 272 69.2 474.5 156 272zm360.2-32L156 240 69.2 37.5 516.1 240zM34.1 37L128 256 34.1 475c-1.4 3.3-2.1 6.9-2.1 10.5 0 14.5 11.8 26.5 26.3 26.5 3.7 0 7.4-.8 10.9-2.3l485-219.8c13.3-6 21.9-19.3 21.9-33.9s-8.6-27.9-21.9-33.9L69.2 2.3C65.8 .8 62.1 0 58.3 0 43.8 0 32 12 32 26.5 32 30.1 32.7 33.7 34.1 37z" />
        </>
      )}
      {variant === "duotone-solid" && (
        <>
          <path
            opacity=".4"
            d="M32 479c0 18.1 14.7 33 32.8 33 4.7 0 9.4-1 13.7-3L554.2 290c13.3-6.1 21.8-19.4 21.8-34l-448 0-93.2 209.6C33 469.8 32 474.4 32 479z"
          />
          <path d="M78.5 3L554.2 222c13.3 6.1 21.8 19.4 21.8 34L128 256 34.8 46.4C33 42.2 32 37.6 32 33 32 14.8 46.7 0 64.8 0 69.5 0 74.2 1 78.5 3z" />
        </>
      )}
      {variant === "classic-solid" && (
        <path d="M78.5 3L554.2 222c13.3 6.1 21.8 19.4 21.8 34s-8.5 27.9-21.8 34L78.5 509c-4.3 2-9 3-13.7 3-18.1 0-32.8-14.8-32.8-33 0-4.6 1-9.2 2.8-13.4l72-161.9c4.7-10.6 14.9-17.9 26.5-18.9l156.7-13.6c7.9-.7 13.9-7.3 13.9-15.2s-6.1-14.5-13.9-15.2L133.3 227.2c-11.6-1-21.8-8.2-26.5-18.9L34.8 46.4C33 42.2 32 37.6 32 33 32 14.8 46.7 0 64.8 0 69.5 0 74.2 1 78.5 3z" />
      )}
      {variant === "classic-light" && (
        <path d="M156 272L516.1 272 69.2 474.5 156 272zm360.2-32L156 240 69.2 37.5 516.1 240zM34.1 37L128 256 34.1 475c-1.4 3.3-2.1 6.9-2.1 10.5 0 14.5 11.8 26.5 26.3 26.5 3.7 0 7.4-.8 10.9-2.3l485-219.8c13.3-6 21.9-19.3 21.9-33.9s-8.6-27.9-21.9-33.9L69.2 2.3C65.8 .8 62.1 0 58.3 0 43.8 0 32 12 32 26.5 32 30.1 32.7 33.7 34.1 37z" />
      )}
    </svg>
  );
}
