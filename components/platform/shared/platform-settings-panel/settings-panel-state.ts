import { useSyncExternalStore } from "react";

// Whether a page's settings panel is open. It lives on the root, as the side
// column's `data-side-nav` does, so the gear in the bar and the panel's own
// close button — two leaves far apart — hear the same thing, and the panel
// is shown by the stylesheet alone (`:root[data-settings="open"]`), with no
// flash on a reload. It is not kept: a new visit starts with it closed.

/** The root's attribute that says the panel is open. */
export const SETTINGS_ATTRIBUTE = "data-settings";

/** The panel's id, which the gear names in `aria-controls`. */
export const SETTINGS_PANEL_ID = "platform-settings";

function subscribe(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: [SETTINGS_ATTRIBUTE] });
  return () => observer.disconnect();
}

const isOpen = () => document.documentElement.getAttribute(SETTINGS_ATTRIBUTE) === "open";

/** Whether the panel is open, kept in step with the root's attribute; closed on the server. */
export function useSettingsOpen(): boolean {
  return useSyncExternalStore(subscribe, isOpen, () => false);
}

/** Opens or closes the panel. */
export function setSettingsOpen(open: boolean): void {
  if (open) document.documentElement.setAttribute(SETTINGS_ATTRIBUTE, "open");
  else document.documentElement.removeAttribute(SETTINGS_ATTRIBUTE);
}
