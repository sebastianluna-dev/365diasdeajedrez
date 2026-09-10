"use client";

import { useSyncExternalStore } from "react";
import { ChessClockDesktop } from "./chess-clock-desktop.comp";
import { ChessClockMobile } from "./chess-clock-mobile.comp";

/** The same breakpoint chess-clock-desktop.comp.css and chess-clock-mobile.comp.css use. */
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
 * Both variants are still mounted — so the server can render both and the
 * CSS decides which one is visible without a jump after hydration — but only
 * ONE has its clock running: the one matching the current width. Before,
 * both counted in parallel and both captured the space bar.
 *
 * On the server desktop is assumed; as soon as it hydrates, `matchMedia` rules.
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
