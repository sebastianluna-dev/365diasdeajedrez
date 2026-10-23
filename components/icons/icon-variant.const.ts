/** The Font Awesome styles every icon of this folder is drawn in, by their Font Awesome names. */
export const ICON_VARIANTS = [
  "duotone-light",
  "duotone-solid",
  "classic-solid",
  "classic-light",
  "sharp-duotone-light",
  "sharp-light",
  "classic-regular",
  "duotone-regular",
  "sharp-solid",
  "sharp-duotone-solid",
  "sharp-regular",
  "sharp-duotone-regular",
] as const;

export type IconVariant = (typeof ICON_VARIANTS)[number];

/** What every Font Awesome icon of this folder takes. */
export interface IconProps {
  /** Its size and its colour are its caller's stylesheet's. */
  className?: string;
  /** Duotone Light (the default) or any of the other eleven styles, by their Font Awesome names. */
  variant?: IconVariant;
}
