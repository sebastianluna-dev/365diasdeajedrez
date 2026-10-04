/** The two Font Awesome Duotone weights every icon of this folder is drawn in. */
export const ICON_VARIANTS = ["light", "solid"] as const;

export type IconVariant = (typeof ICON_VARIANTS)[number];

/** What every Font Awesome icon of this folder takes. */
export interface IconProps {
  /** Its size and its colour are its caller's stylesheet's. */
  className?: string;
  /** Duotone Light (the default) or Duotone Solid. */
  variant?: IconVariant;
}
