import localFont from "next/font/local";

export const gramatika = localFont({
  src: [
    {
      path: "../public/design-import/assets/fonts/gramatikabold.woff",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-gramatika",
  display: "swap",
});

export const suisseIntl = localFont({
  src: [
    {
      path: "../public/design-import/assets/fonts/suisseintl-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/design-import/assets/fonts/suisseintl-medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/design-import/assets/fonts/suisseintl-bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-suisse",
  display: "swap",
});
