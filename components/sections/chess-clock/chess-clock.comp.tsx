"use client";

import { useSyncExternalStore } from "react";
import { ChessClockDesktop } from "./chess-clock-desktop.comp";
import { ChessClockMobile } from "./chess-clock-mobile.comp";

/** El mismo corte que usan chess-clock-desktop.comp.css y chess-clock-mobile.comp.css. */
const MOBILE_QUERY = "(max-width: 766px)";

function subscribe(onChange: () => void): () => void {
  const media = window.matchMedia(MOBILE_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function isMobileNow(): boolean {
  return window.matchMedia(MOBILE_QUERY).matches;
}

/**
 * Las dos variantes se siguen montando —así el servidor puede pintar las dos y
 * el CSS decide cuál se ve sin un salto tras hidratar—, pero sólo UNA tiene el
 * reloj encendido: la que corresponde al ancho actual. Antes las dos contaban
 * en paralelo y las dos capturaban la barra espaciadora.
 *
 * En el servidor se asume escritorio; en cuanto hidrata, `matchMedia` manda.
 */
export function ChessClock() {
  const isMobile = useSyncExternalStore(subscribe, isMobileNow, () => false);

  return (
    <>
      <ChessClockDesktop enabled={!isMobile} />
      <ChessClockMobile enabled={isMobile} />
    </>
  );
}
