// The class lists of Material 3 Expressive's components (`@material/web`,
// `labs/gb`, imported as plain CSS by the platform's layout). The library
// builds these same lists in Lit directives; the platform renders on the
// server and imports no Lit, so it writes them here, one function per
// component, and a page never spells a Material class by hand.

/** The ripple of pointer and press, and the focus ring outside the box: what every pressable thing of Material carries. */
const PRESSABLE = "ripple focus-ring-outer";

export type MaterialButtonColor = "filled" | "tonal" | "outlined" | "text" | "elevated";
export type MaterialSize = "xs" | "sm" | "md" | "lg" | "xl";

/**
 * A button: `filled` the primary, `tonal` the secondary container, `outlined`,
 * `text` with no box. Its height is the size: 32, 40, 56, 96, 136px.
 */
export function mdButton(color: MaterialButtonColor, size: MaterialSize = "sm"): string {
  return `btn btn-${color} btn-${size} ${PRESSABLE}`;
}

/**
 * A button that is only an icon: `standard` with no box (a bar's), or on a
 * fill; `wide` stretches it into a pill, for keys pressed one after another.
 */
export function mdIconButton(
  color: "standard" | "tonal" | "filled" | "outlined" = "standard",
  size: MaterialSize = "sm",
  width?: "narrow" | "wide",
): string {
  return `icon-btn icon-btn-${color} icon-btn-${size}${width ? ` icon-btn-${width}` : ""} ${PRESSABLE}`;
}

/** A floating action button; `extended` when it carries a label. */
export function mdFab(color: "primary-container" | "secondary-container" | "primary" = "primary-container"): string {
  return `fab fab-${color} ${PRESSABLE}`;
}

/** A card: `outlined` on the panel, `filled` on a container, `elevated` over anything. */
export function mdCard(kind: "outlined" | "filled" | "elevated" = "outlined"): string {
  return `card card-${kind}`;
}

/**
 * A chip: a filter that is chosen (`selected`) or not, or one that only says
 * something (an assist chip, with no ripple since it is not pressed).
 */
export function mdChip(kind: "filter" | "assist", selected = false): string {
  if (kind === "assist") return "chip chip-outlined";
  return `chip chip-filter chip-outlined${selected ? " chip-selected" : ""} ${PRESSABLE}`;
}
