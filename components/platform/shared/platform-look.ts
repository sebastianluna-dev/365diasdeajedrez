import { createContext, use } from "react";
import { mdButton } from "@/lib/material/material-classes";

// Which design a popup is drawn in, and with it everything inside it.
//
// WHY THE FRAME DECIDES. A page moved to the new design system (Material 3
// Expressive) draws `.platform-workspace`, and a page is moved whole, never
// half (AGENTS.md). A `<dialog>` stays where it is mounted in the DOM even
// while it stands in the top layer, so `PlatformPopup` and
// `PlatformConfirmPopup` ask their own element, when they open, whether it is
// inside that frame (`lookOf`): every popup of a moved page turns Material at
// once — its own and the shared ones (`EditGame`, `GameSettings`,
// `SaveToStudyPopup`), which are also mounted on pages not yet moved — and no
// host has to say it, so none can forget. The site, `/admin` and the pages
// not yet moved draw no workspace, and their popups stay as they were.
//
// WHY A CONTEXT AS WELL. CSS keyed on the frame could recolour a popup, but
// not change its markup: Material's buttons are classes of their own
// (`mdButton`), and an outlined field says «Opcional» under the control, not
// beside its label. So the popup hands its look down, and the pieces inside
// it — `PlatformFormField`, `PlatformSelect`, `PlatformDatePicker`, the
// content's own buttons through `popupButton` — read it here.

/** `platform`: the platform's own design; `material`: Material 3 Expressive, on a moved page. */
export type PlatformLook = "platform" | "material";

/** The look of the popup a piece is drawn in; `platform` outside any popup. */
export const PlatformLookContext = createContext<PlatformLook>("platform");

/** The look of the popup this piece is drawn in. */
export function usePlatformLook(): PlatformLook {
  return use(PlatformLookContext);
}

/** The frame a page moved to the new design system draws (platform.css). */
const MOVED_PAGE_FRAME = ".platform-workspace";

/** Material's look for an element inside a moved page's frame, the platform's anywhere else. */
export function lookOf(element: Element): PlatformLook {
  return element.closest(MOVED_PAGE_FRAME) ? "material" : "platform";
}

/** The modifier of the dialog frame (platform.css) that draws Material's dialog. */
export const MATERIAL_DIALOG = "platform-dialog_look_material";

/**
 * Whether a popup's dialog has to be drawn again before it is shown: its
 * frame asks for a look it is not drawn in yet. Asked before `flushSync`, so
 * a popup that stays in its look (every popup, after its first opening) never
 * forces a render, which inside an effect React would refuse with a warning.
 */
export function needsLook(dialog: HTMLDialogElement, look: PlatformLook): boolean {
  return dialog.classList.contains(MATERIAL_DIALOG) !== (look === "material");
}

/**
 * What a button of a popup's content is for: `exit` the way out
 * («Cancelar»), `submit` what the popup is for («Guardar»), `destroy` what
 * takes something away for good, `destroy-part` what takes a part of it away
 * and leaves the rest.
 */
export type PopupButtonRole = "exit" | "submit" | "destroy" | "destroy-part";

/**
 * The classes of a button of a popup's content, in the popup's look. The
 * platform's: the secondary, the ink, and the small pills of the danger row
 * (caution and danger). Material's: a text button, a filled one, and the
 * danger row as small outlined ones (`platform-md-error` paints the one that
 * destroys in the error's red, platform.css).
 */
export function popupButton(look: PlatformLook, role: PopupButtonRole): string {
  if (look === "material") {
    if (role === "exit") return mdButton("text");
    if (role === "submit") return mdButton("filled");
    if (role === "destroy") return `${mdButton("outlined", "xs")} platform-md-error`;
    return mdButton("outlined", "xs");
  }
  if (role === "exit") return "platform-button";
  if (role === "submit") return "platform-button platform-button_variant_ink";
  if (role === "destroy") {
    return "platform-button platform-button_variant_danger platform-button_size_sm platform-button_shape_pill";
  }
  return "platform-button platform-button_variant_caution platform-button_size_sm platform-button_shape_pill";
}

/** The class of the icon inside one of those buttons: Material's reads its button's size and colour. */
export function popupButtonIcon(look: PlatformLook): string {
  return look === "material" ? "platform-md-icon" : "platform-button__icon";
}
