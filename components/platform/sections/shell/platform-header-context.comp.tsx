"use client";

import { createPortal } from "react-dom";
import { useSyncExternalStore, type ReactNode } from "react";

/** The id of the bar's slot for what a page puts in it. */
export const PLATFORM_HEADER_CONTEXT_ID = "platform-header-context";

interface PlatformHeaderContextProps {
  /** What the page puts in the bar: its own controls, never the navigation. */
  children: ReactNode;
  /** Where there is no bar (a story), the controls stay in the page, in a box with this class. */
  inlineClassName?: string;
}

// The slot is drawn by the shell and never moves: nothing to subscribe to.
const subscribe = () => () => {};
const findSlot = () => document.getElementById(PLATFORM_HEADER_CONTEXT_ID);

/**
 * Puts a page's controls in the bar, between the page's name and the tools
 * menu, as Google's products do («Hoy», the arrows and the view of the
 * calendar): a portal into the shell's slot, so the controls keep living in
 * the page that owns their state. A container: its one job is to place what
 * it is given.
 *
 * The server draws nothing (it cannot reach the slot), and the browser, on
 * hydrating, the portal; where there is no slot — a story, a page drawn
 * outside the shell — the controls stay in place, in `inlineClassName`.
 */
export function PlatformHeaderContext({ children, inlineClassName }: PlatformHeaderContextProps) {
  const slot = useSyncExternalStore(subscribe, findSlot, () => undefined);
  if (slot === undefined) return null;
  if (slot === null) return <div className={inlineClassName}>{children}</div>;
  return createPortal(children, slot);
}
