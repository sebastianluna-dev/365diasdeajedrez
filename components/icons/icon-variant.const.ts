/** The Font Awesome styles every icon of this folder is drawn in, by their Font Awesome names. */
export const ICON_VARIANTS = ["duotone-light", "duotone-solid", "classic-solid", "classic-light"] as const;

export type IconVariant = (typeof ICON_VARIANTS)[number];

/** What every Font Awesome icon of this folder takes. */
export interface IconProps {
  /** Its size and its colour are its caller's stylesheet's. */
  className?: string;
  /** Duotone Light (the default), Duotone Solid, Classic Solid or Classic Light. */
  variant?: IconVariant;
}
